import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Health check route
app.get("/", (req, res) => {
  res.json({
    message: "Backend server is running! Ready for Task 1–5",
    status: "ok",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

export default app;
