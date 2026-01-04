import { login } from "../handler/auth/login.js";
import { register } from "../handler/auth/register.js";
import { checkStatusPendaftaran } from "../handler/user/checkStatusPembayaran.js";
import express from "express";
// IMPORT MIDDLEWARE YANG BARU DIBUAT
// import { upload } from "../middleware/uploadImage.js";

const router = express.Router();

router.post("/login", login);

// TAMBAHKAN 'upload.any()' DI SINI
// Ini berfungsi untuk menangkap semua file yang dikirim dari Front-End
router.post("/register", upload.any(), register);
router.get("/check-status-pendaftaran", checkStatusPendaftaran);

export default router;
