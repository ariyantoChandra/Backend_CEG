import db from "../../config/database.js";
import { checkToken } from "../../config/checkToken.js";

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
      "SELECT * FROM pos_game ORDER BY status"
    );

    if (list_pos.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Gagal mendapatkan list pos!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Berhasil mendapatkan list pos!",
      data: list_pos,
    });
  } catch (error) {
    console.error("ERROR GET LIST POS:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
};
