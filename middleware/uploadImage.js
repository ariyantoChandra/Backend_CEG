import multer from "multer";
import path from "path";
import fs from "fs";

// Direktori upload lokal
const uploadDir = "public/uploads";

// Mapping nama field ke folder
const fieldToFolder = {
  bukti_pembayaran: "pembayaran",
  pas_foto: "member/pas_foto",
  kartu_pelajar: "member/kartu_pelajar",
  follow_ceg: "member/follow_ceg",
  follow_tk: "member/follow_tk",
};

// Helper: Tentukan folder berdasarkan fieldname
const getSubfolderByField = (fieldname) => {
  // 1. Cek Exact Match
  if (fieldToFolder[fieldname]) return fieldToFolder[fieldname];

  // 2. Cek Pattern Bundle/Single Baru (t0_m0_pas_foto)
  // Regex: t[angka]_m[angka]_[tipefile]
  const match = fieldname.match(/^t\d+_m\d+_(.+)$/);
  if (match) {
    const fileType = match[1]; // ambil kata "pas_foto"
    if (fieldToFolder[fileType]) return fieldToFolder[fileType];
  }

  return "lainnya";
};

// Pastikan folder tersedia
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subfolder = getSubfolderByField(file.fieldname);
    const fullPath = path.join(uploadDir, subfolder);
    fs.mkdirSync(fullPath, { recursive: true });
    cb(null, fullPath);
  },

  filename: (req, file, cb) => {
    let finalName = "FILE";
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);

    // 1. AMBIL DATA TIM DARI JSON (teams_data)
    let teams = [];
    if (req.body.teams_data) {
      try {
        teams = JSON.parse(req.body.teams_data);
      } catch (e) {
        teams = [];
      }
    } else if (req.body.nama_tim) {
      // Fallback kalo pake cara lama (Single tanpa JSON)
      teams = [{ nama_tim: req.body.nama_tim }];
    }

    // 2. ANALISA KEY: tX_mY_tipefile (Contoh: t0_m0_pas_foto)
    const match = file.fieldname.match(/^t(\d+)_m(\d+)_(.+)$/);

    if (match) {
      const teamIndex = parseInt(match[1]);   // t0 -> 0
      const memberIndex = parseInt(match[2]); // m0 -> 0
      // const fileType = match[3];           // pas_foto (Opsional kalo mau dipake)

      // Ambil Nama Tim Asli berdasarkan Index t0 tadi
      if (teams[teamIndex] && teams[teamIndex].nama_tim) {
        const realTeamName = teams[teamIndex].nama_tim.replace(/\s+/g, "_");
        
        // FORMAT CANTIK: NamaTim_member_0_pas_foto_Timestamp.png
        finalName = `${realTeamName}_member_${memberIndex}_${match[3]}`;
      } else {
        // Kalau nama tim gak ketemu, terpaksa pake t0_m0
        finalName = file.fieldname;
      }
    } 
    // 3. CEK BUKTI PEMBAYARAN
    else if (file.fieldname === "bukti_pembayaran") {
      // Biasanya milik tim pertama (index 0)
      if (teams[0] && teams[0].nama_tim) {
        const realTeamName = teams[0].nama_tim.replace(/\s+/g, "_");
        finalName = `${realTeamName}_bukti_pembayaran`;
      } else {
        finalName = "bukti_pembayaran";
      }
    } 
    // 4. FALLBACK LAINNYA
    else {
        // Coba cari nama tim kalau file lain
        const prefix = teams[0]?.nama_tim?.replace(/\s+/g, "_") || "UNKNOWN";
        finalName = `${prefix}_${file.fieldname}`;
    }

    // Gabungkan nama final dengan timestamp & ekstensi
    cb(null, `${finalName}_${timestamp}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  if (allowedTypes.test(file.mimetype) && allowedTypes.test(path.extname(file.originalname).toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file gambar (JPG/PNG)!"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});