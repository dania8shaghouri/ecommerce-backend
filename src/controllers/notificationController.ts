import type { Request, Response } from "express";
import { getAdminNotifications } from "../services/notificationService.js";

export const getAdminNotificationsHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const data = await getAdminNotifications();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};
