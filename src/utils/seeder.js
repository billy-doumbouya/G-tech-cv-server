import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import CV from "../models/CV.js";
import Payment from "../models/Payment.js";
import logger from "./logger.js";

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  logger.info("Atlas connecté pour le seeding...");

  await Promise.all([User.deleteMany(), CV.deleteMany(), Payment.deleteMany()]);
  logger.info("Collections nettoyées");

  const admin = await User.create({
    name: "Admin G-Tech",
    email: "admin@g-tech.academy",
    password: "admin123",
    role: "admin",
    plan: "enterprise",
  });

  const user = await User.create({
    name: "Billy Doumbouya",
    email: "billy@g-tech.academy",
    password: "test123",
    phone: "+224 620 00 00 00",
    plan: "premium",
  });

  const cv1 = await CV.create({
    user: user._id,
    title: "Développeur Fullstack React",
    templateId: "modern-tech",
    status: "paid",
    personalInfo: {
      firstName: "Billy", lastName: "Doumbouya",
      jobTitle: "Développeur Fullstack",
      email: "billy@g-tech.academy",
      phone: "+224 620 00 00 00",
      location: "Conakry, Guinée",
      summary: "Développeur passionné avec 3 ans d'expérience en React et Node.js.",
    },
    experiences: [{
      company: "G-Tech Academy", position: "Lead Developer",
      startDate: "Jan 2022", endDate: "", current: true,
      description: "Développement de la plateforme CV en ligne.",
    }],
    education: [{ school: "Université Gamal Abdel Nasser", degree: "Licence Informatique", year: "2021", mention: "Bien" }],
    skills: [{ name: "React.js", level: 90 }, { name: "Node.js", level: 80 }, { name: "MongoDB", level: 75 }],
    languages: [{ name: "Français", level: "Courant" }, { name: "Anglais", level: "Intermédiaire" }],
  });

  await CV.create({
    user: user._id,
    title: "Architecte Solution",
    templateId: "corporate",
    status: "draft",
    completionScore: 65,
    personalInfo: { firstName: "Billy", lastName: "Doumbouya", jobTitle: "Architecte Solution", email: "billy@g-tech.academy" },
  });

  await Payment.create({
    user: user._id, cv: cv1._id,
    amount: 50000, status: "confirmed",
    method: "orange_money",
    phoneNumber: "+224 620 00 00 00",
    cvTitle: cv1.title,
    pspReference: "mock_pay_001",
    confirmedAt: new Date(),
  });

  logger.info("✅ Seed terminé !");
  logger.info("👤 Admin : admin@g-tech.academy / admin123");
  logger.info("👤 User  : billy@g-tech.academy / test123");

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  logger.error(`Seed échoué : ${err.message}`);
  process.exit(1);
});
