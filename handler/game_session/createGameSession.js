import db from "../../config/database.js";
import { checkToken } from "../../config/checkToken.js";

export const createGameSession = async (req, res) => {
  try {
    const { tim1, tim2 } = req.body;
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

    const [pos_id] = await db.execute(
      "SELECT id FROM pos_game WHERE penpos_id = ?",
      [userId]
    );

    await db.execute("UPDATE pos_game SET status = 'BERMAIN' WHERE id = ?", [
      pos_id[0].id,
    ]);

    await db.execute("UPDATE user SET status = 'BERMAIN' WHERE id IN (?, ?)", [
      tim1,
      tim2,
    ]);

    const [rows] = await db.execute(
      "INSERT INTO game_session (`pos_game_id`, `tim1_id`, `tim2_id`, `start_time`, `score1`, `score2`) VALUES (?, ?, ?, NOW(), 0, 0)",
      [pos_id[0].id, tim1, tim2]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Gagal membuat game session!",
      });
    }
    const gameSessionId = rows.insertId;
    return res.status(200).json({
      success: true,
      message: "Berhasil membuat game session!",
      data: {
        id: gameSessionId,
        pos_id: pos_id[0].id,
        id_tim1: tim1,
        id_tim2: tim2,
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
