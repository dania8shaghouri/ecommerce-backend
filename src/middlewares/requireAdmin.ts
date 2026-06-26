import type { Response, NextFunction } from "express";
import type { ExtendRequest } from "../types/extendedRequest.js";

const requireAdmin = (
  req: ExtendRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    res.status(401).json({
      message: "Unauthorized",
    });

    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({
      message: "Admin access required",
    });

    return;
  }

  next();
};

export default requireAdmin;
