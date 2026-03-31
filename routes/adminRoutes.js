import express from "express";
import { getAllOrders, getStats, verifyUser } from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// Protect all admin routes with authMiddleware and adminMiddleware
router.use(authMiddleware, adminMiddleware);

// GET /api/admin/orders
router.get("/orders", getAllOrders);

// GET /api/admin/stats
router.get("/stats", getStats);

// PATCH /api/admin/users/:id/verify
router.patch("/users/:id/verify", verifyUser);

export default router;
