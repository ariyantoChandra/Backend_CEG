import db from "../../config/database.js";
import { checkToken } from "../../config/checkToken.js";

export const getCard = async (req, res) => {
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

    const [rows] = await db.execute(
      "SELECT c.asam_kuat, c.asam_lemah, c.netral, c.basa_kuat, c.asam_lemah FROM user u INNER JOIN card c ON u.id = c.user_id WHERE u.id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tim tidak ditemukan!",
      });
    }
    const card = rows[0];
    return res.status(200).json({
      success: true,
      message: "Login Berhasil",
      data: {
        id: user.id,
        tim: user.nama_tim,
        cards: card,
      },
    });
  } catch (error) {
    console.error("ERROR GET CARD:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
};
