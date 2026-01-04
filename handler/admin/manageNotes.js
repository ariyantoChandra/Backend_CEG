import db from "../../config/database.js";

export const manageNotes = async (req, res) => {
  try {
    // Mengambil user_id dari query
    const { timId } = req.query;
    const { notes } = req.body;

    // Validasi user id
    if (!timId) {
      return res.status(400).json({
        success: false,
        message: "user id wajib dikirim",
      });
    }

    // Update catatan tim
    const [result] = await db.execute(
      "update tim set notes = ? where user_id = ?",
      [notes ?? "", timId]
    );

    // Cek apakah data benar-benar terupdate
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "tim tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "catatan tim berhasil diperbarui",
    });

  } catch (error) {
    console.error("manage notes error:", error);
    return res.status(500).json({
      success: false,
      message: "terjadi kesalahan server",
    });
  }
};
