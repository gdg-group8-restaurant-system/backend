import express from "express";
import {
  register,
  login,
  logout,
  refreshAccessToken,
  getMe,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import studentVerify from "../middleware/studentVerify.js";

const router = express.Router();

// Public routes
router.post("/register", studentVerify, register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshAccessToken);

// Protected
router.get("/me", authMiddleware, getMe);

export default router;
