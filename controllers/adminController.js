import Order from "../models/Order.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { getAllReviews } from "./reviewController.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/admin/orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name phoneNumber studentId isVerified")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders.",
      error: error.message,
    });
  }
};

// GET /api/admin/stats
export const getStats = async (req, res) => {
  try {
    const mostOrderedItems = await Order.aggregate([
      { $match: { status: "completed" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          count: { $sum: "$items.quantity" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const dailyOrderVolume = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        mostOrderedItems: mostOrderedItems.map((v) => ({
          name: v._id,
          count: v.count,
        })),
        dailyOrderVolume: dailyOrderVolume.map((v) => ({
          date: v._id,
          count: v.count,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch stats.",
      error: error.message,
    });
  }
};

export { getAllReviews };

// PATCH /api/admin/users/:id/verify
export const verifyUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user id." });
    }

    const user = await User.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (user.role !== "student") {
      return res.status(400).json({
        success: false,
        message: "Only student accounts can be verified.",
      });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Student verified successfully.",
      data: {
        id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        studentId: user.studentId,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to verify user.",
      error: error.message,
    });
  }
};
