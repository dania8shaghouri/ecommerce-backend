import express from "express";

import validateJWT from "../middlewares/validateJWT.js";

import {
  toggleWishlistController,
  getWishlistController,
  isWishlistedController,
} from "../controllers/wishlistController.js";

const router = express.Router();

router.post("/:productId", validateJWT, toggleWishlistController);

router.get("/", validateJWT, getWishlistController);

router.get("/check/:productId", validateJWT, isWishlistedController);

export default router;
