import express from "express";
import validateJWT from "../middlewares/validateJWT.js";
import requireAdmin from "../middlewares/requireAdmin.js";

const router = express.Router();

router.get(
  "/dashboard",
  validateJWT,
  requireAdmin,
  (req, res) => {
    res.json({ message: "Admin dashboard data" });
  }
);

export default router;