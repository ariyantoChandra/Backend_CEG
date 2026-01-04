import db from "../../../config/database.js";
import { checkToken } from "../../../config/checkToken.js";

export const getListPos = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "Failed",
        message: "There is no Token sent!",
      });
    }
    const token = authHeader.split(" ")[1];
    const { valid, expired, decoded } = checkToken(token);
    const userId = decoded.id;

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: expired ? "Token expired." : "Token invalid.",
      });
    }
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "ID pengguna tidak ditemukan.",
      });
    }

    const [list_pos] = await db.execute(
      "SELECT * FROM pos_game ORDER BY status ASC, id ASC"
    );

    if (list_pos.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Gagal mendapatkan list pos!",
      });
    }

    // Add isPlayed field for each pos
    const posWithIsPlayed = await Promise.all(
      list_pos.map(async (pos) => {
        const [gameSession] = await db.execute(
          `SELECT 1 
       FROM game_session 
       WHERE penpos_id = ? 
         AND (tim_id1 = ? OR tim_id2 = ?) 
         AND end_time IS NOT NULL
       LIMIT 1`,
          [pos.penpos_id, userId, userId]
        );

        return {
          ...pos,
          isPlayed: gameSession.length > 0,
        };
      })
    );

    // 🔥 SORTING: false dulu, true di bawah
    posWithIsPlayed.sort((a, b) => {
      return Number(a.isPlayed) - Number(b.isPlayed);
    });

    return res.status(200).json({
      success: true,
      message: "Berhasil mendapatkan list pos!",
      data: posWithIsPlayed,
    });
  } catch (error) {
    console.error("ERROR GET LIST POS:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
};
