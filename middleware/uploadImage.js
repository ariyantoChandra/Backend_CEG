import multer from "multer";
import path from "path";
import fs from "fs";

// Pastikan folder uploads tersedia
const uploadDir = "public/uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Bersihkan nama tim dari spasi agar aman di URL
    const namaTim = req.body.nama_tim ? req.body.nama_tim.replace(/\s+/g, '_') : "unknown";
    const ext = path.extname(file.originalname);
    
    // Format nama file: NamaTim_NamaField_Timestamp.jpg
    cb(null, `${namaTim}_${file.fieldname}_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Hanya file gambar (JPG/PNG) yang diperbolehkan!"));
  }
};

export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // Limit 10MB
});