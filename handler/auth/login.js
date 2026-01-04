import db from "../../config/database.js";   // Koneksi ke database MySQL
import jwt from "jsonwebtoken";              // Library untuk membuat JSON Web Token
import dotenv from "dotenv";                 // Untuk membaca file .env
dotenv.config();                             // Mengaktifkan konfigurasi environment

// Fungsi login
export const login = async (req, res) => {
  // Melihat data yang dikirim dari frontend
  // Biasanya berisi nama tim dan password
  console.log("Request Body:", req.body);

  // 2. Mengambil data login dari request body
  // - nama    : nama tim
  // - password: password tim
  const { nama, password } = req.body;

  try {
    // Mengambil data user dari database berdasarkan nama tim
    const [rows] = await db.execute(
      "SELECT * FROM user WHERE nama_tim = ?",
      [nama]
    );

    // Melihat hasil query database
    console.log("Hasil DB:", rows);

    // Jika data tim tidak ditemukan di database
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Nama Tim tidak ditemukan!",
      });
    }

    // Jika tim ditemukan, ambil data user pertama
    const user = rows[0];

    // Validasi password
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Password salah!",
      });
    }

    // Menyiapkan payload untuk JWT
    // Payload ini akan disimpan di dalam token
    const payload = {
      id: user.id,          // ID user (primary key)
      tim: user.nama_tim,   // Nama tim
    };

    // Membuat token JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Mengirim response jika login berhasil
    return res.status(200).json({
      success: true,
      message: "Login Berhasil",
      data: {
        id: user.id,
        nama_tim: user.nama_tim,
        role: user.role,
        token: token,
      },
    });
  } catch (error) {
    // Menangani error jika terjadi kesalahan server atau database
    console.error("ERROR LOGIN:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
};
