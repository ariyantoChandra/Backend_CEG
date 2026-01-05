import db from "../../config/database.js";
import bcrypt from "bcrypt";
// HAPUS import uuid karena ID database Anda Auto Increment (Integer)
// import { v4 as uuidv4 } from "uuid"; 

// Helper untuk mengambil nama file
const getFilePath = (files, fieldname) => {
  if (files && files[fieldname]) {
    const file = Array.isArray(files[fieldname])
      ? files[fieldname][0]
      : files[fieldname];
    return file.filename;
  }
  return null;
};

export const register = async (req, res) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const {
      nama_tim,
      password,
      email,
      asal_sekolah,
      no_wa,
      id_line,
      kategori_biaya, 
      members,        
      bukti_pembayaran_path, 
      paket,          
      status_pembayaran, 
    } = req.body;

    const files = req.files;

    // 1. CEK DUPLIKASI NAMA TIM
    const [existingUser] = await connection.execute(
      "SELECT id FROM user WHERE nama_tim = ?",
      [nama_tim]
    );

    if (existingUser.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: "Nama tim sudah terdaftar. Silakan gunakan nama lain.",
      });
    }

    // 2. INSERT USER (GUNAKAN AUTO INCREMENT)
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // PERUBAHAN DISINI: Jangan kirim ID manual, biarkan null/default
    const [userResult] = await connection.execute(
      "INSERT INTO user (nama_tim, password, role) VALUES (?, ?, ?)",
      [nama_tim, hashedPassword, "PESERTA"]
    );

    // AMBIL ID YANG BARU SAJA DIBUAT OLEH DATABASE
    const userId = userResult.insertId;

    // 3. LOGIKA BUKTI PEMBAYARAN
    let finalBuktiPembayaran = getFilePath(files, "bukti_pembayaran");
    
    if (!finalBuktiPembayaran && bukti_pembayaran_path) {
        finalBuktiPembayaran = bukti_pembayaran_path;
    }

    // 4. INSERT TIM (Gunakan userId yang didapat dari insertId)
    await connection.execute(
      `INSERT INTO tim (
        user_id, email, asal_sekolah, no_wa, id_line, 
        kategori_biaya, status_pembayaran, bukti_pembayaran, paket
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        email,
        asal_sekolah,
        no_wa,
        id_line,
        kategori_biaya || "NORMAL",
        status_pembayaran || "unverified",
        finalBuktiPembayaran,
        paket || "SINGLE",
      ]
    );

    // 5. INSERT MEMBERS
    let membersArray = [];
    try {
      membersArray = JSON.parse(members);
    } catch (e) {
      membersArray = [];
    }

    for (let i = 0; i < membersArray.length; i++) {
      const m = membersArray[i];
      
      const pasFoto = getFilePath(files, `member_${i}_pas_foto`);
      const kartuPelajar = getFilePath(files, `member_${i}_kartu_pelajar`);
      const followCeg = getFilePath(files, `member_${i}_follow_ceg`);
      const followTk = getFilePath(files, `member_${i}_follow_tk`);

      await connection.execute(
        `INSERT INTO member (
          tim_user_id, nama_anggota, pola_makan, alergi, penyakit_bawaan,
          pas_foto, kartu_pelajar, bukti_follow_ceg, bukti_follow_tekikkimia
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          m.nama_anggota,
          m.pola_makan,
          m.alergi,
          m.penyakit_bawaan,
          pasFoto,
          kartuPelajar,
          followCeg,
          followTk,
        ]
      );
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Registrasi berhasil.",
      data: {
        userId: userId,
        buktiPembayaranPath: finalBuktiPembayaran, 
      },
    });

  } catch (error) {
    await connection.rollback();
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat registrasi.",
    });
  } finally {
    connection.release();
  }
};