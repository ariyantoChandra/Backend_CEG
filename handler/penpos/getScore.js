import db from "../../config/database.js";
import { checkToken } from "../../config/checkToken.js";

export const getScore = async (req, res) => {
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

    const { game_session_id, role } = req.body;

    if (!game_session_id) {
      return res.status(400).json({
        success: false,
        message: "game_session_id wajib dikirim",
      });
    }

    const [gameSession] = await db.execute(
      "SELECT * FROM game_session WHERE id = ? AND end_time IS NULL",
      [game_session_id],
    );

    const [timInfo] = await db.execute(
      "SELECT id, nama_tim FROM user WHERE id IN (?, ?)",
      [gameSession[0]?.tim_id1, gameSession[0]?.tim_id2],
    );

    if (gameSession.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Game session tidak ditemukan atau sudah selesai",
      });
    }
    if (role === "PESERTA") {
      if (userId === gameSession[0].tim_id1) {
        return res.status(200).json({
          success: true,
          message: "Jawaban berhasil diproses",
          data: {
            tim: gameSession[0].tim_id1,
            total_poin: gameSession[0].score1,
          },
        });
      } else if (userId === gameSession[0].tim_id2) {
        return res.status(200).json({
          success: true,
          message: "Jawaban berhasil diproses",
          data: {
            tim: gameSession[0].tim_id2,
            total_poin: gameSession[0].score2,
          },
        });
      }
    } else if (role === "PENPOS") {
      if (gameSession[0].tim_id1 === timInfo[0].id) {
        return res.status(200).json({
          success: true,
          message: "Jawaban berhasil diproses",
          data: {
            tim1: gameSession[0].tim_id1,
            total_poin1: gameSession[0].score1,
            nama_tim1: timInfo[0].nama_tim,
            tim2: gameSession[0].tim_id2,
            total_poin2: gameSession[0].score2,
            nama_tim2: timInfo[1].nama_tim,
          },
        });
      } else if (gameSession[0].tim_id2 === timInfo[0].id) {
        return res.status(200).json({
          success: true,
          message: "Jawaban berhasil diproses",
          data: {
            tim1: gameSession[0].tim_id1,
            total_poin1: gameSession[0].score1,
            nama_tim1: timInfo[1].nama_tim,
            tim2: gameSession[0].tim_id2,
            total_poin2: gameSession[0].score2,
            nama_tim2: timInfo[0].nama_tim,
          },
        });
      }
    }
  } catch (error) {
    console.error("Error in getAtomicResult:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
