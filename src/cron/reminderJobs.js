import cron from "node-cron";
import CV from "../models/CV.js";
import Payment from "../models/Payment.js";
import CVService from "../services/CVService.js";
import EmailService from "../services/EmailService.js";
import logger from "../utils/logger.js";

// ── JOB 1 : Rappel paiement — chaque jour à 10h ───────────
const paymentReminderJob = cron.schedule(
  "0 10 * * *",
  async () => {
    logger.info("[CRON] paymentReminderJob — démarrage");
    try {
      const cvs = await CVService.getDraftCVsForReminder();
      logger.info(`[CRON] ${cvs.length} CVs éligibles`);

      let sent = 0;
      for (const cv of cvs) {
        if (!cv.user?.email) continue;
        try {
          await EmailService.sendPaymentReminder({
            to: cv.user.email,
            name: cv.user.name,
            cvTitle: cv.title,
            paymentUrl: `${process.env.FRONTEND_URL}/payment/${cv._id}`,
            completionScore: cv.completionScore,
          });
          await CV.findByIdAndUpdate(cv._id, { paymentReminderSentAt: new Date() });
          sent++;
        } catch (err) {
          logger.warn(`[CRON] Email non envoyé à ${cv.user.email} : ${err.message}`);
        }
      }
      logger.info(`[CRON] paymentReminderJob — ${sent}/${cvs.length} rappels envoyés`);
    } catch (err) {
      logger.error(`[CRON] paymentReminderJob erreur : ${err.message}`);
    }
  },
  { scheduled: false }
);

// ── JOB 2 : Rappel complétion — chaque lundi à 9h ─────────
const completionReminderJob = cron.schedule(
  "0 9 * * 1",
  async () => {
    logger.info("[CRON] completionReminderJob — démarrage");
    try {
      const twoDaysAgo  = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const cvs = await CV.find({
        status: "draft",
        completionScore: { $lt: 40, $gt: 5 },
        createdAt: { $lt: twoDaysAgo },
        $or: [
          { completionReminderSentAt: null },
          { completionReminderSentAt: { $lt: sevenDaysAgo } },
        ],
      }).populate("user", "name email");

      for (const cv of cvs) {
        if (!cv.user?.email) continue;
        try {
          await EmailService.sendPaymentReminder({
            to: cv.user.email,
            name: cv.user.name,
            cvTitle: cv.title,
            paymentUrl: `${process.env.FRONTEND_URL}/editor/${cv._id}`,
            completionScore: cv.completionScore,
          });
          await CV.findByIdAndUpdate(cv._id, { completionReminderSentAt: new Date() });
        } catch (err) {
          logger.warn(`[CRON] Rappel complétion non envoyé : ${err.message}`);
        }
      }
      logger.info("[CRON] completionReminderJob — terminé");
    } catch (err) {
      logger.error(`[CRON] completionReminderJob erreur : ${err.message}`);
    }
  },
  { scheduled: false }
);

// ── JOB 3 : Expiration paiements pending > 24h — 2h du matin
const expiredPaymentsJob = cron.schedule(
  "0 2 * * *",
  async () => {
    logger.info("[CRON] expiredPaymentsJob — démarrage");
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const result = await Payment.updateMany(
        { status: "pending", createdAt: { $lt: oneDayAgo } },
        { status: "failed", failedAt: new Date(), failureReason: "Expiré — délai dépassé (24h)" }
      );
      logger.info(`[CRON] expiredPaymentsJob — ${result.modifiedCount} paiements expirés`);
    } catch (err) {
      logger.error(`[CRON] expiredPaymentsJob erreur : ${err.message}`);
    }
  },
  { scheduled: false }
);

export const startAllJobs = () => {
  paymentReminderJob.start();
  completionReminderJob.start();
  expiredPaymentsJob.start();
  logger.info("✅ Cron jobs démarrés : paymentReminder · completionReminder · expiredPayments");
};
