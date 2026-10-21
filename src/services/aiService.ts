import { GoogleGenAI } from "@google/genai";

// Başlangıçta Gemini client'ı oluşturulmuyor
let client: GoogleGenAI | null = null;

// Eğer client daha önce oluşturulmadıysa oluştur, oluşturulduysa mevcut client'ı kullan
const getGeminiClient = () => {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
  }
  return client;
};

// Burada service fonksiyonunun alacağı verinin tipini tanımlıyoruz
interface GenerateDescriptionInput {
  title: string;
  brand?: string;
  category?: string;
  specs?: Record<string, unknown>;
}

// Object.entries() bir object'i key-value çiftlerinden oluşan bir array'e dönüştürür
export const generateProductDescription = async ({
  title,
  brand,
  category,
  specs,
}: GenerateDescriptionInput) => {
  const specLines = specs
    ? Object.entries(specs)
        .filter(([, value]) => value !== undefined && value !== "")
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ")
    : "";

  // Gemini'ye verdiğim talimat
  const prompt = `You are an expert e-commerce copywriter. Write a professional, concise product description (2-3 sentences) for the following product. Do not invent specs that aren't listed below.

Product: ${title}
Brand: ${brand ?? "Unknown"}
Category: ${category ?? "Unknown"}
Specifications: ${specLines || "None provided"}`;

  // Gemini'ye istek gonderme
  const response = await getGeminiClient().models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    contents: prompt,
  });

  // Gemini'nin oluşturduğu text'i al
  // ?. Optional chaining. Eğer text varsa trim() çalışır. Yoksa hata vermek yerine undefined döner
  const description = response.text?.trim();

  // AI'dan geçerli bir description gelmezse hata oluştur
  if (!description) {
    throw new Error("No description generated");
  }

  return description;
};
