import db from "../../../config/database.js";
import { checkToken } from "../../../config/checkToken.js";
import checkBattleResult from "./checkCard.js";

export const getSelectedCard = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "There is no Token sent!",
      });
    }

    const token = authHeader.split(" ")[1];
    const { valid, expired, decoded } = checkToken(token);

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: expired ? "Token expired." : "Token invalid.",
      });
    }

    const userId = decoded.id;
    const { game_session_id } = req.body;

    const [session] = await db.execute(
      "SELECT tim_id1, tim_id2 FROM game_session WHERE id = ?",
      [game_session_id],
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
      `SELECT id, selected_card FROM user WHERE id IN (?, ?)`,
      [tim_id1, tim_id2],
    );

    if (cards.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Kedua tim harus memilih kartu!",
      });
    }

    // mapping berdasarkan ID (ANTI TERBALIK)
    const cardMap = {};
    for (const row of cards) {
      cardMap[row.id] = row.selected_card;
    }

    if (!cardMap[tim_id1] || !cardMap[tim_id2]) {
      return res.status(400).json({
        success: false,
        message: "Kedua tim harus memilih kartu!",
      });
    }

    if (userId === tim_id1) {
      const battleResult = checkBattleResult(
        tim_id1,
        cardMap[tim_id1],
        tim_id2,
        cardMap[tim_id2],
      );

      if (battleResult.result1 === "menang") {
        await db.execute(
          "UPDATE game_session SET score1 = score1 + 1 WHERE id = ?",
          [game_session_id],
        );
      }

      return res.status(200).json({
        success: true,
        message: "Hasil battle berhasil dihitung!",
        data: {
          tim1: tim_id1,
          card_tim1: cardMap[tim_id1],
          result1: battleResult.result1,
          tim2: tim_id2,
          card_tim2: cardMap[tim_id2],
          result2: battleResult.result2,
        },
      });
    }

    if (userId === tim_id2) {
      const battleResult = checkBattleResult(
        tim_id2,
        cardMap[tim_id2],
        tim_id1,
        cardMap[tim_id1],
      );

      if (battleResult.result1 === "menang") {
        await db.execute(
          "UPDATE game_session SET score2 = score2 + 1 WHERE id = ?",
          [game_session_id],
        );
      }

      return res.status(200).json({
        success: true,
        message: "Hasil battle berhasil dihitung!",
        data: {
          tim1: tim_id2,
          card_tim1: cardMap[tim_id2],
          result1: battleResult.result1,
          tim2: tim_id1,
          card_tim2: cardMap[tim_id1],
          result2: battleResult.result2,
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
