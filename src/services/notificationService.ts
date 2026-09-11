import { orderModel } from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import { LOW_STOCK_THRESHOLD } from "./productService.js";

export const getAdminNotifications = async () => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [newOrders, lowStockProducts] = await Promise.all([
    orderModel
      .find({ createdAt: { $gte: twentyFourHoursAgo } })
      .populate<{ userId: { firstName: string; lastName: string } }>(
        "userId",
        "firstName lastName",
      )
      .sort({ createdAt: -1 })
      .limit(5),
    productModel
      .find({ stock: { $lte: LOW_STOCK_THRESHOLD } })
      .sort({ stock: 1 })
      .limit(5),
  ]);

  return {
    newOrders: newOrders.map((o) => ({
      _id: o._id,
      orderNumber: o.orderNumber,
      customerName: `${o.userId.firstName} ${o.userId.lastName}`,
      createdAt: o.createdAt,
    })),
    lowStockProducts: lowStockProducts.map((p) => ({
      _id: p._id,
      title: p.title,
      stock: p.stock,
    })),
    totalCount: newOrders.length + lowStockProducts.length,
  };
};
