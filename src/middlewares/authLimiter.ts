import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    message: "Too many authentication attempts. Please try again later.",
  },
});

export default authLimiter;