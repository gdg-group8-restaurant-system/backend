import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import MenuItem from "../models/MenuItem.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const clearCart = async (userId) => {
  await Cart.findOneAndUpdate(
    { userId },
    { items: [] },
    { returnDocument: "after", upsert: true },
  );
};

// GET /api/cart
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate(
      "items.menuItemId",
      "name price image isAvailable",
    );

    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    const total = (cart.items || []).reduce((sum, item) => {
      const price = item.menuItemId?.price || 0;
      return sum + price * item.quantity;
    }, 0);

    res.status(200).json({
      success: true,
      cart: {
        _id: cart._id,
        items: cart.items,
        total: parseFloat(total.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("getCart error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch cart." });
  }
};

// POST /api/cart
export const addToCart = async (req, res) => {
  try {
    const { menuItemId, quantity, specialInstructions } = req.body;

    if (!menuItemId || !isValidObjectId(menuItemId)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid menuItemId is required." });
    }

    const qty = Number(quantity ?? 1);
    if (!Number.isInteger(qty) || qty < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Quantity must be an integer >= 1." });
    }

    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found." });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.menuItemId.toString() === menuItemId,
    );

    if (existingItem) {
      existingItem.quantity += qty; // ✅ ADD to quantity, not replace
      if (typeof specialInstructions === "string") {
        existingItem.specialInstructions = specialInstructions.trim();
      }
    } else {
      cart.items.push({
        menuItemId,
        quantity: qty,
        specialInstructions:
          typeof specialInstructions === "string"
            ? specialInstructions.trim()
            : "",
      });
    }

    await cart.save();
    await cart.populate("items.menuItemId", "name price image isAvailable");

    res.status(200).json({
      success: true,
      message: "Item added to cart.",
      cart,
    });
  } catch (error) {
    console.error("addToCart error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to add item to cart." });
  }
};

// PUT /api/cart/:itemId
export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity, specialInstructions } = req.body;

    if (!isValidObjectId(itemId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid cart item id." });
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found." });
    }

    const targetItem = cart.items.id(itemId);
    if (!targetItem) {
      return res
        .status(404)
        .json({ success: false, message: "Cart item not found." });
    }

    if (quantity !== undefined) {
      const qty = Number(quantity);
      if (!Number.isInteger(qty) || qty < 1) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be an integer >= 1.",
        });
      }
      targetItem.quantity = qty;
    }

    if (specialInstructions !== undefined) {
      if (typeof specialInstructions !== "string") {
        return res.status(400).json({
          success: false,
          message: "specialInstructions must be a string.",
        });
      }
      targetItem.specialInstructions = specialInstructions.trim();
    }

    await cart.save();
    await cart.populate("items.menuItemId", "name price image isAvailable");

    res.status(200).json({
      success: true,
      message: "Cart item updated.",
      cart,
    });
  } catch (error) {
    console.error("updateCartItem error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update cart item." });
  }
};

// DELETE /api/cart/:itemId
export const removeItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    if (!isValidObjectId(itemId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid cart item id." });
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found." });
    }

    const targetItem = cart.items.id(itemId);
    if (!targetItem) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart." });
    }

    targetItem.deleteOne();
    await cart.save();
    await cart.populate("items.menuItemId", "name price image isAvailable");

    res.status(200).json({
      success: true,
      message: "Item removed from cart.",
      cart,
    });
  } catch (error) {
    console.error("removeItem error:", error);
    res.status(500).json({ success: false, message: "Failed to remove item." });
  }
};
