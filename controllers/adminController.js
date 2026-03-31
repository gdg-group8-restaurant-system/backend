import Order from "../models/Order.js";
import User from "../models/User.js";

// GET /api/admin/orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email phoneNumber isVerified")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
};

// GET /api/admin/stats
export const getStats = async (req, res) => {
  try {
    // 1. Most ordered items: count how many times each menu item appears across all completed orders
    const mostOrderedItems = await Order.aggregate([
      { $match: { status: "completed" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          count: { $sum: "$items.quantity" }, // Counting quantity or appearances? "how many times each menu item appears" - summing quantity makes more sense for "most ordered"
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 2. Daily order volume: group orders by date and count how many were placed per day
    // We group byYYYY-MM-DD
    const dailyOrderVolume = await Order.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        mostOrderedItems: mostOrderedItems.map((v) => ({ name: v._id, count: v.count })),
        dailyOrderVolume: dailyOrderVolume.map((v) => ({ date: v._id, count: v.count })),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats", error: error.message });
  }
};

// PATCH /api/admin/users/:id/verify
export const verifyUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id,
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User verified successfully", data: user });
  } catch (error) {
    res.status(500).json({ message: "Failed to verify user", error: error.message });
  }
};
