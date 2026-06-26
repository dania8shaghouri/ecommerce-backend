import express from "express";
import {
  addItemToCart,
  getActiveCartForUser,
  updateItemInCart,
  deleteItemInCart,
  clearCart,
  checkout,
} from "../services/cartService.js";
import validateJwt from "../middlewares/validateJWT.js";
import type { ExtendRequest } from "../types/extendedRequest.js";

const router = express.Router();

router.get("/", validateJwt, async (req: ExtendRequest, res) => {
  try {
    const userId = req?.user?._id;
    const cart = await getActiveCartForUser({ userId, populateProduct: true });
    res.status(200).send(cart);
  } catch (err) {
    res.status(500).send("SomeThing went wrong");
  }
});

router.delete("/", validateJwt, async (req: ExtendRequest, res) => {
  try {
    const userId = req?.user?._id;
    const response = await clearCart({ userId });
    res.status(response.statusCode).send(response.data);
  } catch (err) {
    res.status(500).send("SomeThing went wrong");
  }
});

router.post("/items", validateJwt, async (req: ExtendRequest, res) => {
  try {
    const userId = req?.user?._id;
    const { productId, quantity } = req.body;
    const response = await addItemToCart({ userId, productId, quantity });
    res.status(response.statusCode).send(response.data);
  } catch {
    res.status(500).send("SomeThing went wrong");
  }
});

router.put("/items", validateJwt, async (req: ExtendRequest, res) => {
  const userId = req?.user?._id;
  const { productId, quantity } = req.body;
  const response = await updateItemInCart({ userId, productId, quantity });
  res.status(response.statusCode).send(response.data);
});

router.delete(
  "/items/:productId",
  validateJwt,
  async (req: ExtendRequest, res) => {
    const userId = req?.user?._id;
    const { productId } = req.params;
    const response = await deleteItemInCart({ userId, productId });
    res.status(response.statusCode).send(response.data);
  },
);

router.post("/checkout", validateJwt, async (req: ExtendRequest, res) => {
  try {
    const userId = req?.user?._id;
    const { shipping } = req.body;

    if (
      !shipping?.fullName ||
      !shipping?.phone ||
      !shipping?.city ||
      !shipping?.address
    ) {
      return res.status(400).send("Missing shipping information");
    }

    const response = await checkout({ userId, shipping });

    res.status(response.statusCode).send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
});
export default router;
