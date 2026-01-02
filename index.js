import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

// Routes Web Pendaftaran
import authRoutes from "./routes/authRoutes.js";

// Routes Rally Games
import penposRoutes from "./routes/penposRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Routes Admin
import adminRoutes from "./routes/adminRoutes.js";

// KONFIGURASI PATH UNTUK ES MODULE
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// STATIC FILE SERVING (PENTING UNTUK GAMBAR)
// Ini membuka akses ke folder public/uploads agar bisa dilihat di browser
// Contoh akses: http://localhost:5000/public/uploads/NamaTim_pas_foto.jpg
app.use("/public", express.static(path.join(__dirname, "public")));

// Endpoint cek server
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Server Backend Siap Digunakan nota lilidoyouloveme lili ahhhh",
  });
});

// Routes API (Dengan Prefix /api)
app.use("/api/auth", authRoutes);
app.use("/api/penpos", penposRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
