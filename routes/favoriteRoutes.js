import express from "express";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../controllers/favoriteController.js";
import { fakeAuthMiddleware } from "../middlewares/authmiddleware.js";

const favoriteRouter = express.Router();

favoriteRouter.get("/", fakeAuthMiddleware, getFavorites);
(favoriteRouter.post("/:menuItemId", fakeAuthMiddleware, addFavorite),
  favoriteRouter.delete("/:menuItemId", fakeAuthMiddleware, removeFavorite));

export default favoriteRouter;
