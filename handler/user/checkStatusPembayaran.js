import db from "../../config/database.js";

export const checkStatusPendaftaran = async (req, res) => {
  try {
    const { nama_tim } = req.query; // bisa juga ambil dari JWT kalau mau

    if (!nama_tim) {
      return res.status(400).json({
        success: false,
        message: "Nama tim wajib diisi.",
      });
    }

    const [rows] = await db.execute(
      "SELECT nama_tim, status_pembayaran FROM tim WHERE nama_tim = ?",
      [nama_tim]
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
        nama_tim: rows[0].nama_tim,
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