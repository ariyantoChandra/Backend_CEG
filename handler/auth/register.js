import db from "../../config/database.js";
import fs from "fs";
import path from "path";

// Helper: Bisa baca format Array maupun Object
const getFilePath = (files, fieldname) => {
  if (!files) return null;

  // Kasus 1: Jika files adalah Array (sesuai log kamu)
  if (Array.isArray(files)) {
    const file = files.find((f) => f.fieldname === fieldname);
    return file ? file.filename : null;
  }

  // Kasus 2: Jika files adalah Object
  if (files[fieldname]) {
    const target = files[fieldname];
    return Array.isArray(target) ? target[0].filename : target.filename;
  }

  return null;
};

export const register = async (req, res) => {
  console.log("=== MULAI REGISTER BUNDLE/SINGLE ===");

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // 1. AMBIL FILE BUKTI BAYAR SEKALI SAJA (GLOBAL)
    const files = req.files || [];
    let globalBuktiBayar = getFilePath(files, "bukti_pembayaran");

    if (!globalBuktiBayar && req.body.bukti_pembayaran_path) {
      globalBuktiBayar = req.body.bukti_pembayaran_path;
    }

    console.log("PATH BUKTI BAYAR:", globalBuktiBayar);

    // 2. PARSING DATA TIM
    let teamsList = [];
    if (req.body.teams_data) {
      try {
        teamsList = JSON.parse(req.body.teams_data);
      } catch (e) {
        console.error("Gagal parse teams_data", e);
        throw new Error("FORMAT_DATA_INVALID");
      }
    } else {
      teamsList = [req.body];
    }

    // 3. LOOPING INSERT
    for (let i = 0; i < teamsList.length; i++) {
      const team = teamsList[i];
      console.log(`Processing Tim ke-${i + 1}: ${team.nama_tim}`);

      // A. Insert User
      const [existing] = await connection.execute(
        "SELECT id FROM user WHERE nama_tim = ?",
        [team.nama_tim]
      );
      if (existing.length > 0)
        throw new Error(`NAMA_TIM_EXIST: ${team.nama_tim}`);

      const [userResult] = await connection.execute(
        "INSERT INTO user (nama_tim, password, role) VALUES (?, ?, ?)",
        [team.nama_tim, team.password, "PESERTA"]
      );
      const userId = userResult.insertId;

      // B. Insert Tim (Pakai globalBuktiBayar)
      await connection.execute(
        `INSERT INTO tim (
                user_id, email, asal_sekolah, no_wa, id_line, 
                kategori_biaya, status_pembayaran, bukti_pembayaran, paket
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          team.email,
          team.asal_sekolah,
          team.no_wa,
          team.id_line,
          team.kategori_biaya || "NORMAL",
          "unverified",
          globalBuktiBayar,
          team.paket || "SINGLE",
        ]
      );

      // C. Insert Members
      let membersArray = team.members || [];
      if (typeof membersArray === "string") {
        try {
          membersArray = JSON.parse(membersArray);
        } catch (e) {
          membersArray = [];
        }
      }

      for (let j = 0; j < membersArray.length; j++) {
        const m = membersArray[j];

        // --- PERBAIKAN PENTING DI SINI ---
        // Kita ambil file sesuai format key dari Frontend: t{i}_m{j}_...
        // i = index tim, j = index member

        const pasFoto = getFilePath(files, `t${i}_m${j}_pas_foto`);
        const kartuPelajar = getFilePath(files, `t${i}_m${j}_kartu_pelajar`);
        const followCeg = getFilePath(files, `t${i}_m${j}_follow_ceg`);
        const followTk = getFilePath(files, `t${i}_m${j}_follow_tk`);

        await connection.execute(
          `INSERT INTO member (
                    tim_user_id, nama_anggota, pola_makan, alergi, penyakit_bawaan,
                    pas_foto, kartu_pelajar, bukti_follow_ceg, bukti_follow_tkubaya
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            m.nama_anggota,
            m.pola_makan,
            m.alergi,
            m.penyakit_bawaan,
            pasFoto, // Masuk ke DB
            kartuPelajar, // Masuk ke DB
            followCeg, // Masuk ke DB
            followTk, // Masuk ke DB
          ]
        );
      }
    }

    await connection.commit();
    res.status(200).json({ success: true, message: "Register Berhasil" });
  } catch (error) {
    await connection.rollback();
    console.error("REGISTER ERROR:", error);

    // Hapus file jika gagal
    if (req.files) {
      const fileList = Array.isArray(req.files)
        ? req.files
        : Object.values(req.files).flat();
      fileList.forEach((f) => {
        if (f.path) fs.unlink(f.path, () => {});
      });
    }

    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};
