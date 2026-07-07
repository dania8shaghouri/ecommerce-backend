import wishlistModel from "../models/wishlistModel.js";

export const toggleWishlist = async (userId: string, productId: string) => {
  const existing = await wishlistModel.findOne({
    user: userId,
    product: productId,
  });

  if (existing) {
    await wishlistModel.findByIdAndDelete(existing._id);

    return {
      isWishlisted: false,
      message: "Removed from wishlist",
    };
  }

  await wishlistModel.create({
    user: userId,
    product: productId,
  });

  return {
    isWishlisted: true,
    message: "Added to wishlist",
  };
};

export const getWishlist = async (userId: string) => {
  return await wishlistModel
    .find({
      user: userId,
    })
    .populate("product");
};

export const isWishlisted = async (userId: string, productId: string) => {
  const exists = await wishlistModel.exists({
    user: userId,
    product: productId,
  });

  return Boolean(exists);
};
