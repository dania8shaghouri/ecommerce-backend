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

//
export const getPaymentMethodDetails = async (stripeSessionId: string) => {
  const session = await getStripeClient().checkout.sessions.retrieve(
    stripeSessionId,
    {
      // expand ile bu ID'nin arkasındaki gerçek objeyi de getir
      expand: ["payment_intent.payment_method"],
    },
  );

  // expand kullandığımız için biz tam objeyi bekliyoruz ama TypeScript bunu garanti edemiyor buyuzsen
  // Her adımda typeof === "string" kontrolü yapiyoruz
  const paymentIntent = session.payment_intent;
  if (!paymentIntent || typeof paymentIntent === "string") return null;

  const paymentMethod = paymentIntent.payment_method;
  if (!paymentMethod || typeof paymentMethod === "string") return null;

  if (paymentMethod.type !== "card" || !paymentMethod.card) return null;

  // last4 kartin sadece son 4 hanesi
  return {
    brand: paymentMethod.card.brand,
    last4: paymentMethod.card.last4,
    expMonth: paymentMethod.card.exp_month,
    expYear: paymentMethod.card.exp_year,
  };
};
export const stripeClient = { get: getStripeClient };
