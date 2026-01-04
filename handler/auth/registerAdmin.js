import db from "../../config/database.js";

export const registerAdmin = async (req, res) => {
  try {
    // Ambil username dan password dari request body, username akan disimpan ke kolom nama_tim
    const { username, password } = req.body;

    // Validasi input wajib
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "username dan password wajib diisi",
      });
    }

    // Cek apakah username sudah digunakan
    const [existing] = await db.execute(
      "select id from user where nama_tim = ?",
      [username]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "username sudah dipakai",
      });
    }

    // Insert user baru dengan role admin dan status diset active agar admin bisa langsung login
    await db.execute(
      "insert into user (nama_tim, password, role, status, total_points, total_coin) values (?, ?, 'admin', 'active', 0, 0)",
      [username, password]
    );

    // Response jika berhasil
    return res.status(201).json({
      success: true,
      message: "admin berhasil dibuat",
    });

  } catch (error) {
    // Tangani error server atau database
    console.error("register admin error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
