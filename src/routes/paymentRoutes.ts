import express from "express";
import { stripeClient } from "../services/paymentService.js";
import { orderModel } from "../models/orderModel.js";

const router = express.Router();

router.post(
  "/webhook",
  // Stripe imza doğrulaması için ham request body gerekir
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"] as string;
    let event;

    try {
      event = stripeClient
        .get()
        .webhooks.constructEvent(
          req.body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET as string,
        );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return res.status(400).send(`Webhook Error`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        await orderModel.findByIdAndUpdate(orderId, {
          paymentStatus: "paid",
          status: "processing",
          stripeSessionId: session.id,
        });
      }
    }

    res.status(200).send({ received: true });
  },
);
router.get("/order-status/:orderId", async (req, res) => {
  const order = await orderModel.findById(req.params.orderId);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.status(200).json({ paymentStatus: order.paymentStatus });
});

export default router;
