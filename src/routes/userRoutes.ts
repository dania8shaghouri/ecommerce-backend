import express from "express";
import { getMyOrders, login, register } from "../services/userService.js";
import validateJWT from "../middlewares/validateJWT.js";
import type { ExtendRequest } from "../types/extendedRequest.js";

const router = express.Router();

// ---------------- REGISTER ----------------
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const result = await register({
      firstName,
      lastName,
      email,
      password,
    });

    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({
      message: err.message,
    });
  }
});

// ---------------- LOGIN ----------------
router.post("/login", async (req, res) => {
  try {
    console.log("LOGIN BODY:", req.body);
    const result = await login(req.body);

    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({
      message: err.message,
    });
  }
});

// ---------------- MY ORDERS ----------------
router.get("/my-orders", validateJWT, async (req: ExtendRequest, res) => {
  try {
    const userId = req.user?._id;

    const orders = await getMyOrders({ userId });

    res.status(200).json(orders);
  } catch (err: any) {
    res.status(500).json({
      message: err.message,
    });
  }
});

export default router;
