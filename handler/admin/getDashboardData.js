import db from "../../config/database.js";

export const getAllTeams = async (req, res) => {
  try {
    // Query: Ambil data tim + Hitung jumlah member per tim
    const [teams] = await db.execute(`
      SELECT 
        t.id, 
        t.nama_tim, 
        t.asal_sekolah, 
        t.status_pembayaran,
        COUNT(m.id) as jumlah_anggota
      FROM tim t
      LEFT JOIN member m ON t.id = m.tim_id
      GROUP BY t.id
      ORDER BY t.id DESC
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