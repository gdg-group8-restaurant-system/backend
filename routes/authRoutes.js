const express = require("express");
const {
  register,
  login,
  logout,
  refreshAccessToken,
  getMe,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const studentVerify = require("../middleware/studentVerify");

const router = express.Router();

// Public routes
router.post("/register", studentVerify, register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshAccessToken);

// Protected — must send Authorization: Bearer <accessToken>
router.get("/me", authMiddleware, getMe);

module.exports = router;
