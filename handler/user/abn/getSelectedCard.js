import db from "../../../config/database.js";
import { checkToken } from "../../../config/checkToken.js";
import checkBattleResult from "./checkCard.js";

export const getSelectedCard = async (req, res) => {
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

    const { game_session_id, card1, card2 } = req.body;

    const [tim] = await db.execute(
      "SELECT tim_id1, tim_id2 FROM game_session WHERE id = ?",
      [game_session_id]
    );

    const result = checkBattleResult(
      tim[0].tim_id1,
      card1,
      tim[0].tim_id2,
      card2
    );

    if (userId === tim[0].tim_id1) {
      await db.execute(`UPDATE user SET selected_card = NULL where id = ?`, [
        userId,
      ]);

      return res.status(200).json({
        success: true,
        message: "Berhasil mendapatkan kartu terpilih!",
        data: {
          tim1: tim[0].tim_id1,
          card_tim1: card1,
          tim2: tim[0].tim_id2,
          card_tim2: card2,
        },
      });
    } else if (userId === tim[0].tim_id2) {
      await db.execute(`UPDATE user SET selected_card = NULL where id = ?`, [
        userId,
      ]);
      return res.status(200).json({
        success: true,
        message: "Berhasil mendapatkan kartu terpilih!",
        data: {
          tim1: tim[0].tim_id2,
          card_tim1: card2,
          tim2: tim[0].tim_id1,
          card_tim2: card1,
        },
      });
    }
  } catch (error) {
    console.error("ERROR GET SELECTED CARD:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
};
