import express from "express";
import {
  getFavorites,
  removeFavorite,
  toggleFavorite,
} from "../controllers/favoriteController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import studentMiddleware from "../middleware/studentMiddleware.js";

const favoriteRouter = express.Router();

favoriteRouter.get("/", authMiddleware, studentMiddleware, getFavorites);
favoriteRouter.post("/:menuItemId", authMiddleware, studentMiddleware, toggleFavorite);
favoriteRouter.delete(
  "/:menuItemId",
  authMiddleware,
  studentMiddleware,
  removeFavorite,
);

export default favoriteRouter;
