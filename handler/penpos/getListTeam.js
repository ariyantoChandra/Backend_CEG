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

    const current_pos = req.body.current_pos;
    
    const [rows] = await db.execute(
      "SELECT u.id, u.nama_tim, p.penpos_id, p.name_pos FROM user u INNER JOIN pos_game p ON u.current_pos = p.id WHERE u.current_pos = ?",
      [current_pos]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tidak ada tim yang bermain!",
      });
    }
    const list_tim = rows[0];
    return res.status(200).json({
      success: true,
      message: "Berhasil mendapatkan tim!",
      data: {
        tim: list_tim,
      },
    });
  } catch (error) {
    console.error("ERROR GET POS:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
};
