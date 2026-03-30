import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import MenuItem from "../models/MenuItem.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Internal helper used by order placement
export const clearCart = async (userId) => {
  await Cart.findOneAndUpdate(
    { userId },
    { items: [] },
    { new: true, upsert: true },
  );
};

// GET /api/cart
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id }).populate(
      "items.menuItemId",
    );

    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
      cart = await Cart.findById(cart._id).populate("items.menuItemId");
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

// POST /api/cart
export const addToCart = async (req, res) => {
  try {
    const { menuItemId, quantity, specialInstructions } = req.body;

    if (!menuItemId || !isValidObjectId(menuItemId)) {
      return res.status(400).json({ message: "Valid menuItemId is required" });
    }

    const qty = Number(quantity ?? 1);
    if (!Number.isInteger(qty) || qty < 1) {
      return res
        .status(400)
        .json({ message: "Quantity must be an integer >= 1" });
    }

    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.menuItemId.toString() === menuItemId,
    );

    if (existingItem) {
      existingItem.quantity = qty;
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
    const populatedCart = await Cart.findById(cart._id).populate(
      "items.menuItemId",
    );
    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: "Failed to add item to cart" });
  }
};

// PUT /api/cart/:itemId
export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity, specialInstructions } = req.body;

    if (!isValidObjectId(itemId)) {
      return res.status(400).json({ message: "Invalid cart item id" });
    }

    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const targetItem = cart.items.id(itemId);
    if (!targetItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    if (quantity !== undefined) {
      const qty = Number(quantity);
      if (!Number.isInteger(qty) || qty < 1) {
        return res
          .status(400)
          .json({ message: "Quantity must be an integer >= 1" });
      }
      targetItem.quantity = qty;
    }

    if (specialInstructions !== undefined) {
      if (typeof specialInstructions !== "string") {
        return res
          .status(400)
          .json({ message: "specialInstructions must be a string" });
      }
      targetItem.specialInstructions = specialInstructions.trim();
    }

    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate(
      "items.menuItemId",
    );
    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: "Failed to update cart item" });
  }
};

// DELETE /api/cart/:itemId
export const removeItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    if (!isValidObjectId(itemId)) {
      return res.status(400).json({ message: "Invalid cart item id" });
    }

    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const targetItem = cart.items.id(itemId);
    if (!targetItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    targetItem.deleteOne();
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate(
      "items.menuItemId",
    );
    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: "Failed to remove item from cart" });
  }
};
