import express from "express";
// Import Handler Auth
import { register } from "../handler/auth/register.js";
// Import Verifikasi Peserta
import { checkStatusPendaftaran } from "../handler/user/checkStatusPembayaran.js";

// Import Handler User/Game
import { getListPos } from "../handler/user/pos/getListPos.js";
import { updateUserPos } from "../handler/user/pos/updateUserPos.js";
import { getSelectedCard } from "../handler/user/abn/getSelectedCard.js";
import { getReadyCard } from "../handler/user/abn/getReadyCard.js";
import { getCard } from "../handler/user/abn/getCard.js";
import { exitWaitingRoom } from "../handler/user/pos/exitWaitingRoom.js";
import { checkAcc } from "../handler/user/pos/checkAcc.js";
import { getUserInfo } from "../handler/user/getUserInfo.js";
import { getSortItems } from "../handler/user/sort/getSortItems.js";
import { getSortAnswer } from "../handler/user/sort/getSortAnswer.js";
import { getAtomicItems } from "../handler/user/atomic/getAtomicItems.js";
import { getAtomicAnswer } from "../handler/user/atomic/getAtomicAnswer.js";
import { getAnswer } from "../handler/user/question/getAnswer.js";
import { getQuestion } from "../handler/user/question/getQuestion.js";
import { getCPTools } from "../handler/user/cpbattle/getCPTools.js";
import { getCPQuestion } from "../handler/user/cpbattle/getCPQuestion.js";
import { getCPAnswer } from "../handler/user/cpbattle/getCPAnswer.js";
import { checkReadyCard } from "../handler/user/abn/checkReady.js";
import { checkGameSession } from "../handler/user/pos/checkGameSession.js";

const router = express.Router();

// --- ROUTE REGISTER ---
router.post("/auth/register", register);

// --- ROUTES GAME LAINNYA ---
router.get("/get-list-pos", getListPos);
router.put("/update-user-pos", updateUserPos);
router.post("/abn/get-card", getCard);
router.post("/abn/get-ready-card", getReadyCard);
router.post("/abn/get-selected-card", getSelectedCard);
router.post("/abn/check-ready-card", checkReadyCard);
router.get("/check-acc", checkAcc);
router.get("/check-game-session", checkGameSession);
router.get("/exit-waiting-room", exitWaitingRoom);
router.get("/get-user-info", getUserInfo);
router.post("/sort/get-sort-items", getSortItems);
router.post("/sort/get-sort-answer", getSortAnswer);
router.post("/atomic/get-atomic-items", getAtomicItems);
router.post("/atomic/get-atomic-answer", getAtomicAnswer);
router.post("/question/get-question", getQuestion);
router.post("/question/get-answer", getAnswer);
router.post("/cpbattle/get-cp-tools", getCPTools);
router.post("/cpbattle/get-cp-question", getCPQuestion);
router.post("/cpbattle/get-cp-answer", getCPAnswer);
//checkstatuspembayaran
router.get("/check-status-pembayaran", checkStatusPendaftaran);

// BARIS DI BAWAH INI WAJIB ADA AGAR INDEX.JS TIDAK ERROR:
export default router;
