import db from "../../config/database.js";

export const getTeamDetail = async (req, res) => {
  try {
    const { teamId } = req.params;

    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: "Team ID wajib dikirim.",
      });
    }

    // UPDATE QUERY: Mengambil paket, notes, bukti_pembayaran
    const [teamRows] = await db.execute(
      `SELECT 
        user_id, 
        email, 
        asal_sekolah, 
        no_wa, 
        id_line, 
        kategori_biaya, 
        paket, 
        status_pembayaran, 
        bukti_pembayaran, 
        notes, 
        total_points
       FROM tim 
       WHERE user_id = ?`,
      [teamId]
    );

    if (teamRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tim tidak ditemukan.",
      });
    }

    // Ambil nama_tim dari tabel user
    const [userRows] = await db.execute(
      "SELECT nama_tim FROM user WHERE id = ?",
      [teamId]
    );

    const teamData = {
      ...teamRows[0],
      nama_tim: userRows[0]?.nama_tim || "Unknown Team",
    };

    // Ambil members
    const [memberRows] = await db.execute(
      "SELECT * FROM member WHERE tim_user_id = ?",
      [teamId]
    );

    return res.status(200).json({
      success: true,
      data: {
        ...teamData,
        members: memberRows,
      },
    });

  } catch (error) {
    console.error("Get Team Detail Error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server.",
    });
  }
};