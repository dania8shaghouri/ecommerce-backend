import productModel from "../models/productModel.js";

export const getAllProducts = async () => {
  return await productModel.find();
};

export const seedInitialProducts = async () => {
  try {
    const products = [
      {
        title: "ASUS TUF Gaming F16",
        brand: "ASUS",
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
        image: "laptop2_main.webp", // ← Local image EKLENMELİ
        images: ["laptop2_main.webp", "laptop2_2.webp"], // ← Local images EKLENMELİ
        cpu: "Intel i7-13620H",
        ram: "16GB DDR5",
        storage: "1TB SSD",
        gpu: "RTX 4060",
        price: 32000,
        stock: 8,
      },
    ];

    const existingProducts = await getAllProducts();
    if (existingProducts.length === 0) {
      await productModel.insertMany(products);
      console.log("✅ Products seeded successfully!");
    }
  } catch (err) {
    console.error("❌ Seed error:", err);
  }
};
