import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"

// Import routes
// import cartRoutes from "./routes/cartRoutes.js";
// import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js"; // ← ADD THIS
import favoriteRouter from "./routes/favoriteRoutes.js";

const app = express();

// Global middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true, // ← IMPORTANT: allows cookies to be sent (needed for refresh token)
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

// ROUTES
app.use("/api/auth", authRoutes); // ← ADD THIS
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/favorites", favoriteRouter)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

export default app;
