import type { Request, Response } from "express";
import { getDashboardOverview } from "../services/dashboardService.js";

const ALLOWED_PERIODS = [7, 30, 90];

export const getDashboardOverviewHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const periodParam =
      typeof req.query.period === "string" ? Number(req.query.period) : 30;
    const days = ALLOWED_PERIODS.includes(periodParam) ? periodParam : 30;

    const data = await getDashboardOverview(days);
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};
