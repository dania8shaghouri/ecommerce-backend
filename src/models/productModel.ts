import mongoose, { Schema, Document } from "mongoose";

export interface Iproduct extends Document {
  title: string;
  brand: string;
  image: string;
  images: string[];
  cpu: string;
  ram: string;
  storage: string;
  gpu: string;
  price: number;
  stock: number;
  description: string;
}

const productSchema = new Schema<Iproduct>({
  title: { type: String, required: true },
  brand: { type: String, required: true },

  image: { type: String, required: true }, // ana resim
  images: [{ type: String }], // çoklu resim

  cpu: { type: String },
  ram: { type: String },
  storage: { type: String },
  gpu: { type: String },

  description: { type: String },

  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
});

const productModel = mongoose.model<Iproduct>("product", productSchema);
export default productModel;
