import express from "express";
import { verifyPayment } from "./verifyPayment.js";
import { manageNotes } from "./manageNotes.js";

const router = express.Router();

// Verifikasi pembayaran tim
router.put("/verify-payment/:timId", verifyPayment);

// Tambah / update catatan tim
router.put("/manage-notes/:timId", manageNotes);

export default router;