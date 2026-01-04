import db from "../../config/database.js";

export const getAllTeams = async (req, res) => {
  try {
    // Mengambil data tim dan hitung jumlah anggota per tim
    const [teams] = await db.execute(`
      select 
        t.user_id,
        u.nama_tim,
        t.asal_sekolah,
        t.status_pembayaran,
        count(m.id) as jumlah_anggota
      from tim t
      join user u on t.user_id = u.id
      left join member m on t.user_id = m.tim_user_id
      group by t.user_id
      order by t.user_id desc
    `);

    return res.status(200).json({
      success: true,
      data: teams,
    });

  } catch (error) {
    console.error("get all teams error:", error);
    return res.status(500).json({
      success: false,
      message: "terjadi kesalahan server",
    });
  }
};
