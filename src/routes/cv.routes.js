import { Router } from "express";
import CVController from "../controllers/CVController.js";
import { protect } from "../middleware/auth.js";
import { pdfLimiter } from "../middleware/rateLimiter.js";
import validate from "../middleware/validate.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createCVRules, updateCVRules } from "../validators/cv.validator.js";

const router = Router();

router.use(protect);

router.get("/",                asyncHandler(CVController.list));
router.post("/",               createCVRules, validate, asyncHandler(CVController.create));
router.get("/:id",             asyncHandler(CVController.getOne));
router.put("/:id",             updateCVRules, validate, asyncHandler(CVController.update));
router.delete("/:id",          asyncHandler(CVController.remove));
router.get("/:id/download",    pdfLimiter, asyncHandler(CVController.download));

export default router;
