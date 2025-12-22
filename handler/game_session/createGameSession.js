import db from "../../config/database.js";
import { checkToken } from "../../config/checkToken.js";

export const createGameSession = async (req, res) => {
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

    const [pos] = await db.execute(
      "SELECT id, tipe FROM pos_game WHERE penpos_id = ?",
      [userId]
    );

    if (pos[0].tipe === "BATTLE") {
      const { tim1, tim2 } = req.body;

      await db.execute("UPDATE pos_game SET status = 'BERMAIN' WHERE id = ?", [
        pos[0].id,
      ]);

      await db.execute(
        "UPDATE user SET status = 'BERMAIN' WHERE id IN (?, ?)",
        [tim1, tim2]
      );

      const [game_session] = await db.execute(
        "INSERT INTO game_session (`pos_game_id`, `tim1_id`, `tim2_id`, `start_time`, `score1`, `score2`) VALUES (?, ?, ?, NOW(), 0, 0)",
        [pos[0].id, tim1, tim2]
      );

      if (game_session.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Gagal membuat game session!",
        });
      }
      const gameSessionId = game_session.insertId;
      return res.status(200).json({
        success: true,
        message: "Berhasil membuat game session!",
        data: {
          id: gameSessionId,
          pos_id: pos[0].id,
          id_tim1: tim1,
          id_tim2: tim2,
        },
      });
    } else if (pos[0].tipe === "SINGLE") {
      const tim1 = req.body;

      await db.execute("UPDATE pos_game SET status = 'BERMAIN' WHERE id = ?", [
        pos[0].id,
      ]);

      await db.execute("UPDATE user SET status = 'BERMAIN' WHERE id = ?", [
        tim1,
      ]);

      const [game_session] = await db.execute(
        "INSERT INTO game_session (`pos_game_id`, `tim1_id`, `start_time`, `score1`) VALUES (?, ?, NOW(), 0)",
        [pos[0].id, tim1]
      );

      if (game_session.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Gagal membuat game session!",
        });
      }

      const gameSessionId = game_session.insertId;
      return res.status(200).json({
        success: true,
        message: "Berhasil membuat game session!",
        data: {
          id: gameSessionId,
          pos_id: pos[0].id,
          id_tim1: tim1,
        },
      });
    }
  } catch (error) {
    console.error("ERROR CREATE GAME SESSION:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
};
