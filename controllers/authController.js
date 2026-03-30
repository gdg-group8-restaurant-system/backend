import User from "../models/User.js";
import {
  generateTokens,
  attachRefreshTokenCookie,
} from "../utils/generateToken.js";
import jwt from "jsonwebtoken";

const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  phoneNumber: user.phoneNumber,
  studentId: user.studentId,
  role: user.role,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
});

// ── REGISTER ──────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const { name, phoneNumber, studentId, password } = body;

    if (Object.keys(body).length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or missing JSON body. Set Content-Type to application/json.",
      });
    }

    if (!name || !phoneNumber || !studentId || !password) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required: name, phoneNumber, studentId, password.",
      });
    }

    if (
      typeof name !== "string" ||
      typeof phoneNumber !== "string" ||
      typeof studentId !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid data types. name, phoneNumber, studentId, and password must be strings.",
      });
    }

    const cleanName = name.trim();
    const cleanPhoneNumber = phoneNumber.trim();
    const cleanStudentId = studentId.trim().toUpperCase();

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const existingPhone = await User.findOne({ phoneNumber: cleanPhoneNumber });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "This phone number is already registered.",
      });
    }

    const existingStudentId = await User.findOne({ studentId: cleanStudentId });
    if (existingStudentId) {
      return res.status(400).json({
        success: false,
        message: "This Student ID is already registered.",
      });
    }

    const user = await User.create({
      name: cleanName,
      phoneNumber: cleanPhoneNumber,
      studentId: cleanStudentId,
      password,
      role: "student",
    });

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    attachRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      message:
        "Registration successful! Your account is pending admin verification before you can place orders.",
      accessToken,
      user: buildUserResponse(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      const keyPattern = error.keyPattern || {};
      const keyValue = error.keyValue || {};
      const field = Object.keys(keyPattern)[0] || Object.keys(keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `This ${field === "phoneNumber" ? "phone number" : "Student ID"} is already registered.`,
      });
    }
    console.error("Register error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error. Please try again." });
  }
};

// ── LOGIN ─────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const { phoneNumber, password } = body;

    if (Object.keys(body).length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or missing JSON body. Set Content-Type to application/json.",
      });
    }

    if (!phoneNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "Phone number and password are required.",
      });
    }

    if (typeof phoneNumber !== "string" || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message:
          "Invalid data types. phoneNumber and password must be strings.",
      });
    }

    const cleanPhoneNumber = phoneNumber.trim();

    const user = await User.findOne({ phoneNumber: cleanPhoneNumber }).select(
      "+password +refreshToken",
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone number or password.",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone number or password.",
      });
    }

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    attachRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}! 👋`,
      accessToken,
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error. Please try again." });
  }
};

// ── LOGOUT ────────────────────────────────────────────────────────────────────
const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      await User.findOneAndUpdate(
        { refreshToken: token },
        { refreshToken: null },
      );
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res
      .status(200)
      .json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── REFRESH TOKEN ─────────────────────────────────────────────────────────────
const refreshAccessToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No refresh token. Please log in.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select("+refreshToken");

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token. Please log in again.",
      });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user._id,
      user.role,
    );

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });
    attachRefreshTokenCookie(res, newRefreshToken);

    res.status(200).json({ success: true, accessToken });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Session expired. Please log in again.",
    });
  }
};

// ── GET ME ────────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user: buildUserResponse(user) });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export { register, login, logout, refreshAccessToken, getMe };
