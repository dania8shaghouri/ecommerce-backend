import { orderModel } from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import { getAdminOrders } from "./orderService.js";

// Bu ay geçen aya göre yüzde kaç değişmiş?
const calculateChangePct = (
  current: number,
  previous: number,
): number | null => {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
};

// Bu ayın ve geçen ayın başlangıç tarihlerini bulmak
const getMonthBoundaries = () => {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return { now, startOfThisMonth, startOfLastMonth };
};

// Dashboard'ın üst kısmındaki genel KPI/statistikleri hazırlamak
export const getDashboardSummary = async () => {
  const { now, startOfThisMonth, startOfLastMonth } = getMonthBoundaries();

  const [
    revenueThisMonth,
    revenueLastMonth,
    ordersThisMonth,
    ordersLastMonth,
    customersThisMonth,
    customersLastMonth,
    productsThisMonth,
    productsLastMonth,
    totalRevenueAllTime,
    totalOrdersAllTime,
    totalCustomersAllTime,
    totalProductsAllTime,
  ] = await Promise.all([
    // Ödemesi yapılmış ve bu ay oluşturulmuş bütün siparişleri bul, sonra total değerlerini topla
    orderModel.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: startOfThisMonth },
        },
      },
      { $group: { _id: null, sum: { $sum: "$total" } } },
    ]),
    // Geçen ay geliri
    orderModel.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
        },
      },
      { $group: { _id: null, sum: { $sum: "$total" } } },
    ]),
    // Bu ay oluşturulan kaç sipariş var
    orderModel.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
    orderModel.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
    }),
    userModel.countDocuments({
      role: "customer",
      createdAt: { $gte: startOfThisMonth },
    }),
    userModel.countDocuments({
      role: "customer",
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
    }),
    productModel.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
    productModel.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
    }),
    // Sistemdeki tüm paid siparişlerin toplam gelirini hesapla
    orderModel.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, sum: { $sum: "$total" } } },
    ]),

    orderModel.countDocuments({}), //Sistemdeki bütün siparişleri say
    userModel.countDocuments({ role: "customer" }),
    productModel.countDocuments({}),
  ]);

  return {
    // MongoDB'den gelen ham veriyi frontend'in kullanabileceği bir yapıya dönüştürüyo
    totalRevenue: totalRevenueAllTime[0]?.sum ?? 0,
    revenueChangePct: calculateChangePct(
      revenueThisMonth[0]?.sum ?? 0,
      revenueLastMonth[0]?.sum ?? 0,
    ),
    totalOrders: totalOrdersAllTime,
    ordersChangePct: calculateChangePct(ordersThisMonth, ordersLastMonth),
    totalCustomers: totalCustomersAllTime,
    customersChangePct: calculateChangePct(
      customersThisMonth,
      customersLastMonth,
    ),
    totalProducts: totalProductsAllTime,
    productsChangePct: calculateChangePct(productsThisMonth, productsLastMonth),
  };
};

// Son 6 aylık gelir
export const getMonthlyRevenue = async () => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const results = await orderModel.aggregate([
    { $match: { paymentStatus: "paid", createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        revenue: { $sum: "$total" },
      },
    },
  ]);

  //   O ay için veri varsa gelirini kullan, yoksa 0 kullan
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const match = results.find(
      (r) =>
        r._id.year === date.getFullYear() &&
        r._id.month === date.getMonth() + 1,
    );
    months.push({
      month: date.toLocaleDateString("en-US", { month: "short" }),
      revenue: match?.revenue ?? 0,
    });
  }

  return months;
};

// sipariş durumlarının dağılımı
export const getOrderStatusBreakdown = async () => {
  // MongoDB'ye:status alanına göre siparişleri grupla ve her grubun kaç tane olduğunu say
  const results = await orderModel.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const totalOrders = results.reduce((sum, r) => sum + r.count, 0);

  return results.map((r) => ({
    status: r._id,
    count: r.count,
    // Her status'un yüzdesini hesaplıyor
    percentage: totalOrders > 0 ? Math.round((r.count / totalOrders) * 100) : 0,
  }));
};

// En çok satan ürünler
export const getTopProducts = async (limit = 5) => {
  return orderModel.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $unwind: "$orderItems" }, //$unwind bunu ayrı kayıtlar haline getiriyor:
    // Laptop → 2, Mouse  → 3 Böylece ürün bazında hesaplama yapılabiliyor.
    {
      $group: {
        _id: {
          title: "$orderItems.productTitle",
          image: "$orderItems.productImage",
        },
        unitsSold: { $sum: "$orderItems.quantity" }, //Kaç adet satılmış
        revenue: {
          //Ürün ne kadar gelir getirmiş
          $sum: {
            $multiply: ["$orderItems.unitPrice", "$orderItems.quantity"],
          },
        },
      },
    },
    { $sort: { unitsSold: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        title: "$_id.title",
        image: "$_id.image",
        unitsSold: 1,
        revenue: 1,
      },
    },
  ]);
};

// HEPSİNİ BİRLEŞTİRİR
export const getDashboardOverview = async () => {
  const [
    summary,
    monthlyRevenue,
    orderStatusBreakdown,
    topProducts,
    recentOrdersResult,
  ] = await Promise.all([
    getDashboardSummary(),
    getMonthlyRevenue(),
    getOrderStatusBreakdown(),
    getTopProducts(5),
    getAdminOrders({ sort: "newest", page: 1, limit: 5 }),
  ]);

  return {
    summary,
    monthlyRevenue,
    orderStatusBreakdown,
    topProducts,
    recentOrders: recentOrdersResult.orders,
  };
};
