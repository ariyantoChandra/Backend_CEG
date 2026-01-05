import db from "../../config/database.js";

export const getTeamDetail = async (req, res) => {
  try {
    const { teamId } = req.params;

    // Validasi team id
    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: "team id wajib dikirim",
      });
    }

    // UPDATE QUERY: Tambahkan paket, kategori_biaya, notes, bukti_pembayaran
    const [teamRows] = await db.execute(
      `SELECT 
        id, user_id, email, asal_sekolah, no_wa, id_line, 
        kategori_biaya, paket, bukti_pembayaran, 
        status_pembayaran, notes, total_points, status
       FROM tim 
       WHERE user_id = ?`,
      [teamId]
    );

    // Ambil nama tim dari tabel user
    const [userRows] = await db.execute(
        "SELECT nama_tim FROM user WHERE id = ?",
        [teamId]
    );

    if (teamRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "tim tidak ditemukan",
      });
    }

    const teamData = {
        ...teamRows[0],
        nama_tim: userRows[0]?.nama_tim || "Unknown Team"
    };

    // Mengambil data member berdasarkan user_id
    const [memberRows] = await db.execute(
      "select * from member where tim_user_id = ?",
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
    console.error("get team detail error:", error);
    return res.status(500).json({
      success: false,
      message: "terjadi kesalahan server",
    });
  }
};