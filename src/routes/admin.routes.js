import { Router } from "express";
import AdminController from "../controllers/AdminController.js";
import CVController from "../controllers/CVController.js";
import PaymentController from "../controllers/PaymentController.js";
import { protect, adminOnly } from "../middleware/auth.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.use(protect, adminOnly);

router.get("/stats",           asyncHandler(AdminController.getStats));
router.get("/users",           asyncHandler(AdminController.getUsers));
router.put("/users/:id",       asyncHandler(AdminController.updateUser));
router.delete("/users/:id",    asyncHandler(AdminController.deleteUser));
router.get("/cvs",             asyncHandler(CVController.adminList));
router.get("/cvs/stats",       asyncHandler(CVController.adminStats));
router.get("/payments",        asyncHandler(PaymentController.adminList));
router.get("/payments/stats",  asyncHandler(PaymentController.adminStats));

export default router;
