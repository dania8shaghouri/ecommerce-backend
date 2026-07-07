import type { Request, Response } from "express";

type ProductParams = {
  id: string;
};

import {
  getAllProducts,
  getProductById,
  getProductCategories,
  getProductBrands,
} from "../services/productService.js";

import type {
  ProductFilters,
  ProductSort,
} from "../services/productService.js";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const category =
      typeof req.query.category === "string"
        ? req.query.category.split(",")
        : [];

    const brand =
      typeof req.query.brand === "string" ? req.query.brand.split(",") : [];

    const minPrice =
      typeof req.query.minPrice === "string"
        ? Number(req.query.minPrice)
        : undefined;

    const maxPrice =
      typeof req.query.maxPrice === "string"
        ? Number(req.query.maxPrice)
        : undefined;

    const inStock = req.query.inStock === "true";

    const sort =
      typeof req.query.sort === "string"
        ? (req.query.sort as ProductSort)
        : undefined;
    const page =
      typeof req.query.page === "string" ? Number(req.query.page) : 1;

    const limit =
      typeof req.query.limit === "string" ? Number(req.query.limit) : 4;

    const filters: ProductFilters = {
      category,
      brand,
    };

    if (minPrice !== undefined) {
      filters.minPrice = minPrice;
    }

    if (maxPrice !== undefined) {
      filters.maxPrice = maxPrice;
    }
    if (inStock) {
      filters.inStock = true;
    }
    if (sort) {
      filters.sort = sort;
    }
    filters.page = page;
    filters.limit = limit;

    const products = await getAllProducts(filters);

    res.status(200).json(products);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await getProductCategories();

    res.status(200).json(categories);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch categories",
    });
  }
};

export const getProduct = async (
  req: Request<ProductParams>,
  res: Response,
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Product id is required",
      });
    }

    const product = await getProductById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getBrands = async (req: Request, res: Response) => {
  try {
    const brands = await getProductBrands();

    res.status(200).json(brands);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch brands",
    });
  }
};
