import mongoose from "mongoose";
import { Favorite } from "../models/Favorite.js";
import MenuItem from "../models/MenuItem.js";

export const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await Favorite.find({ userId }).populate(
      "menuItemId",
      "name price image description",
    );

    res.status(200).json({
      success: true,
      count: favorites.length,
      data: favorites,
    });
  } catch (err) {
    console.error("Error in getFavorites:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch favorites",
    });
  }
};

export const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { menuItemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid menu item ID",
      });
    }

    const existingFavorite = await Favorite.findOne({ userId, menuItemId });

    if (existingFavorite) {
      await Favorite.findOneAndDelete({ _id: existingFavorite._id });
      return res.status(200).json({
        success: true,
        message: "Item removed from favorites",
      });
    }

    const menuItemExists = await MenuItem.findById(menuItemId);
    if (!menuItemExists) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    await Favorite.create({ userId, menuItemId });

    res.status(201).json({
      success: true,
      message: "Item added to favorites",
    });
  } catch (err) {
    console.error("Error in toggleFavorite:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle favorite",
    });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { menuItemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid menu item ID",
      });
    }

    const favoriteItem = await Favorite.findOne({ userId, menuItemId });

    if (!favoriteItem) {
      return res.status(404).json({
        success: false,
        message: "Favorite item not found",
      });
    }

    await Favorite.findOneAndDelete({ _id: favoriteItem._id });

    res.status(200).json({
      success: true,
      message: "Item removed from favorites",
    });
  } catch (err) {
    console.error("Error in removeFavorite:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to remove favorite",
    });
  }
};
