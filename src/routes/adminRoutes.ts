import express from "express";
import validateJWT from "../middlewares/validateJWT.js";
import requireAdmin from "../middlewares/requireAdmin.js";
import upload from "../middlewares/uploadMiddleware.js";
import {
  getAdminProductsHandler,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
} from "../controllers/productController.js";
import {
  getAdminOrdersHandler,
  getAdminOrderByIdHandler,
  updateOrderStatusHandler,
  getOrderPaymentMethodHandler,
} from "../controllers/orderController.js";
import {
  getAdminCustomersHandler,
  getAdminCustomerByIdHandler,
} from "../controllers/customerController.js";
import { getDashboardOverviewHandler } from "../controllers/dashboardController.js";
import { getAdminNotificationsHandler } from "../controllers/notificationController.js";
import { generateDescriptionHandler } from "../controllers/productController.js";

const router = express.Router();

// Express fonksiyonları sırayla çalıştırır : İlk middleware
// 1.validateJWT: şunu kontrol eder:bu kullanıcı gerçekten giriş yapmış mı?
// 2.requireAdmin:burada artık şu soruyu soruyoruz:tamam kullanıcı giriş yapmış. Ama admin mi?
router.get(
  "/dashboard",
  validateJWT,
  requireAdmin,
  getDashboardOverviewHandler,
);
router.get(
  "/notifications",
  validateJWT,
  requireAdmin,
  getAdminNotificationsHandler,
);

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

    const urls = files.map((file) => file.path);

    res.status(200).json({ filenames: urls });
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
router.get(
  "/orders/:id/payment-method",
  validateJWT,
  requireAdmin,
  getOrderPaymentMethodHandler,
);
// customers
router.get("/customers", validateJWT, requireAdmin, getAdminCustomersHandler);
router.get(
  "/customers/:id",
  validateJWT,
  requireAdmin,
  getAdminCustomerByIdHandler,
);

router.post(
  "/products/generate-description",
  validateJWT,
  requireAdmin,
  generateDescriptionHandler,
);
export default router;
