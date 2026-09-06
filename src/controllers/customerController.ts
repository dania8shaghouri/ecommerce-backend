import type { Request, Response } from "express";
import {
  getAdminCustomers,
  getAdminCustomerById,
} from "../services/customerService.js";
import type {
  AdminCustomerFilters,
  CustomerSort,
} from "../services/customerService.js";

type CustomerParams = { id: string };

export const getAdminCustomersHandler = async (req: Request, res: Response) => {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : undefined;
    const sort =
      typeof req.query.sort === "string"
        ? (req.query.sort as CustomerSort)
        : undefined;
    const page =
      typeof req.query.page === "string" ? Number(req.query.page) : 1;
    const limit =
      typeof req.query.limit === "string" ? Number(req.query.limit) : 10;

    const filters: AdminCustomerFilters = { page, limit };
    if (search) filters.search = search;
    if (sort) filters.sort = sort;

    const result = await getAdminCustomers(filters);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
};

export const getAdminCustomerByIdHandler = async (
  req: Request<CustomerParams>,
  res: Response,
) => {
  try {
    const result = await getAdminCustomerById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch customer" });
  }
};
