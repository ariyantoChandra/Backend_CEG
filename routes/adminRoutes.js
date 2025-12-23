import express from "express";
import { verifyPayment } from "../handler/admin/verifyPayment.js";
import { manageNotes } from "../handler/admin/manageNotes.js";

const router = express.Router();

// Verifikasi pembayaran tim
router.put("/verify-payment", verifyPayment);

// Tambah / update catatan tim
router.put("/manage-notes", manageNotes);

export default router;
