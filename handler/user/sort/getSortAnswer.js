import db from "../../../config/database.js";
import { checkToken } from "../../../config/checkToken.js";

export const getSortAnswer = async (req, res) => {
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

    const { game_session_id, answer, question_id } = req.body;

    if (!game_session_id || !Array.isArray(answer) || !question_id) {
      return res.status(400).json({
        success: false,
        message:
          "game_session_id, answer (array), dan question_id wajib dikirim",
      });
    }

    const [gameSession] = await db.execute(
      "SELECT * FROM game_session WHERE id = ? AND end_time IS NULL",
      [game_session_id]
    );

    if (gameSession.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Game session tidak ditemukan atau sudah selesai",
      });
    }

    const session = gameSession[0];

    const [correctAnswers] = await db.execute(
      "SELECT urutan, alat_bahan_id as id_barang, score FROM alat_bahan_terpilih WHERE question_id = ? ORDER BY urutan ASC",
      [question_id]
    );

    const scoreMap = new Map();

    for (const item of correctAnswers) {
      scoreMap.set(item.urutan, {
        id_barang: item.id_barang,
        score: item.score,
      });
    }

    let correctCount = 0;

    for (const item of answer) {
      const correct = scoreMap.get(item.urutan_kotak);
      if (correct && correct.id_barang === item.id_barang) {
        correctCount += correct.score;
      }
    }

    if (session.tim_id1 === userId) {
      await db.execute(
        "UPDATE game_session SET score1 = score1 + ? WHERE id = ?",
        [correctCount, game_session_id]
      );
    } else if (session.tim_id2 === userId) {
      await db.execute(
        "UPDATE game_session SET score2 = score2 + ? WHERE id = ?",
        [correctCount, game_session_id]
      );
    } else {
      return res.status(403).json({
        success: false,
        message: "User bukan bagian dari game session ini",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Jawaban diproses",
      data: {
        total_poin: correctCount,
      },
    });
  } catch (error) {
    console.error("ERROR GET SORT ANSWER:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
};
