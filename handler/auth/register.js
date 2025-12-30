import db from "../../config/database.js";

export const register = async (req, res) => {
  // Gunakan connection dari pool untuk transaction
  const connection = await db.getConnection(); 

  try {
    // 1. TANGKAP DATA DARI FORM DATA
    // Karena pakai Multer, req.body berisi text, req.files berisi file
    const {
      nama_tim, password, email, asal_sekolah, no_wa, id_line,
      kategori_biaya, paket, members: membersString
    } = req.body;

    // 2. PARSING DATA MEMBER (PENTING!)
    // FormData mengirim array sebagai String JSON, jadi harus kita parse balik
    let members = [];
    try {
        members = JSON.parse(membersString);
    } catch (e) {
        members = []; 
    }

    // 3. FUNGSI BANTU CARI NAMA FILE
    // Multer menyimpan info file di req.files. Kita cari berdasarkan nama field-nya.
    const getFilename = (fieldname) => {
        // Cek apakah req.files ada isinya
        if (!req.files || req.files.length === 0) return null;
        
        const found = req.files.find(f => f.fieldname === fieldname);
        return found ? found.filename : null;
    };

    // Ambil bukti pembayaran
    const buktiPembayaranFile = getFilename('bukti_pembayaran');

    // 4. VALIDASI INPUT
    if (!nama_tim || !password || !asal_sekolah) {
        return res.status(400).json({ success: false, message: "Data wajib diisi (Nama Tim, Password, Asal Sekolah)" });
    }

    // MULAI TRANSAKSI DATABASE
    await connection.beginTransaction();

    // 5. CEK DUPLIKASI NAMA TIM
    const [existingUser] = await connection.execute(
      "SELECT id FROM `user` WHERE nama_tim = ?",
      [nama_tim]
    );

    if (existingUser.length > 0) {
      await connection.rollback();
      return res.status(409).json({ success: false, message: "Nama tim sudah terdaftar." });
    }

    // 6. INSERT KE TABEL USER
    const [insertUser] = await connection.execute(
        "INSERT INTO `user` (nama_tim, password, role, status, total_points, total_coin) VALUES (?, ?, 'PESERTA', 'KOSONG', 0, 0)",
        [nama_tim, password]
    );
    const newUserId = insertUser.insertId;

    // 7. INSERT KE TABEL TIM
    await connection.execute(
      `INSERT INTO tim (
        id, nama_tim, email, asal_sekolah, no_wa, id_line,
        kategori_biaya, paket, bukti_pembayaran, status_pembayaran, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'unverified', '')`,
      [
        newUserId, 
        nama_tim, 
        email ?? null, 
        asal_sekolah, 
        no_wa ?? null, 
        id_line ?? null,
        kategori_biaya, 
        paket, 
        buktiPembayaranFile // <--- ISI DENGAN NAMA FILE DARI MULTER
      ]
    );

    // 8. INSERT KE TABEL MEMBER
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      
      // Cari nama file untuk setiap member berdasarkan index (0, 1, 2)
      // Nama field ini harus SAMA PERSIS dengan yang dikirim dari Frontend (FormData)
      const pasFoto = getFilename(`member_${i}_pas_foto`);
      const kartuPelajar = getFilename(`member_${i}_kartu_pelajar`);
      const followCeg = getFilename(`member_${i}_follow_ceg`); // Sesuaikan nama field frontend
      const followTk = getFilename(`member_${i}_follow_tk`);   // Sesuaikan nama field frontend

      await connection.execute(
        `INSERT INTO member (
          tim_id, nama_anggota, pola_makan, alergi, penyakit_bawaan,
          pas_foto, kartu_pelajar, bukti_follow_ceg, bukti_follow_tkubaya
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newUserId, 
          member.nama_anggota, 
          member.pola_makan, 
          member.alergi || '-', 
          member.penyakit_bawaan || '-',
          pasFoto,      // Simpan nama file
          kartuPelajar, // Simpan nama file
          followCeg,    // Simpan nama file
          followTk      // Simpan nama file
        ]
      );
    }

    // SELESAI
    await connection.commit();
    return res.status(201).json({ success: true, message: "Pendaftaran Berhasil" });

  } catch (error) {
    await connection.rollback();
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ success: false, message: "Server Error: " + error.message });
  } finally {
    connection.release();
  }
};