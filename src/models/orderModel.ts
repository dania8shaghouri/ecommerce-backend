import mongoose, { Schema } from "mongoose";
import type { ObjectId, Document } from "mongoose";

/* ------------------ ORDER ITEM ------------------ */
export interface IOrderItem {
  productTitle: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productTitle: { type: String, required: true },
  productImage: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

/* ------------------ SHIPPING ------------------ */
export interface IShipping {
  fullName: string;
  phone: string;
  city: string;
  address: string;
}

const ShippingSchema = new Schema<IShipping>({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
});

/* ------------------ ORDER ------------------ */
export interface IOrder extends Document {
  orderNumber: string;
  orderItems: IOrderItem[];
  total: number;
  shipping: IShipping;
  userId: ObjectId | string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "unpaid" | "paid" | "failed" | "refunded";
  stripeSessionId?: string;

  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, unique: true },
    orderItems: { type: [OrderItemSchema], required: true },
    total: { type: Number, required: true },

    shipping: { type: ShippingSchema, required: true },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed", "refunded"],
      default: "unpaid",
    },
    stripeSessionId: { type: String },
  },
  {
    timestamps: true, // createdAt & updatedAt
  },
);

export const orderModel = mongoose.model<IOrder>("Order", OrderSchema);
