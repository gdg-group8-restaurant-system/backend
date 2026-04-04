import Review from "../models/Review.js";
import Order from "../models/Order.js";
import mongoose from "mongoose";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST /api/reviews
export const submitReview = async (req, res) => {
  try {
    const { orderId, menuItemId, comment } = req.body;
    const userId = req.user.id;

    if (!orderId || !comment) {
      return res
        .status(400)
        .json({ success: false, message: "orderId and comment are required." });
    }

    if (!isValidObjectId(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order id." });
    }

    if (menuItemId && !isValidObjectId(menuItemId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid menu item id." });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    // Guard 1: confirm the referenced orderId belongs to the logged-in student
    if (order.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Order belongs to another user.",
      });
    }

    // Guard 2: confirm the order's status is completed
    if (order.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Review submission blocked for orders that are not completed.",
      });
    }

    if (menuItemId) {
      const reviewedItemExistsInOrder = order.items.some(
        (item) => item._id?.toString() === menuItemId || item.menuItemId?.toString() === menuItemId,
      );

      if (!reviewedItemExistsInOrder) {
        return res.status(400).json({
          success: false,
          message: "menuItemId must belong to the referenced order.",
        });
      }
    }

    const review = new Review({
      userId,
      orderId,
      menuItemId: menuItemId || null,
      comment: comment.trim(),
    });

    await review.save();

    res.status(201).json({
      success: true,
      data: review,
      message: "Review submitted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit review",
      error: error.message,
    });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("userId", "name phoneNumber studentId")
      .populate("orderId", "status createdAt totalPrice")
      .populate("menuItemId", "name category price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews.",
      error: error.message,
    });
  }
};
