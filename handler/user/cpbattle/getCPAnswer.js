import db from "../../../config/database.js";
import { checkToken } from "../../../config/checkToken.js";

export const getCPAnswer = async (req, res) => {
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

    const { game_session_id, answer, toolId } = req.body;

    if (!game_session_id) {
      return res.status(400).json({
        success: false,
        message: "Game session ID is required.",
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

    const [cpQuestion] = await db.execute(
      "SELECT correct_answer FROM cp_questions WHERE cp_tool_id = ?",
      [toolId],
    );

    if (cpQuestion[0].correct_answer === answer) {
      if (gameSession[0].tim_id1 === userId) {
        await db.execute(
          "UPDATE game_session SET score_team1 = score_team1 + 1 WHERE id = ?",
          [game_session_id],
        );
      } else if (gameSession[0].tim_id2 === userId) {
        await db.execute(
          "UPDATE game_session SET score_team2 = score_team2 + 1 WHERE id = ?",
          [game_session_id],
        );
      }
      return res.status(200).json({
        success: true,
        data: { correct: true },
      });
    } else if (cpQuestion[0].correct_answer !== answer) {
      await db.execute();
      return res.status(200).json({
        success: true,
        data: {
          correct: false,
        },
      });
    }
  } catch (error) {
    console.error("ERROR GET CP ANSWER:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
};
