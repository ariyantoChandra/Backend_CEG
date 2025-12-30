import db from "../../config/database.js";

export const verifyPayment = async (req, res) => {
  try {
    // 1. CEK DATA MASUK (DEBUGGING)
    // Lihat terminal backend saat Anda klik tombol verifikasi
    console.log("--- DEBUG VERIFY PAYMENT ---");
    console.log("Params (Team ID):", req.params);
    console.log("Body (Data):", req.body); 

    const { teamId } = req.params;
    const { status } = req.body;

    // 2. VALIDASI KEAMANAN
    // Jika status atau teamId kosong, stop di sini (Jangan lanjut ke SQL)
    if (!status) {
        console.error("GAGAL: Status undefined (kosong)");
        return res.status(400).json({ 
            success: false, 
            message: "Status (verified/unverified) wajib dikirim!" 
        });
    }

    if (!teamId) {
        return res.status(400).json({ 
            success: false, 
            message: "Team ID tidak ditemukan!" 
        });
    }

    // 3. EKSEKUSI DATABASE (Hanya jalan jika data lengkap)
    await db.execute(
      "UPDATE tim SET status_pembayaran = ? WHERE id = ?",
      [status, teamId]
    );

    console.log("SUKSES UPDATE DATABASE");

    return res.status(200).json({
      success: true,
      message: `Status tim berhasil diubah menjadi ${status}`,
    });

  } catch (error) {
    console.error("ERROR VERIFY PAYMENT:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};