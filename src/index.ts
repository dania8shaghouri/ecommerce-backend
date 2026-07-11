import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";

import cors from "cors";
import { seedInitialProducts } from "./services/productService.js";
import userRoute from "./routes/userRoutes.js";
import productRoute from "./routes/productRoutes.js";
import cartRoute from "./routes/cartRouter.js";
import adminRoute from "./routes/adminRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is missing");
}

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is missing");
}

if (!process.env.ALLOWED_ORIGINS) {
  throw new Error("ALLOWED_ORIGINS environment variable is missing");
}
const app = express();
const port = process.env.PORT || 3001;

app.use("/images", express.static(path.join(process.cwd(), "src/images")));
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173",
//       "http://localhost:5174",
//       "https://ecommerce-frontend-lyart-one.vercel.app",
//     ],
//     credentials: true,
//   }),
// );

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") ?? [];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI as string;
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB error:", err));

// Seed products
seedInitialProducts();

app.use("/user", userRoute);
app.use("/product", productRoute);
app.use("/cart", cartRoute);
app.use("/admin", adminRoute);
app.use("/wishlist", wishlistRoutes);
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
