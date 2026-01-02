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

    const { game_session_id, answer } = req.body;
    const cp_tool_id = req.query.toolId;

    if (!game_session_id) {
      return res.status(400).json({
        success: false,
        message: "Game session ID is required.",
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

    const [cpQuestion] = await db.execute(
      "SELECT correct_answer FROM cp_questions WHERE cp_tool_id = ?",
      [cp_tool_id]
    );

    const [gameState] = await db.execute(
      "SELECT * FROM cp_game_state WHERE tim_user_id = ? AND game_session_id = ?",
      [userId, game_session_id]
    );

    if (cpQuestion[0].correct_answer === answer) {
      gameState[0].completed_count += 1;
      await db.execute(
        "UPDATE cp_game_state SET completed_count = ? WHERE id = ?",
        [gameState[0].completed_count, gameState[0].id]
      );
      return res.status(200).json({
        success: true,
        data: { correct: true },
      });
    } else if (cpQuestion[0].correct_answer !== answer) {
      await db.execute(
        "UPDATE cp_game_state SET freeze_until = ? WHERE id = ?",
        [new Date(Date.now() + 15000), gameState[0].id]
      );
      return res.status(200).json({
        success: true,
        data: {
          correct: false,
          freeze_until: new Date(Date.now() + 15000),
        },
      });
    }
  } catch (error) {
    console.error("ERROR GET CP TOOLS:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
};
