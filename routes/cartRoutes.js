import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeItem,
} from "../controllers/cartController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import studentMiddleware from "../middleware/studentMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, studentMiddleware, getCart);
router.post("/", authMiddleware, studentMiddleware, addToCart);
router.put("/:itemId", authMiddleware, studentMiddleware, updateCartItem);
router.delete("/:itemId", authMiddleware, studentMiddleware, removeItem);

router.delete("/", authMiddleware, studentMiddleware, (req, res) => {
  res.status(403).json({
    success: false,
    message: "Cart is cleared automatically after placing an order.",
  });
});

export default router;
