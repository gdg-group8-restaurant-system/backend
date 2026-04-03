import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import favoriteRouter from "./routes/favoriteRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

// Global middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Health check route
app.get("/", (req, res) => {
  res.json({
    message: "Backend server is running! Ready for Task 1–5",
    status: "ok",
  });
});
// API specific health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy and online.",
    timestamp: new Date().toISOString(),
  });
});
// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/favorites", favoriteRouter);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

export default app;
