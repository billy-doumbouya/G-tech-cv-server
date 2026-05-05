import { Router } from "express";
import PaymentController from "../controllers/PaymentController.js";
import { protect } from "../middleware/auth.js";
import { paymentLimiter } from "../middleware/rateLimiter.js";
import validate from "../middleware/validate.js";
import asyncHandler from "../utils/asyncHandler.js";
import { initiatePaymentRules } from "../validators/payment.validator.js";

const router = Router();

// ── Webhook public (GuinPay → serveur) ────────────────────
router.post("/webhook", asyncHandler(PaymentController.webhook));

// ── Protégées ─────────────────────────────────────────────
router.use(protect);

router.get("/",                    asyncHandler(PaymentController.list));
router.post("/initiate",           paymentLimiter, initiatePaymentRules, validate, asyncHandler(PaymentController.initiate));
router.get("/:paymentId/verify",   asyncHandler(PaymentController.verify));

export default router;
