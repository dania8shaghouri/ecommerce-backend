import express from "express";
import validateJWT from "../middlewares/validateJWT.js";
import requireAdmin from "../middlewares/requireAdmin.js";
import upload from "../middlewares/uploadMiddleware.js";
import {
  getAdminOrderByIdHandler,
  getAdminOrdersHandler,
  updateOrderStatusHandler,
} from "../controllers/orderController.js";
import {
  getAdminProductsHandler,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/dashboard", validateJWT, requireAdmin, (req, res) => {
  res.json({ message: "Admin dashboard data" });
});
// product
router.get("/products", validateJWT, requireAdmin, getAdminProductsHandler);
router.post("/products", validateJWT, requireAdmin, createProductHandler);
router.put("/products/:id", validateJWT, requireAdmin, updateProductHandler);
router.delete("/products/:id", validateJWT, requireAdmin, deleteProductHandler);
router.post(
  "/products/upload",
  validateJWT,
  requireAdmin,
  upload.array("images", 5),
  (req, res) => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const filenames = files.map((file) => file.filename);

    res.status(200).json({ filenames });
  },
);


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
