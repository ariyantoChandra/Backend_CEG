import db from "../../config/database.js";

export const registerAdmin = async (req, res) => {
  try {
    const { username, password } = req.body; // username akan masuk ke kolom nama_tim

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username dan Password wajib diisi" });
    }

    // 1. Cek Duplikasi
    const [existing] = await db.execute("SELECT id FROM `user` WHERE nama_tim = ?", [username]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: "Username sudah dipakai" });
    }

    // 2. Insert User dengan Role ADMIN
    // Kita set status='ACTIVE' agar bisa langsung login
    await db.execute(
      "INSERT INTO `user` (nama_tim, password, role, status, total_points, total_coin) VALUES (?, ?, 'ADMIN', 'ACTIVE', 0, 0)",
      [username, password]
    );

    return res.status(201).json({ success: true, message: "Admin Berhasil Dibuat" });

  } catch (error) {
    console.error("REGISTER ADMIN ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};