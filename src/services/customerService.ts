import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import { orderModel } from "../models/orderModel.js";

export type CustomerSort =
  | "name-asc"
  | "newest"
  | "oldest"
  | "spent-desc"
  | "orders-desc";

export interface AdminCustomerFilters {
  search?: string;
  sort?: CustomerSort;
  page?: number;
  limit?: number;
}

export const getAdminCustomers = async (filters?: AdminCustomerFilters) => {
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 10;
  const skip = (page - 1) * limit;

  const matchStage: Record<string, unknown> = { role: "customer" };

  if (filters?.search) {
    matchStage.$or = [
      { firstName: { $regex: filters.search, $options: "i" } },
      { lastName: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
    ];
  }

  const sortStage: Record<string, 1 | -1> = (() => {
    switch (filters?.sort) {
      case "name-asc":
        return { firstName: 1 };
      case "oldest":
        return { createdAt: 1 };
      case "spent-desc":
        return { totalSpent: -1 };
      case "orders-desc":
        return { totalOrders: -1 };
      default:
        return { createdAt: -1 };
    }
  })();

  //   $match — tıpkı .find()'daki filtre gibi
  //  ama aggregation'ın ilk adımı. Sadece role: "customer" olanları alıyoruz
  // (admin kullanıcıları listeye karışmasın
  const pipeline = [
    { $match: matchStage },
    // lookup Her user için, orders koleksiyonunda userId'si bu user'ın _id'sine eşit
    // olan tüm siparişleri bul, orders adlı yeni bir alana geçici olarak
    // ekle"
    {
      $lookup: {
        from: "orders",
        localField: "_id",
        foreignField: "userId",
        as: "orders",
      },
    },
    // $addFields + $size — orders dizisinin uzunluğunu
    // $filter + $map + $sum (totalSpent için): Burada özellikle sadece paymentStatus: "paid" olan siparişleri filtreleyip topluyoruz
    {
      $addFields: {
        totalOrders: { $size: "$orders" },
        totalSpent: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: "$orders",
                  as: "o",
                  cond: { $eq: ["$$o.paymentStatus", "paid"] },
                },
              },
              as: "paidOrder",
              in: "$$paidOrder.total",
            },
          },
        },
      },
    },
    // $project: { password: 0, orders: 0 } — iki şeyi çıkarıyoruz:
    // password (asla frontend'e sızmamalı) ve geçici orders dizisinin kendisi
    // (zaten totalOrders/totalSpent'i hesapladık
    { $project: { password: 0, orders: 0 } },
    { $sort: sortStage },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const result = await userModel.aggregate(pipeline);

  const customers = result[0]?.data ?? [];
  const totalCustomers = result[0]?.totalCount[0]?.count ?? 0;

  return {
    customers,
    totalCustomers,
    totalPages: Math.ceil(totalCustomers / limit),
    currentPage: page,
  };
};

export const getAdminCustomerById = async (id: string) => {
  const customer = await userModel.findById(id).select("-password");
  if (!customer) return null;

  const orders = await orderModel.find({ userId: id }).sort({ createdAt: -1 });

  const totalOrders = orders.length;
  const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
  const totalSpent = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const averageOrderValue =
    paidOrders.length > 0 ? totalSpent / paidOrders.length : 0;

  const latestOrder = orders[0];

  return {
    customer,
    summary: { totalOrders, totalSpent, averageOrderValue },
    shipping: latestOrder?.shipping ?? null,
  };
};
