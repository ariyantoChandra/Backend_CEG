import db from "../../../config/database.js";
import { checkToken } from "../../../config/checkToken.js";

export const checkReadyCard = async (req, res) => {
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

    const { game_session_id } = req.body;

    const [session] = await db.execute(
      "SELECT tim_id1, tim_id2 FROM game_session WHERE id = ?",
      [game_session_id]
    );

    if (session.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Game session tidak ditemukan!",
      });
    }

    const [cards] = await db.execute(
      "SELECT selected_card FROM user WHERE id IN (?, ?)",
      [session[0].tim_id1, session[0].tim_id2]
    );

    if (session[0].tim_id1 === userId) {
      return res.status(200).json({
        success: true,
        message: "Berhasil check kartu ready!",
        data: {
          tim1: session[0].tim_id1,
          card_tim1: cards[0].selected_card,
          tim2: session[0].tim_id2,
          card_tim2: cards[1].selected_card,
        },
      });
    } else if (session[0].tim_id2 === userId) {
      return res.status(200).json({
        success: true,
        message: "Berhasil check kartu ready!",
        data: {
          tim1: session[0].tim_id2,
          card_tim1: cards[1].selected_card,
          tim2: session[0].tim_id1,
          card_tim2: cards[0].selected_card,
        },
      });
    }
  } catch (error) {
    console.error("ERROR GET READY CARD:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
};
