import db from "../../config/database.js";

export const register = async (req, res) => {
  // Ambil koneksi database dari pool
  const connection = await db.getConnection();

  // Penanda apakah transaksi sudah dimulai
  let transactionStarted = false;

  try {
    // Debug data dari frontend
    console.log("cek body:", req.body);
    console.log("cek files:", req.files);

    // Ambil data dari request body
    const {
      nama_tim,
      password,
      email,
      asal_sekolah,
      no_wa,
      id_line,
      kategori_biaya,
      paket,
      members: membersString,
    } = req.body;

    // Parsing data members dari formdata
    let members = [];
    try {
      if (typeof membersString === "string") {
        members = JSON.parse(membersString);
      } else if (Array.isArray(membersString)) {
        members = membersString;
      }
    } catch {
      return res.status(400).json({
        success: false,
        message: "format data member tidak valid",
      });
    }

    // Pastikan members berbentuk array dan tidak kosong
    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: "minimal harus ada 1 anggota tim",
      });
    }

    // Mapping field ke subfolder (sesuai dengan uploadImage.js)
    const fieldToFolder = {
      bukti_pembayaran: "pembayaran",
      pas_foto: "member/pas_foto",
      kartu_pelajar: "member/kartu_pelajar",
      follow_ceg: "member/follow_ceg",
      follow_tk: "member/follow_tk",
    };

    // Helper untuk mengambil path file dari multer
    const getFilePath = (fieldname) => {
      if (!req.files) return null;
      const file = req.files.find((f) => f.fieldname === fieldname);
      if (!file) return null;

      // Tentukan subfolder berdasarkan fieldname
      let subfolder = fieldToFolder[fieldname];
      
      // Untuk member_*_namafield, extract namafield
      const memberMatch = fieldname.match(/^member_\d+_(.+)$/);
      if (memberMatch) {
        const fileType = memberMatch[1];
        subfolder = fieldToFolder[fileType] || "lainnya";
      }

      // Return relative path untuk disimpan di database
      return subfolder ? `${subfolder}/${file.filename}` : file.filename;
    };

    // Ambil bukti pembayaran dengan path folder
    const buktiPembayaranFile = getFilePath("bukti_pembayaran");

    // Validasi input utama
    if (!nama_tim || !password || !asal_sekolah) {
      return res.status(400).json({
        success: false,
        message: "nama tim, password, dan asal sekolah wajib diisi",
      });
    }

    // Mulai transaksi database
    await connection.beginTransaction();
    transactionStarted = true;

    // Cek apakah nama tim sudah terdaftar
    const [existingUser] = await connection.execute(
      "select id from user where nama_tim = ?",
      [nama_tim]
    );

    if (existingUser.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: "nama tim sudah terdaftar",
      });
    }

    // Insert data ke tabel user
    const [insertUser] = await connection.execute(
      "insert into user (nama_tim, password, role, selected_card) values (?, ?, 'peserta', null)",
      [nama_tim, password]
    );

    const newUserId = insertUser.insertId;

    // Insert data ke tabel tim
    await connection.execute(
      `insert into tim (
        user_id, email, asal_sekolah, no_wa, id_line,
        kategori_biaya, paket, bukti_pembayaran,
        status_pembayaran, notes, total_points, total_coin, status
      ) values (?, ?, ?, ?, ?, ?, ?, ?, 'unverified', '', 0, 0, 'kosong')`,
      [
        newUserId,
        email ?? null,
        asal_sekolah,
        no_wa ?? null,
        id_line ?? null,
        kategori_biaya,
        paket,
        buktiPembayaranFile,
      ]
    );

    // Insert data anggota tim
    for (let i = 0; i < members.length; i++) {
      const member = members[i];

      // Validasi minimal data anggota
      if (!member.nama_anggota || !member.pola_makan) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `data anggota ke-${i + 1} belum lengkap`,
        });
      }

      const pasFoto = getFilePath(`member_${i}_pas_foto`);
      const kartuPelajar = getFilePath(`member_${i}_kartu_pelajar`);
      const followCeg = getFilePath(`member_${i}_follow_ceg`);
      const followTk = getFilePath(`member_${i}_follow_tk`);

      await connection.execute(
        `insert into member (
          tim_user_id, nama_anggota, pola_makan, alergi, penyakit_bawaan,
          pas_foto, kartu_pelajar, bukti_follow_ceg, bukti_follow_tkubaya
        ) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newUserId,
          member.nama_anggota,
          member.pola_makan,
          member.alergi ?? null,
          member.penyakit_bawaan ?? null,
          pasFoto,
          kartuPelajar,
          followCeg,
          followTk,
        ]
      );
    }

    // Simpan semua perubahan ke database
    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "pendaftaran berhasil",
    });

  } catch (error) {
    // Batalkan transaksi jika terjadi error
    if (transactionStarted) {
      await connection.rollback();
    }

    console.error("register error:", error);

    return res.status(500).json({
      success: false,
      message: "server error: " + error.message,
    });

  } finally {
    // Kembalikan koneksi ke pool
    connection.release();
  }
};
