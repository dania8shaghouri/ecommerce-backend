import productModel from "../models/productModel.js";

export type ProductSort =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "newest";
export interface ProductFilters {
  category?: string[];
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: ProductSort;
  page?: number;
  limit?: number;
}

export const getAllProducts = async (filters?: ProductFilters) => {
  const query: Record<string, unknown> = {};
  const sortQuery: Record<string, 1 | -1> = {};

  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 12;
  const skip = (page - 1) * limit;

  if (filters?.category?.length) {
    query.category = {
      $in: filters.category,
    };
  }

  if (filters?.brand?.length) {
    query.brand = {
      $in: filters.brand,
    };
  }
  if (filters?.inStock) {
    query.stock = {
      $gt: 0,
    };
  }

  if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
    query.price = {};

    if (filters.minPrice !== undefined) {
      (query.price as Record<string, number>).$gte = filters.minPrice;
    }

    if (filters.maxPrice !== undefined) {
      (query.price as Record<string, number>).$lte = filters.maxPrice;
    }
  }

  switch (filters?.sort) {
    case "price-asc":
      sortQuery.price = 1;
      break;

    case "price-desc":
      sortQuery.price = -1;
      break;

    case "rating":
      sortQuery.rating = -1;
      break;

    case "newest":
      sortQuery._id = -1;
      break;

    default:
      break;
  }
  const totalProducts = await productModel.countDocuments(query);

  const products = await productModel
    .find(query)
    .sort(sortQuery)
    .skip(skip)
    .limit(limit).select(`
      title
      brand
      category
      image
      images
      price
      stock
      rating
      reviewCount
  `);

  return {
    products,
    totalProducts,
    totalPages: Math.ceil(totalProducts / limit),
    currentPage: page,
  };
};

export const getProductById = async (id: string) => {
  return productModel.findById(id);
};

export const seedInitialProducts = async () => {
  try {
    const products = [
      {
        title: "ASUS TUF Gaming F16",
        brand: "ASUS",
        category: "Laptops",
        image: "laptop1_main.webp", // ← Local image
        images: ["laptop1_main.webp", "laptop1_2.webp"],
        cpu: "i5-13450HX",
        ram: "16GB",
        storage: "512GB SSD",
        gpu: "RTX 4050",
        description: "16 inch, 165Hz, FreeDOS...",
        price: 25000,
        stock: 10,
      },
      {
        title: "MSI Katana 15",
        brand: "MSI",
        category: "Laptops",
        image: "laptop2_main.webp", // ← Local image EKLENMELİ
        images: ["laptop2_main.webp", "laptop2_2.webp"], // ← Local images EKLENMELİ
        cpu: "Intel i7-13620H",
        ram: "16GB DDR5",
        storage: "1TB SSD",
        gpu: "RTX 4060",
        price: 32000,
        stock: 8,
      },
      {
        title: "Razer DeathAdder V3",
        brand: "Razer",
        category: "Gaming",
        image: "gaming1_main.webp",
        images: ["gaming1_main.webp", "gaming1_2.webp"],
        type: "Gaming Mouse",
        connectivity: "Wireless",
        dpi: "30000 DPI",
        rgb: true,
        price: 4500,
        stock: 20,
      },
      {
        title: "LG UltraGear 27GR75Q",
        brand: "LG",
        category: "Monitors",
        image: "monitor1_main.webp",
        images: ["monitor1_main.webp", "monitor1_2.webp"],
        size: '27"',
        resolution: "2560x1440 (QHD)",
        refreshRate: "165Hz",
        panel: "IPS",
        price: 12500,
        stock: 12,
      },
      {
        title: "Logitech G Pro X Keyboard",
        brand: "Logitech",
        category: "Accessories",
        image: "accessory1_main.webp",
        images: ["accessory1_main.webp", "accessory1_2.webp"],
        type: "Mechanical Keyboard",
        switches: "GX Brown",
        connectivity: "USB-C",
        rgb: true,
        price: 5200,
        stock: 18,
      },
      {
        title: "Samsung 990 PRO",
        brand: "Samsung",
        category: "Storage",
        image: "storage1_main.webp",
        images: ["storage1_main.webp", "storage1_2.webp"],
        type: "NVMe SSD",
        capacity: "2TB",
        interface: "PCIe 4.0",
        readSpeed: "7450 MB/s",
        price: 6800,
        stock: 25,
      },
    ];

    const existingProducts = await getAllProducts();
    if (existingProducts.totalProducts === 0) {
      await productModel.insertMany(products);
      console.log("✅ Products seeded successfully!");
    }
  } catch (err) {
    console.error("❌ Seed error:", err);
  }
};

export const getProductCategories = async () => {
  return productModel.aggregate([
    {
      $group: {
        _id: "$category",
        totalProducts: {
          $sum: 1,
        },
        image: {
          $first: "$image",
        },
      },
    },
    {
      $project: {
        _id: 0,
        name: "$_id",
        totalProducts: 1,
        image: 1,
      },
    },
    {
      $sort: {
        name: 1,
      },
    },
  ]);
};

export const getProductBrands = async () => {
  return productModel.aggregate([
    {
      $group: {
        _id: "$brand",
      },
    },
    {
      $project: {
        _id: 0,
        name: "$_id",
      },
    },
    {
      $sort: {
        name: 1,
      },
    },
  ]);
};
