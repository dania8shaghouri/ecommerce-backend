import express from "express";

import {
  getProducts,
  getCategories,
  getProduct,
  getBrands,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);

router.get("/categories", getCategories);

router.get("/brands", getBrands);

router.get("/:id", getProduct);

export default router;
