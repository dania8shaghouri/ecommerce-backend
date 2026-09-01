import express from "express";
import validateJWT from "../middlewares/validateJWT.js";
import requireAdmin from "../middlewares/requireAdmin.js";
import {
  getAdminOrderByIdHandler,
  getAdminOrdersHandler,
  updateOrderStatusHandler,
} from "../controllers/orderController.js";

const router = express.Router();

router.get("/dashboard", validateJWT, requireAdmin, (req, res) => {
  res.json({ message: "Admin dashboard data" });
});

// order
router.get("/orders", validateJWT, requireAdmin, getAdminOrdersHandler);
router.get("/orders/:id", validateJWT, requireAdmin, getAdminOrderByIdHandler);
router.patch(
  "/orders/:id/status",
  validateJWT,
  requireAdmin,
  updateOrderStatusHandler,
);

export default router;
