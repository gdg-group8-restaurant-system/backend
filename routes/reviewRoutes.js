import express from "express";
import { submitReview } from "../controllers/reviewController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/reviews — student auth required
router.post("/", authMiddleware, submitReview);

export default router;
