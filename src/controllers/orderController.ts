import type { Request, Response } from "express";
import {
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
} from "../services/orderService.js";
import type {
  AdminOrderFilters,
  OrderStatus,
  OrderSort,
} from "../services/orderService.js";

type OrderParams = { id: string };

export const getAdminOrdersHandler = async (req: Request, res: Response) => {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : undefined;
    const status =
      typeof req.query.status === "string"
        ? (req.query.status as OrderStatus)
        : undefined;
    const startDate =
      typeof req.query.startDate === "string" ? req.query.startDate : undefined;
    const endDate =
      typeof req.query.endDate === "string" ? req.query.endDate : undefined;
    const sort =
      typeof req.query.sort === "string"
        ? (req.query.sort as OrderSort)
        : undefined;
    const page =
      typeof req.query.page === "string" ? Number(req.query.page) : 1;
    const limit =
      typeof req.query.limit === "string" ? Number(req.query.limit) : 10;
    const userId =
      typeof req.query.userId === "string" ? req.query.userId : undefined;
    const filters: AdminOrderFilters = { page, limit };

    if (search) filters.search = search;
    if (status) filters.status = status;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (sort) filters.sort = sort;
    if (userId) filters.userId = userId;

    const result = await getAdminOrders(filters);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

export const getAdminOrderByIdHandler = async (
  req: Request<OrderParams>,
  res: Response,
) => {
  try {
    const order = await getAdminOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch order" });
  }
};

export const updateOrderStatusHandler = async (
  req: Request<OrderParams>,
  res: Response,
) => {
  try {
    const { status } = req.body;
    const order = await updateOrderStatus(req.params.id, status);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update order status" });
  }
};
