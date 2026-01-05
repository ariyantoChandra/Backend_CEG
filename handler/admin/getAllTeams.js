import db from "../../config/database.js";

export const getAllTeams = async (req, res) => {
  try {
    // Query mengambil data tim beserta nama dari tabel user
    // UPDATE: Menambahkan kolom 'paket' dan 'kategori_biaya'
    const [teams] = await db.execute(`
      SELECT 
        t.user_id as id,
        u.nama_tim,
        t.email,
        t.asal_sekolah,
        t.no_wa,
        t.status_pembayaran,
        t.bukti_pembayaran,
        t.paket,           
        t.kategori_biaya,
        t.total_points
      FROM tim t
      JOIN user u ON t.user_id = u.id
      ORDER BY t.user_id DESC
    `);

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil data semua tim",
      data: teams,
    });
  } catch (error) {
    console.error("GET ALL TEAMS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};