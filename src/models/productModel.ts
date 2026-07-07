import mongoose, { Schema, Document } from "mongoose";

export interface Iproduct extends Document {
  title: string;
  brand: string;
  category: string;

  image: string;
  images: string[];

  description?: string;

  // Laptop
  cpu?: string;
  ram?: string;
  storage?: string;
  gpu?: string;

  // Monitor
  resolution?: string;
  refreshRate?: string;
  panel?: string;
  size?: string;

  // Gaming
  type?: string;
  connectivity?: string;
  switches?: string;
  dpi?: string;
  rgb?: boolean;

  // Storage
  capacity?: string;
  interface?: string;
  readSpeed?: string;

  price: number;
  stock: number;

  rating: number;
  reviewCount: number;

  isFeatured: boolean;
}

const productSchema = new Schema<Iproduct>({
  title: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },

  image: { type: String, required: true },
  images: [{ type: String }],

  description: { type: String },

  // Laptop
  cpu: { type: String },
  ram: { type: String },
  storage: { type: String },
  gpu: { type: String },

  // Monitor
  resolution: { type: String },
  refreshRate: { type: String },
  panel: { type: String },
  size: { type: String },

  // Gaming
  type: { type: String },
  connectivity: { type: String },
  switches: { type: String },
  dpi: { type: String },
  rgb: { type: Boolean },

  // Storage
  capacity: { type: String },
  interface: { type: String },
  readSpeed: { type: String },

  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },

  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },

  isFeatured: { type: Boolean, default: false },
});

const productModel = mongoose.model<Iproduct>("product", productSchema);

export default productModel;
