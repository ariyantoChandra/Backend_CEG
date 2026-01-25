import db from "../../../config/database.js";
import { checkToken } from "../../../config/checkToken.js";

export const getQuestion = async (req, res) => {
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

    const { game_session_id, page } = req.body;

    if (!game_session_id) {
      return res.status(400).json({
        success: false,
        message: "Game session ID is required.",
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

    const [questions] = await db.execute(
      "SELECT id, pertanyaan, opsi1, opsi2, opsi3, opsi4, gambar_soal, tipe FROM soal WHERE id = ?",
      [page],
    );

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No questions found.",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        questions,
      },
    });
  } catch (error) {
    console.error("ERROR GET QUESTION:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
};
