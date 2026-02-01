import db from "../../config/database.js";
import { checkToken } from "../../config/checkToken.js";

export const getTeamPlaying = async (req, res) => {
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

    const gameSession = req.query.gamesession;

    if (!gameSession) {
      return res.status(400).json({
        success: false,
        message: "gameSession wajib dikirim",
      });
    }

    const [gameSessionInfo] = await db.execute(
      "SELECT * FROM game_session WHERE id = ? AND end_time IS NULL",
      [gameSession],
    );

    if (gameSessionInfo.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Game session tidak ditemukan atau sudah selesai",
      });
    }

    const [namaTeam1] = await db.execute(
      "SELECT nama_tim FROM user WHERE id = ?",
      [gameSessionInfo[0].tim_id1],
    );
    const [namaTeam2] = await db.execute(
      "SELECT nama_tim FROM user WHERE id = ?",
      [gameSessionInfo[0].tim_id2],
    );

    return res.status(200).json({
      success: true,
      message: "Berhasil mendapatkan tim yang bermain!",
      data: [
        {
          id: gameSessionInfo[0].tim_id1,
          nama_tim: namaTeam1[0]?.nama_tim || "Tim 1",
          pos_game_id: gameSessionInfo[0].penpos_id,
        },
        {
          id: gameSessionInfo[0].tim_id2,
          nama_tim: namaTeam2[0]?.nama_tim || "Tim 2",
          pos_game_id: gameSessionInfo[0].penpos_id,
        },
      ],
    });
  } catch (error) {
    console.error("ERROR GET LIST TIM:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
};
