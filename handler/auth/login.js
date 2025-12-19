// BACKEND/handler/auth/login.js

import db from "../../database.js";

export const login = async (req, res) => {
  // 1. Cek data yang dikirim frontend
  console.log("Request Body:", req.body);

  const { nama, password } = req.body;

  try {
    // 2. Query ke Database
    // PERHATIKAN: 'nama_tim' harus sesuai nama kolom di database kamu
    // 'user' harus sesuai nama tabel (huruf kecil/besar pengaruh di beberapa OS)
    const [rows] = await db.execute("SELECT * FROM user WHERE nama_tim = ?", [
      nama,
    ]);

    // Debugging: Cek apa hasil dari database
    console.log("Hasil DB:", rows);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Nama Tim tidak ditemukan!",
      });
    }
    const user = rows[0];
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Password salah!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login Berhasil",
      data: {
        id: user.id,
        nama_tim: user.nama_tim,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("ERROR LOGIN:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
};
