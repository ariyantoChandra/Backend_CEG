import express from "express";
import cors from "cors";

// Routes Web Pendaftaran
import authRoutes from "./routes/authRoutes.js";

// Routes Rally Games
import penposRoutes from "./routes/penposRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Routes Admin
import adminRoutes from "./admin/adminRoutes.js";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint cek server
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Server Backend Siap Digunakan",
  });
});

// Web Pendaftaran
// Contoh: http://localhost:5000/auth/register
//         http://localhost:5000/auth/login
app.use("/auth", authRoutes);

// Rally Games
app.use("/penpos", penposRoutes);
app.use("/user", userRoutes);

// Admin
// Contoh: http://localhost:5000/admin/verify-payment/:timId
//         http://localhost:5000/admin/manage-notes/:timId
app.use("/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});