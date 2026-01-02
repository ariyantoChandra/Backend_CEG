import db from "../../config/database.js";

export const getAllTeams = async (req, res) => {
  try {
    // Query: Ambil data tim + Hitung jumlah member per tim
    const [teams] = await db.execute(`
      SELECT 
        t.user_id, 
        t.nama_tim, 
        t.asal_sekolah, 
        t.status_pembayaran,
        COUNT(m.id) as jumlah_anggota
      FROM tim t
      LEFT JOIN member m ON t.user_id = m.tim_user_id
      GROUP BY t.user_id
      ORDER BY t.user_id DESC
    `);

    return res.status(200).json({
      success: true,
      data: teams,
    });
  } catch (error) {
    console.error("GET ALL TEAMS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
