import { getPos } from "../handler/penpos/getPos.js";
import { getListTeam } from "../handler/penpos/getListTeam.js";
import { createGameSession } from "../handler/penpos/createGameSession.js";
import { matchResult } from "../handler/penpos/matchResult.js";
import express from "express";

const router = express.Router();

router.get("/get-pos", getPos);
router.get("/get-list-team", getListTeam);
router.post("/create-game-session", createGameSession);
router.post("/match-result", matchResult);

export default router;
