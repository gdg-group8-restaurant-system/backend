import mongoose from "mongoose";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import { clearCart } from "./cartController.js";

const statusFlow = ["pending", "preparing", "ready", "completed"];
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST /api/orders
export const placeOrder = async (req, res) => {
  try {
    const user = req.user;
    const { orderNote = "" } = req.body;

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is not verified yet. Please wait for admin approval before placing orders.",
      });
    }

    const cart = await Cart.findOne({ userId: user._id }).populate(
      "items.menuItemId",
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty. Add items before placing an order.",
      });
    }

    // Snapshot cart items at this moment in time
    const orderItems = cart.items.map((item) => ({
      menuItemId: item.menuItemId?._id,
      name: item.menuItemId?.name,
      price: item.menuItemId?.price,
      quantity: item.quantity,
      specialInstructions: item.specialInstructions,
    }));

    const totalPrice = parseFloat(
      orderItems
        .reduce((sum, item) => sum + item.price * item.quantity, 0)
        .toFixed(2),
    );

    // Save order FIRST
    const order = await Order.create({
      userId: user._id,
      items: orderItems,
      totalPrice,
      orderNote,
    });

    // Clear cart ONLY after successful order save
    await clearCart(user._id);

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order,
    });
  } catch (error) {
    console.error("placeOrder error:", error);
    // Cart is NOT cleared if we reach here
    res.status(500).json({ success: false, message: "Failed to place order." });
  }
};

// GET /api/orders/my
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("getMyOrders error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch orders." });
  }
};

// GET /api/orders — admin only
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name phoneNumber studentId isVerified")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("getAllOrders error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch orders." });
  }
};

// PATCH /api/orders/:id/status — admin only
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order id." });
    }

    if (!statusFlow.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${statusFlow.join(", ")}`,
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    const currentIndex = statusFlow.indexOf(order.status);
    const newIndex = statusFlow.indexOf(status);

    if (newIndex <= currentIndex) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from "${order.status}" to "${status}". Status must move forward.`,
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to "${status}".`,
      order,
    });
  } catch (error) {
    console.error("updateStatus error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update status." });
  }
};
