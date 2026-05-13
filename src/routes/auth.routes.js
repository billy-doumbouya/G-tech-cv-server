import { Router } from "express";
import passport from "passport";
import AuthController from "../controllers/AuthController.js";
import { protect } from "../middleware/auth.js";
import { authLimiter, resetLimiter } from "../middleware/rateLimiter.js";
import validate from "../middleware/validate.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
} from "../validators/auth.validator.js";

const router = Router();

// ── Classique ─────────────────────────────────────────────
router.post(
  "/register",
  authLimiter,
  registerRules,
  validate,
  asyncHandler(AuthController.register),
);
router.post(
  "/login",
  authLimiter,
  loginRules,
  validate,
  asyncHandler(AuthController.login),
);
router.post("/logout", asyncHandler(AuthController.logout));

router.post(
  "/forgot-password",
  resetLimiter,
  forgotPasswordRules,
  validate,
  asyncHandler(AuthController.forgotPassword),
);
router.post(
  "/reset-password/:token",
  resetLimiter,
  resetPasswordRules,
  validate,
  asyncHandler(AuthController.resetPassword),
);

// ── Google OAuth ──────────────────────────────────────────
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google`,
    session: false,
  }),
  asyncHandler(AuthController.googleCallback),
);

// ── Protégées ─────────────────────────────────────────────
router.get("/me", protect, asyncHandler(AuthController.me));
router.put("/profile", protect, asyncHandler(AuthController.updateProfile));
router.put(
  "/me/password",
  protect,
  asyncHandler(AuthController.changePassword),
);

export default router;
