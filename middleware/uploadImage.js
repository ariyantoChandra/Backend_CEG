// import multer from "multer";
// import path from "path";
// import fs from "fs";

// // Direktori upload lokal
// const uploadDir = "public/uploads";

// // Mapping nama field ke folder (contoh)
// const fieldToFolder = {
//   // Team files
//   bukti_pembayaran: "pembayaran",

//   // Member files
//   pas_foto: "member/pas_foto",
//   kartu_pelajar: "member/kartu_pelajar",
//   follow_ceg: "member/follow_ceg",
//   follow_tk: "member/follow_tk",
// };

// // Helper function untuk mendapatkan subfolder berdasarkan fieldname
// const getSubfolderByField = (fieldname) => {
//   // Cek exact match dulu
//   if (fieldToFolder[fieldname]) {
//     return fieldToFolder[fieldname];
//   }

//   // Untuk member_0_pas_foto, member_1_pas_foto, dst
//   // Extract tipe file dari pattern member_*_namafield
//   const memberMatch = fieldname.match(/^member_\d+_(.+)$/);
//   if (memberMatch) {
//     const fileType = memberMatch[1];
//     if (fieldToFolder[fileType]) {
//       return fieldToFolder[fileType];
//     }
//   }

//   // Default folder jika tidak ada mapping
//   return "lainnya";
// };

// // Pastikan folder upload tersedia
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // Konfigurasi penyimpanan file
// const storage = multer.diskStorage({
//   // Menentukan folder tujuan berdasarkan field name
//   destination: (req, file, cb) => {
//     const subfolder = getSubfolderByField(file.fieldname);
//     const fullPath = path.join(uploadDir, subfolder);

//     // Buat folder jika belum ada
//     fs.mkdirSync(fullPath, { recursive: true });

//     cb(null, fullPath);
//   },

//   // Mengatur nama file agar unik dan aman
//   filename: (req, file, cb) => {
//     // Mengambil nama tim untuk identitas file
//     const namaTim = req.body.nama_tim
//       ? req.body.nama_tim.replace(/\s+/g, "_")
//       : "unknown";

//     // Mengambil ekstensi file asli
//     const ext = path.extname(file.originalname);

//     // format: namaTim_fieldname_timestamp.ext
//     cb(null, `${namaTim}_${file.fieldname}_${Date.now()}${ext}`);
//   },
// });

// // Filter tipe file (hanya gambar)
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = /jpeg|jpg|png/;

//   const extnameValid = allowedTypes.test(
//     path.extname(file.originalname).toLowerCase()
//   );

//   const mimetypeValid = allowedTypes.test(file.mimetype);

//   if (extnameValid && mimetypeValid) {
//     cb(null, true);
//   } else {
//     cb(new Error("Hanya file gambar (JPG/PNG) yang diperbolehkan!"));
//   }
// };

// // Middleware upload
// export const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 10 * 1024 * 1024, // maksimal 10mb per file
//   },
// });
