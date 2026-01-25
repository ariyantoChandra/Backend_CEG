import db from "../../../config/database.js";
import { checkToken } from "../../../config/checkToken.js";

export const getAnswer = async (req, res) => {
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

    const { game_session_id, answer, page } = req.body;

    if (!game_session_id || !answer) {
      return res.status(400).json({
        success: false,
        message: "game_session_id dan answer wajib dikirim",
      });
    }

    if (!page) {
      return res.status(400).json({
        success: false,
        message: "Page number is required.",
      });
    }

    const [gameSession] = await db.execute(
      "SELECT * FROM game_session WHERE id = ? AND end_time IS NULL",
      [game_session_id],
    );

    if (gameSession.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Game session tidak ditemukan atau sudah selesai",
      });
    }

    const session = gameSession[0];

    const [correctAnswers] = await db.execute(
      "SELECT jawaban_benar FROM soal WHERE id = ?",
      [page],
    );

    if (correctAnswers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No correct answers found.",
      });
    }

    if (
      correctAnswers[0].jawaban_benar.toLowerCase() === answer.toLowerCase()
    ) {
      if (session.tim_id1 === userId) {
        await db.execute(
          "UPDATE game_session SET score1 = score1 + 1 WHERE id = ?",
          [game_session_id],
        );
      } else if (session.tim_id2 === userId) {
        await db.execute(
          "UPDATE game_session SET score2 = score2 + 1 WHERE id = ?",
          [game_session_id],
        );
      }

      return res.status(200).json({
        success: true,
        message: "Jawaban Anda benar!",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Jawaban Anda salah!",
        data: correctAnswers[0].jawaban_benar,
      });
    }
  } catch (error) {
    console.error("Error in getAtomicAnswer:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
};
