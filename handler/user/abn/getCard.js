import db from "../../../config/database.js";
import { checkToken } from "../../../config/checkToken.js";

export const getCard = async (req, res) => {
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

    const { game_session_id, penpos_id } = req.body;

    const [findGameSession] = await db.execute(
      "SELECT tim_id1, tim_id2 FROM game_session WHERE id = ? && penpos_id = ? && end_time IS NULL",
      [game_session_id, penpos_id]
    );

    if (findGameSession.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Game session tidak ditemukan atau sudah berakhir!",
      });
    }

    const { tim_id1, tim_id2 } = findGameSession[0];

    const [cards] = await db.execute(
      `SELECT tim_user_id, asam_kuat, asam_lemah, netral, basa_kuat, basa_lemah FROM card WHERE tim_user_id IN (?, ?) ORDER BY FIELD(tim_user_id, ?, ?)`,
      [tim_id1, tim_id2, tim_id1, tim_id2]
    );

    if (cards.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Card tidak ditemukan!",
      });
    }
    const cards1 = cards[0];
    const cards2 = cards[1];

    if (tim_id1 === userId) {
      return res.status(200).json({
        success: true,
        message: "Berhasil mendapatkan kartu awal tim 1!",
        data: {
          tim1: tim_id1,
          card_tim1: cards1,
          tim2: tim_id2,
          card_tim2: cards2,
        },
      });
    } else if (tim_id2 === userId) {
      return res.status(200).json({
        success: true,
        message: "Berhasil mendapatkan kartu awal tim 2!",
        data: {
          tim1: tim_id2,
          card_tim1: cards2,
          tim2: tim_id1,
          card_tim2: cards1,
        },
      });
    }
  } catch (error) {
    console.error("ERROR GET CARD:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
};
