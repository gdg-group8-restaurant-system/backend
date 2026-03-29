import { Favorite } from "../models/Favorite.js";

export const getFavorites = async (req, res, next) => {
  // code
};
export const addFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { menuItemId } = req.params;
    const favoriteItem = await Favorite.findOne({
      userId: userId,
      menuItemId: menuItemId,
    });
    if (favoriteItem) {
      await Favorite.findOneAndDelete({ _id: favoriteItem._id });
      return res.status(200).json({
        success: true,
        message: "Item removed from favorite",
      });
    }
    const newFavorite = await Favorite.create({
      userId: userId,
      menuItemId: menuItemId,
    });
    return res.status(201).json({
      success: true,
      message: "Item added to favorite.",
    });
  } catch (err) {
    next(err);
  }
};
export const removeFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {menuItemId} = req.params;
    const favoriteItem = await Favorite.findOne({
      userId: userId,
      menuItemId: menuItemId,
    });
    if (!favoriteItem) {
      const error = new Error("Item not found");
      error.statusCode = 404;
      throw error;
    }
    await Favorite.findOneAndDelete({ _id:favoriteItem._id});
    res.status(200).json({
        success:true,
        message:'Item removed from favorite'
    })
  } catch (err) {
    next(err);
  }
};
