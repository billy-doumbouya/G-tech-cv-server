import nodemailer from "nodemailer";
import logger from "../utils/logger.js";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT),
  secure: process.env.MAIL_PORT === "465",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const verifyMailer = async () => {
  try {
    await transporter.verify();
    logger.info("✅ Nodemailer connecté et prêt");
  } catch (err) {
    logger.warn(`Nodemailer non disponible : ${err.message}`);
  }
};

export { transporter, verifyMailer };
