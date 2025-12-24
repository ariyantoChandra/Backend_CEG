import db from "../../config/database.js";
import { checkToken } from "../../config/checkToken.js";

export const updateUserPos = async (req, res) => {
  try {
    const current_pos = req.body.current_pos;
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

    await db.execute(
      "UPDATE tim SET pos_game_id = ?, status = 'MENUNGGU' WHERE id = ?",
      [current_pos, userId]
    );

    return res.status(200).json({
      success: true,
      message: "Berhasil update current pos & status peserta!",
    });
  } catch (error) {
    console.error("ERROR UPDATE POS:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
};
