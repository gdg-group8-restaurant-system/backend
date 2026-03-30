import express from "express";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../controllers/favoriteController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const favoriteRouter = express.Router();

favoriteRouter.get("/", authMiddleware, getFavorites);
(favoriteRouter.post("/:menuItemId", authMiddleware, addFavorite),
  favoriteRouter.delete("/:menuItemId", authMiddleware, removeFavorite));

export default favoriteRouter;
