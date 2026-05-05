import { transporter } from "../config/mailer.js";
import logger from "../utils/logger.js";
import welcomeTemplate from "../templates/emails/welcome.js";
import resetPasswordTemplate from "../templates/emails/resetPassword.js";
import cvGeneratedTemplate from "../templates/emails/cvGenerated.js";
import paymentReminderTemplate from "../templates/emails/paymentReminder.js";

class EmailService {
  async _send({ to, subject, html, text }) {
    try {
      const info = await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to, subject, html, text,
      });
      logger.info(`Email envoyé à ${to} | ${info.messageId}`);
      return info;
    } catch (err) {
      logger.error(`Échec email à ${to} : ${err.message}`);
      throw err;
    }
  }

  sendWelcome({ to, name }) {
    return this._send({ to, ...welcomeTemplate({ name }) });
  }
  sendResetPassword({ to, name, resetUrl }) {
    return this._send({ to, ...resetPasswordTemplate({ name, resetUrl }) });
  }
  sendCVGenerated({ to, name, cvTitle, downloadUrl }) {
    return this._send({ to, ...cvGeneratedTemplate({ name, cvTitle, downloadUrl }) });
  }
  sendPaymentReminder({ to, name, cvTitle, paymentUrl, completionScore }) {
    return this._send({ to, ...paymentReminderTemplate({ name, cvTitle, paymentUrl, completionScore }) });
  }
}

export default new EmailService();
