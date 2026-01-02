import db from "../../config/database.js";
import { checkToken } from "../../config/checkToken.js";

export const matchResult = async (req, res) => {
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

    const game_session_id = req.body.game_session_id;

    if (!game_session_id) {
      return res.status(400).json({
        success: false,
        message: "game_session_id is required.",
      });
    }

    const [checkStatus] = await db.execute(
      "SELECT * FROM game_session WHERE id = ? AND penpos_id = ? AND end_time IS NULL",
      [game_session_id, userId]
    );

    if (checkStatus.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Game session not found or already ended.",
      });
    }

    if (checkStatus[0].tipe === "BATTLE") {
      const { tim_menang, tim_kalah } = req.body;
      if (!tim_menang || !tim_kalah) {
        return res.status(400).json({
          success: false,
          message: "tim_menang dan tim_kalah wajib dikirim",
        });
      }

      if (
        ![checkStatus[0].tim_id1, checkStatus[0].tim_id2].includes(
          tim_menang
        ) ||
        ![checkStatus[0].tim_id1, checkStatus[0].tim_id2].includes(tim_kalah)
      ) {
        return res.status(400).json({
          success: false,
          message: "Tim tidak valid untuk pertandingan ini",
        });
      }

      if (checkStatus[0].tim_id1 === tim_menang) {
        await db.execute(
          "UPDATE game_session SET end_time = NOW(), score1 = 5 , score2 = 1 WHERE id = ? AND penpos_id = ?",
          [game_session_id, userId]
        );

        await db.execute(
          "UPDATE tim SET total_points = total_points + 5 WHERE user_id = ?",
          [checkStatus[0].tim_id1]
        );

        await db.execute(
          "UPDATE tim SET total_points = total_points + 1 WHERE user_id = ?",
          [checkStatus[0].tim_id2]
        );

        return res.status(200).json({
          success: true,
          message: `Tim yang menang mendapatkan 5 poin & tim yang kalah mendapatkan 1 poin!`,
          data: {
            tim_menang: tim_menang,
            tim_kalah: tim_kalah,
          },
        });
      } else if (checkStatus[0].tim_id2 === tim_menang) {
        await db.execute(
          "UPDATE game_session SET end_time = NOW(), score1 = 1 , score2 = 5 WHERE id = ? AND penpos_id = ?",
          [game_session_id, userId]
        );

        await db.execute(
          "UPDATE tim SET total_points = total_points + 5 WHERE user_id = ?",
          [checkStatus[0].tim_id2]
        );

        await db.execute(
          "UPDATE tim SET total_points = total_points + 1 WHERE user_id = ?",
          [checkStatus[0].tim_id1]
        );

        return res.status(200).json({
          success: true,
          message: `Tim yang menang mendapatkan 5 poin & tim yang kalah mendapatkan 1 poin!`,
          data: {
            tim_menang: tim_menang,
            tim_kalah: tim_kalah,
          },
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Tim tidak sesuai dengan tim yang bertanding",
        });
      }
    } else if (checkStatus[0].tipe === "SINGLE") {
      const { result, tim_id } = req.body;

      if (typeof result !== "boolean" || !tim_id) {
        return res.status(400).json({
          success: false,
          message: "result dan tim_id wajib dikirim",
        });
      }

      if (checkStatus[0].tim_id1 !== tim_id) {
        return res.status(403).json({
          success: false,
          message: "Tim tidak valid untuk game ini",
        });
      }

      if (result === true) {
        await db.execute(
          "UPDATE game_session SET end_time = NOW(), score1 = 5 WHERE id = ?",
          [game_session_id]
        );
        await db.execute(
          "UPDATE tim SET total_points = total_points + 5 WHERE user_id = ?",
          [tim_id]
        );

        res.status(200).json({
          success: true,
          message: "Mendapatkan 5 poin!",
        });
      } else if (result === false) {
        await db.execute(
          "UPDATE game_session SET end_time = NOW(), score1 = 1 WHERE id = ? ",
          [game_session_id]
        );
        await db.execute(
          "UPDATE tim SET total_points = total_points + 1 WHERE user_id = ?",
          [tim_id]
        );

        res.status(200).json({
          success: true,
          message: "Mendapatkan 1 poin!",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: " Tipe pertandingan tidak valid.",
      });
    }
  } catch (error) {
    console.error("ERROR MATCH RESULT:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
};
//aomdoaskdoaksdo
