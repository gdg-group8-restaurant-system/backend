import Review from "../models/Review.js";
import Order from "../models/Order.js";

// POST /api/reviews
export const submitReview = async (req, res) => {
  try {
    const { orderId, menuItemId, comment } = req.body;
    const userId = req.user.id;

    if (!orderId || !comment) {
      return res.status(400).json({ message: "orderId and comment are required." });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Guard 1: confirm the referenced orderId belongs to the logged-in student
    if (order.userId.toString() !== userId) {
      return res.status(403).json({ message: "Access denied. Order belongs to another user." });
    }

    // Guard 2: confirm the order's status is completed
    if (order.status !== "completed") {
      return res.status(400).json({ message: "Review submission blocked for orders that are not completed." });
    }

    const review = new Review({
      userId,
      orderId,
      menuItemId: menuItemId || null,
      comment
    });

    await review.save();

    res.status(201).json({ success: true, data: review, message: "Review submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit review", error: error.message });
  }
};
