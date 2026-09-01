// Stripe ile konuşmak
import Stripe from "stripe";
import type { IOrder } from "../models/orderModel.js";

let stripe: Stripe | null = null;

//Stripe client'ı ilk ihtiyaç duyulduğunda oluştur dosya yüklenirken değil
const getStripeClient = () => {
  if (!stripe) {
    // Stripe'a bağlanmak için bir "client" oluştur
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  }
  return stripe;
};

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Bu fon. bir sipariş alıyor ve Stripe'a bu sipariş için bir ödeme sayfası oluştur diyor
export const createStripeCheckoutSession = async (order: IOrder) => {
  const session = await getStripeClient().checkout.sessions.create({
    mode: "payment", //Tek seferlik ödeme (abonelik değil)
    payment_method_types: ["card"],
    // Siparişteki her ürünü Stripe'ın anlayacağı formata çevir
    line_items: order.orderItems.map((item) => ({
      price_data: {
        currency: "try",
        product_data: { name: item.productTitle },
        unit_amount: Math.round(item.unitPrice * 100), //fiyat kuruş cinsinden olması (ondalık sayı hatalarını önlemek için)bu yüzden × 100
      },
      quantity: item.quantity,
    })),
    success_url: `${FRONTEND_URL}/payment-success?orderId=${order._id}`,
    cancel_url: `${FRONTEND_URL}/payment-cancel?orderId=${order._id}`,
    // Stripe'a "bu ödeme hangi sipariş için" bilgisini saklıyor
    metadata: {
      orderId: (order._id as any).toString(),
    },
  });

  return session;
};

export const stripeClient = { get: getStripeClient };
