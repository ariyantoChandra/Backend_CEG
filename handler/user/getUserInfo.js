import db from "../../config/database.js";
import { checkToken } from "../../config/checkToken.js";

export const getUserInfo = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token tidak ditemukan!",
      });
    }

    const token = authHeader.split(" ")[1];
    const { valid, expired, decoded } = checkToken(token);

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: expired ? "Token kadaluarsa." : "Token tidak valid.",
      });
    }

    const userId = decoded.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "ID pengguna tidak valid.",
      });
    }

    // UPDATE QUERY: Mengambil field status_pembayaran, notes, paket
    const [info] = await db.execute(
      `SELECT 
        u.nama_tim, 
        t.total_points as points,
        t.total_coin as coins
       FROM user u 
       INNER JOIN tim t ON u.id = t.user_id 
       WHERE u.id = ?`,
      [userId],
    );

    if (info.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Berhasil mendapatkan info user!",
      data: info[0],
    });
  } catch (error) {
    console.error("ERROR GET USER INFO:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
};
