import db from "../../config/database.js";

export const checkStatusPendaftaran = async (req, res) => {
  try {
    const { user_id } = req.query; // bisa juga ambil dari JWT kalau mau

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "Nama tim wajib diisi.",
      });
    }

    const [rows] = await db.execute(
      "SELECT user_id, status_pembayaran FROM tim WHERE user_id = ?",
      [user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Data tim tidak ditemukan.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Berhasil mendapatkan status pendaftaran",
      data: {
        user_id: rows[0].user_id,
        status_pembayaran: rows[0].status_pembayaran, // verified / unverified
      },
    });
  } catch (error) {
    console.error("ERROR CEK STATUS PENDAFTARAN:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
};
