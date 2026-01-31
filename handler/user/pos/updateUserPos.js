import db from "../../../config/database.js";
import { checkToken } from "../../../config/checkToken.js";

export const updateUserPos = async (req, res) => {
  try {
    const current_pos = req.body.current_pos;
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

    const [checkGameSession] = await db.execute(
      "SELECT * FROM game_session WHERE (tim_id1 = ? OR tim_id2 = ?) AND end_time IS NULL",
      [userId, userId],
    );

    if (checkGameSession.length !== 0) {
      return res.status(400).json({
        success: false,
        message: "Sedang berada di game lain! Tidak dapat pindah pos. ",
        data: {
          game_session_id: checkGameSession[0].id,
          penpos_id: checkGameSession[0].penpos_id,
        },
      });
    }

    await db.execute(
      "UPDATE tim SET pos_game_id = ?, status = 'MENUNGGU' WHERE user_id = ?",
      [current_pos, userId],
    );

    return res.status(200).json({
      success: true,
      message: "Berhasil update current pos & status peserta!",
    });
  } catch (error) {
    console.error("ERROR UPDATE POS:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
};
