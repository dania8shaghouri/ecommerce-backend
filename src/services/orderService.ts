import { orderModel, type IOrder } from "../models/orderModel.js";
import userModel from "../models/userModel.js";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
export type OrderSort = "newest" | "oldest" | "total-asc" | "total-desc";

export interface AdminOrderFilters {
  search?: string;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  sort?: OrderSort;
  userId?: string;
  page?: number;
  limit?: number;
}
// Admin için siparişleri MongoDB'den getir
export const getAdminOrders = async (filters?: AdminOrderFilters) => {
  const query: Record<string, unknown> = {};
  const sortQuery: Record<string, 1 | -1> = {};

  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 10;
  const skip = (page - 1) * limit;

  if (filters?.status) {
    query.status = filters.status;
  }
  if (filters?.userId) {
    query.userId = filters.userId;
  }

  if (filters?.startDate || filters?.endDate) {
    const createdAt: Record<string, Date> = {};
    if (filters.startDate) createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) createdAt.$lte = new Date(filters.endDate);
    query.createdAt = createdAt;
  }

  if (filters?.search) {
    const matchingUsers = await userModel
      .find({
        $or: [
          { firstName: { $regex: filters.search, $options: "i" } },
          { lastName: { $regex: filters.search, $options: "i" } },
          { email: { $regex: filters.search, $options: "i" } },
        ],
      })
      .select("_id");

    const userIds = matchingUsers.map((u) => u._id);

    query.$or = [
      { orderNumber: { $regex: filters.search, $options: "i" } },
      { userId: { $in: userIds } },
    ];
  }

  switch (filters?.sort) {
    case "oldest":
      sortQuery.createdAt = 1;
      break;
    case "total-asc":
      sortQuery.total = 1;
      break;
    case "total-desc":
      sortQuery.total = -1;
      break;
    default:
      sortQuery.createdAt = -1;
  }

  const totalOrders = await orderModel.countDocuments(query);

  const orders = await orderModel
    .find(query)
    .populate("userId", "firstName lastName email")
    .sort(sortQuery)
    .skip(skip)
    .limit(limit);

  return {
    orders,
    totalOrders,
    totalPages: Math.ceil(totalOrders / limit),
    currentPage: page,
  };
};

export const getAdminOrderById = async (id: string) => {
  return orderModel.findById(id).populate("userId", "firstName lastName email");
};

export const updateOrderStatus = async (id: string, status: OrderStatus) => {
  return orderModel.findByIdAndUpdate(id, { status }, { new: true });
};
