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

// 1 gün kaç milisaniye
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Mevcut değer + önceki değer + yüzde değişim
const buildMetric = (current: number, previous: number) => ({
  current,
  previous,
  changePct: calculateChangePct(current, previous),
});

// Dashboard'ın üst kısmındaki genel KPI/statistikleri hazırlamak
export const getDashboardSummary = async (days = 30) => {
  const now = new Date();

  // Mevcut dönem: Bugünden geriye doğru belirtilen gün sayısını hesapla
  const currentStart = new Date(now.getTime() - days * MS_PER_DAY);

  // Önceki dönem: Mevcut dönemden önceki aynı uzunluktaki zaman aralığını hesapla
  const previousStart = new Date(now.getTime() - 2 * days * MS_PER_DAY);

  // Mevcut dönemin başlangıç ve bitiş tarihini belirle
  const currentRange = { $gte: currentStart, $lte: now };

  // Önceki dönemin başlangıç ve bitiş tarihini belirle
  const previousRange = { $gte: previousStart, $lt: currentStart };

  // Belirtilen tarih aralığındaki ödemesi yapılmış siparişlerin toplam gelirini hesaplar
  const sumPaidRevenue = async (range: Record<string, Date>) => {
    const result = await orderModel.aggregate([
      {
        // Sadece ödemesi yapılmış ve belirtilen tarih aralığında oluşturulmuş siparişleri bul
        $match: {
          paymentStatus: "paid",
          createdAt: range,
        },
      },

      // Bulunan siparişlerin total değerlerini topla
      {
        $group: {
          _id: null,
          sum: { $sum: "$total" },
        },
      },
    ]);

    // Sonuç yoksa 0 döndür
    return result[0]?.sum ?? 0;
  };

  const [
    revenueCurrent,
    revenuePrevious,
    ordersCurrent,
    ordersPrevious,
    customersCurrent,
    customersPrevious,
    productsCurrent,
    productsPrevious,
  ] = await Promise.all([
    // Mevcut dönemdeki toplam ödemesi yapılmış geliri hesapla
    sumPaidRevenue(currentRange),

    // Önceki dönemdeki toplam ödemesi yapılmış geliri hesapla
    sumPaidRevenue(previousRange),

    // Mevcut dönemde oluşturulan siparişlerin sayısını hesapla
    orderModel.countDocuments({ createdAt: currentRange }),

    // Önceki dönemde oluşturulan siparişlerin sayısını hesapla
    orderModel.countDocuments({ createdAt: previousRange }),

    // Mevcut dönemde kayıt olan customer kullanıcıların sayısını hesapla
    userModel.countDocuments({
      role: "customer",
      createdAt: currentRange,
    }),

    // Önceki dönemde kayıt olan customer kullanıcıların sayısını hesapla
    userModel.countDocuments({
      role: "customer",
      createdAt: previousRange,
    }),

    // Mevcut dönemde oluşturulan ürünlerin sayısını hesapla
    productModel.countDocuments({ createdAt: currentRange }),

    // Önceki dönemde oluşturulan ürünlerin sayısını hesapla
    productModel.countDocuments({ createdAt: previousRange }),
  ]);

  return {
    // Mevcut dönem ile önceki dönemi karşılaştırarak revenue metric'i oluştur
    revenue: buildMetric(revenueCurrent, revenuePrevious),

    // Mevcut dönem ile önceki dönemi karşılaştırarak orders metric'i oluştur
    orders: buildMetric(ordersCurrent, ordersPrevious),

    // Mevcut dönem ile önceki dönemi karşılaştırarak customers metric'i oluştur
    customers: buildMetric(customersCurrent, customersPrevious),

    // Mevcut dönem ile önceki dönemi karşılaştırarak products metric'i oluştur
    products: buildMetric(productsCurrent, productsPrevious),
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
export const getDashboardOverview = async (days = 30) => {
  const [
    summary,
    monthlyRevenue,
    orderStatusBreakdown,
    topProducts,
    recentOrdersResult,
  ] = await Promise.all([
    getDashboardSummary(days),
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
