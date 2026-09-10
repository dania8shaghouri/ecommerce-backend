import type { Request, Response } from "express";
import { getDashboardOverview } from "../services/dashboardService.js";

export const getDashboardOverviewHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const data = await getDashboardOverview();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};
