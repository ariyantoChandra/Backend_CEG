import db from "../../config/database.js";

export const verifyPayment = async (req, res) => {
  try {
    // Debug data masuk
    console.log("verify payment params:", req.params);
    console.log("verify payment body:", req.body);
    console.log("verify payment file:", req.file);

    const { teamId } = req.params;
    const { status } = req.body;

    // Validasi team id
    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: "Team id tidak ditemukan",
      });
    }

    // Validasi status pembayaran
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status pembayaran wajib dikirim",
      });
    }

    // Validasi nilai status agar tidak sembarang
    const allowedStatus = ["verified", "unverified"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status tidak valid",
      });
    }

    // Update status pembayaran menggunakan user_id
    const [result] = await db.execute(
      "update tim set status_pembayaran = ? where user_id = ?",
      [status, teamId]
    );

    // Cek apakah data benar-benar terupdate
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Tim tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Status pembayaran berhasil diubah menjadi ${status}`,
    });

  } catch (error) {
    console.error("verify payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};
