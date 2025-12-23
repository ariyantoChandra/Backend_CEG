import db from "../../config/database.js";
import bcrypt from "bcrypt";

export const register = async (req, res) => {
  try {
    const {
      nama_tim,
      password,
      email,
      asal_sekolah,
      no_wa,
      id_line,
      kategori_biaya,       // ENUM: 'EARLY_BIRD', 'NORMAL'
      paket,                // ENUM: 'SINGLE', 'BUNDLE'
      bukti_pembayaran,
      members               // Array of 3 anggota
    } = req.body;

    // Validasi data tim
    if (!nama_tim || !password || !asal_sekolah) {
      return res.status(400).json({
        success: false,
        message: "Nama tim, password, dan asal sekolah wajib diisi."
      });
    }

    // Validasi jumlah anggota
    if (!Array.isArray(members) || members.length !== 3) {
      return res.status(400).json({
        success: false,
        message: "Jumlah anggota tim wajib 3 orang."
      });
    }

    // Cek apakah nama tim sudah terdaftar di tabel tim
    const [existingTim] = await db.execute(
      "SELECT id FROM tim WHERE nama_tim = ?",
      [nama_tim]
    );
    if (existingTim.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Nama tim sudah terdaftar."
      });
    }

    // Simpan data tim ke tabel tim
    const [insertTim] = await db.execute(
      `INSERT INTO tim (
        nama_tim, email, asal_sekolah, no_wa, id_line,
        kategori_biaya, paket, bukti_pembayaran,
        status_pembayaran, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'unverified', '')`,
      [
        nama_tim,
        email,
        asal_sekolah,
        no_wa,
        id_line,
        kategori_biaya,
        paket,
        bukti_pembayaran
      ]
    );
    const tim_id = insertTim.insertId;

    // Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan akun login ke tabel user
    await db.execute(
      `INSERT INTO user (
        nama_tim, password, role,
        current_pos, total_points, total_coin, status
      ) VALUES (?, ?, 'PESERTA', 0, 0, 0, 'KOSONG')`,
      [nama_tim, hashedPassword]
    );

    // Simpan data anggota ke tabel member
    for (const member of members) {
      await db.execute(
        `INSERT INTO member (
          tim_id, nama_anggota, pas_foto, kartu_pelajar,
          bukti_follow_ceg, bukti_follow_tkubaya,
          alergi, penyakit_bawaan, pola_makan
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tim_id,
          member.nama_anggota,
          member.pas_foto,
          member.kartu_pelajar,
          member.bukti_follow_ceg,
          member.bukti_follow_tkubaya,
          member.alergi,
          member.penyakit_bawaan,
          member.pola_makan // ENUM: 'NORMAL', 'VEGETARIAN', 'VEGAN'
        ]
      );
    }

    // Response sukses
    return res.status(201).json({
      success: true,
      message: "Selamat, pendaftaran tim berhasil.",
      data: {
        id_tim: tim_id,
        nama_tim,
        jumlah_anggota: members.length
      }
    });

  } catch (error) {
    console.error("ERROR REGISTER:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message
    });
  }
};