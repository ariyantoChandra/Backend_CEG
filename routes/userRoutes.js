import { getListPos } from "../handler/user/getListPos.js";
import { updateUserPos } from "../handler/user/updateUserPos.js";
import { getSelectedCard } from "../handler/user/getSelectedCard.js";
import { getReadyCard } from "../handler/user/getReadyCard.js";
import { getCard } from "../handler/user/getCard.js";
import { exitWaitingRoom } from "../handler/user/exitWaitingRoom.js";
import { checkAcc } from "../handler/user/checkAcc.js";
import express from "express";

const router = express.Router();

router.get("/get-list-pos", getListPos);

router.put("/update-user-pos", updateUserPos);

router.post("/abn/get-card", getCard);

router.post("/abn/get-ready-card", getReadyCard);    

router.post("/abn/get-selected-card", getSelectedCard);

router.post("/check-acc", checkAcc);

router.get("/exit-waiting-room", exitWaitingRoom);

export default router;
