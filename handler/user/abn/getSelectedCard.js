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

    const { tim_id1, tim_id2 } = session[0];

    if (![tim_id1, tim_id2].includes(userId)) {
      return res.status(403).json({
        success: false,
        message: "User bukan bagian dari game session!",
      });
    }

    const [cards] = await db.execute(
      `SELECT id, selected_card 
       FROM user 
       WHERE id IN (?, ?) 
       ORDER BY FIELD(id, ?, ?)`,
      [tim_id1, tim_id2, tim_id1, tim_id2]
    );

    if (!cards || cards.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Salah satu tim belum memilih kartu!",
      });
    }

    const cardTim1 = cards[0].selected_card;
    const cardTim2 = cards[1].selected_card;

    if (!cardTim1 || !cardTim2) {
      return res.status(400).json({
        success: false,
        message: "Kedua tim harus memilih kartu!",
      });
    }

    const battleResult = checkBattleResult(
      tim_id1,
      cardTim1,
      tim_id2,
      cardTim2
    );

    await db.execute("UPDATE user SET selected_card = NULL WHERE id = ?", [
      userId,
    ]);

    if (userId === tim_id1) {
      return res.status(200).json({
        success: true,
        message: "Hasil battle berhasil dihitung!",
        data: {
          tim1: tim_id1,
          card_tim1: cardTim1,
          result_tim1: battleResult.result1,
          tim2: tim_id2,
          card_tim2: cardTim2,
          result_tim2: battleResult.result2,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hasil battle berhasil dihitung!",
      data: {
        tim1: tim_id2,
        card_tim1: cardTim2,
        result_tim1: battleResult.result2,
        tim2: tim_id1,
        card_tim2: cardTim1,
        result_tim2: battleResult.result1,
      },
    });
  } catch (error) {
    console.error("ERROR GET SELECTED CARD:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
};
