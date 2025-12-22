import db from "../../config/database.js";
import { checkToken } from "../../config/checkToken.js";

export const getListTeam = async (req, res) => {
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
    
    const current_pos = req.query.currentPos;

    const [list_tim] = await db.execute(
      "SELECT u.id, u.nama_tim, p.penpos_id, p.name_pos, u.status FROM user u INNER JOIN pos_game p ON u.current_pos = p.id WHERE u.current_pos = ? ORDER BY status",
      [current_pos]
    );

    if (list_tim.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tidak ada tim yang bermain!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Berhasil mendapatkan tim!",
      data: list_tim,
    });
  } catch (error) {
    console.error("ERROR GET LIST TIM:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
};
