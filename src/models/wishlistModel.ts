import mongoose, { Schema, Document } from "mongoose";

export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
}

const wishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    product: {
      type: Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Aynı ürün aynı kullanıcı tarafından yalnızca bir kez eklenebilir
wishlistSchema.index(
  {
    user: 1,
    product: 1,
  },
  {
    unique: true,
  },
);

const wishlistModel = mongoose.model<IWishlist>("Wishlist", wishlistSchema);

export default wishlistModel;
