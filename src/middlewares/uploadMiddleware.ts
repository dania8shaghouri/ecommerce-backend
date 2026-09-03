// Multer, Express uygulamalarında multipart/form-data şeklinde gönderilen dosyaları almak için kullanılan bir middleware'dir
// path: Node.js'in path utility'sidir Dosya yollarını güvenli şekilde oluşturmak için kullanılır
import multer from "multer";
import path from "path";

// diskStorage → dosyanın fiziksel olarak bilgisayardaki/server'daki klasöre kaydedilmesini sağlar
const storage = multer.diskStorage({
  // destination Dosyaları nereye kaydedilecegini
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "src/images"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, and WEBP images are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export default upload;
