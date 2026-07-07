import type { Response } from "express";

import {
  toggleWishlist,
  getWishlist,
  isWishlisted,
} from "../services/wishlistService.js";

import type { ExtendRequest } from "../types/extendedRequest.js";

export const toggleWishlistController = async (
  req: ExtendRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { productId } = req.params;

    if (!productId || Array.isArray(productId)) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }

    const result = await toggleWishlist(req.user._id.toString(), productId);

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const getWishlistController = async (
  req: ExtendRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const wishlist = await getWishlist(req.user._id.toString());

    return res.status(200).json(wishlist);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const isWishlistedController = async (
  req: ExtendRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { productId } = req.params;

    if (!productId || Array.isArray(productId)) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }

    const isWishlistedResult = await isWishlisted(
      req.user._id.toString(),
      productId,
    );

    return res.status(200).json({
      isWishlisted: isWishlistedResult,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
