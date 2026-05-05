import { Router } from "express";
import authRoutes    from "./auth.routes.js";
import cvRoutes      from "./cv.routes.js";
import paymentRoutes from "./payment.routes.js";
import adminRoutes   from "./admin.routes.js";

const router = Router();

router.use("/auth",     authRoutes);
router.use("/cvs",      cvRoutes);
router.use("/payments", paymentRoutes);
router.use("/admin",    adminRoutes);

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
