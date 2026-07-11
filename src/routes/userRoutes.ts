import express from "express";
import validateJWT from "../middlewares/validateJWT.js";
import { loginSchema, registerSchema } from "../validation/userValidation.js";
import validateRequest from "../middlewares/validateRequest.js";
import authLimiter from "../middlewares/authLimiter.js";
import {
  registerUser,
  loginUser,
  getOrders,
} from "../controllers/userController.js";

const router = express.Router();

// ---------------- REGISTER ----------------
router.post("/register", authLimiter, validateRequest(registerSchema), registerUser);

// ---------------- LOGIN ----------------
router.post("/login", authLimiter, validateRequest(loginSchema), loginUser);

// ---------------- MY ORDERS ----------------
router.get("/my-orders", validateJWT, getOrders);

// router.get("/my-orders", validateJWT, async (req: ExtendRequest, res) => {
//   try {
//     const userId = req.user?._id;

//     const orders = await getMyOrders({ userId });

//     res.status(200).json(orders);
//   } catch (err: any) {
//     res.status(500).json({
//       message: err.message,
//     });
//   }
// });

export default router;
