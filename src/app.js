import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import { connectDB } from "./config/db.js";
import sessionConfig from "./config/session.js";
import { verifyMailer } from "./config/mailer.js";
import passport from "./config/passport.js";
import { globalLimiter } from "./middleware/rateLimiter.js";
import errorHandler from "./middleware/errorHandler.js";
import routes from "./routes/index.js";
import { startAllJobs } from "./cron/reminderJobs.js";
import logger from "./utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// ── Trust proxy ───────────────────────────────────────────
if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

// ── Sécurité ──────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// ── Body parsing ──────────────────────────────────────────
// Raw body pour le webhook GuinPay (HMAC signature)
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// ── Sanitize MongoDB ──────────────────────────────────────
app.use(mongoSanitize());

// ── Morgan logger ─────────────────────────────────────────
app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", {
    stream: { write: (msg) => logger.http(msg.trim()) },
  }),
);

// ── Rate limiting global ──────────────────────────────────
app.use("/api", globalLimiter);

// ── Fichiers statiques (PDFs) ─────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ── Routes API ────────────────────────────────────────────
app.use("/api", routes);

// ── 404 ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} introuvable`,
  });
});

// ── Error handler global (dernier middleware) ─────────────
app.use(errorHandler);

// ── Démarrage ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await verifyMailer();
  // ── Session ───────────────────────────────────────────────
  app.use(sessionConfig);

  // ── Passport (Google OAuth) ───────────────────────────────
  app.use(passport.initialize());
  app.listen(PORT, () => {
    logger.info(`🚀 Serveur G-Tech CV démarré — port ${PORT}`);
    logger.info(`📡 Env : ${process.env.NODE_ENV || "development"}`);
    logger.info(`🌐 Client : ${process.env.CLIENT_URL}`);
    logger.info(`🗄️  Atlas : cluster0.fzrv5wb.mongodb.net`);
  });

  startAllJobs();
};

startServer();

// ── Erreurs non capturées ─────────────────────────────────
process.on("unhandledRejection", (err) => {
  logger.error(`[unhandledRejection] ${err.message}`);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error(`[uncaughtException] ${err.message}`);
  process.exit(1);
});

export default app;
