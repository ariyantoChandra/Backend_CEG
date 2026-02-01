import db from "../../../config/database.js";
import { checkToken } from "../../../config/checkToken.js";

export const checkGameSession = async (req, res) => {
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

    const game_session_id = req.query.gamesession;

    const game_session = await db.execute(
      "SELECT * FROM game_session WHERE id = ? AND end_time IS NULL",
      [game_session_id],
    );

    if (game_session[0].length === 0) {
      return res.status(200).json({
        success: true,
        message: "Game belum dimulai!",
        data: false,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Game dimulai!",
      data: true,
    });
  } catch (error) {
    console.error("ERROR CHECK GAME SESSION:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
};
