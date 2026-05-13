import { Router } from "express";
import authRoutes from "./auth.routes.js";
import cvRoutes from "./cv.routes.js";
import paymentRoutes from "./payment.routes.js";
import adminRoutes from "./admin.routes.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

router.use("/auth", authRoutes);
router.use("/cvs", cvRoutes);
router.use("/payments", paymentRoutes);
router.use("/admin", adminRoutes);

router.get("/sitemap.xml", (req, res) => {
  res.sendFile(path.join(__dirname, "../../sitemap.xml"));
});

router.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "G-Tech CV API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
  });
});

export default router;
