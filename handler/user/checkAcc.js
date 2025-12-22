import db from "../../config/database";
import { checkToken } from "../../config/checkToken.js";

export const checkAcc = async (req, res) => {
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

    const pos_id = req.body.pos_id;

    const [game_session] = await db.execute(
      "SELECT id FROM game_session WHERE pos_game_id = ? AND end_time IS NULL",
      [pos_id]
    );

    if (game_session.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Game belum dimulai!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Game dimulai!",
      data: game_session[0].id,
    });

  } catch (error) {
    console.error("ERROR CHECK ACC:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
};
