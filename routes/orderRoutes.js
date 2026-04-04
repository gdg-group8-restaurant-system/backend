import express from "express";
import {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateStatus,
} from "../controllers/orderController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import studentMiddleware from "../middleware/studentMiddleware.js";

const router = express.Router();

// Student routes
router.post("/", authMiddleware, studentMiddleware, placeOrder);
router.get("/my", authMiddleware, studentMiddleware, getMyOrders);

// Admin routes
router.get("/", authMiddleware, adminMiddleware, getAllOrders);
router.patch("/:id/status", authMiddleware, adminMiddleware, updateStatus);

export default router;
