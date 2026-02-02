import { getPos } from "../handler/penpos/getPos.js";
import { getListTeam } from "../handler/penpos/getListTeam.js";
import { getTeamPlaying } from "../handler/penpos/getTeamPlaying.js";
import { createGameSession } from "../handler/penpos/createGameSession.js";
import { matchResult } from "../handler/penpos/matchResult.js";
import { checkPenposSession } from "../handler/penpos/checkPenposSession.js";
import { getScore } from "../handler/penpos/getScore.js";
import express from "express";

const router = express.Router();

router.get("/get-pos", getPos);
router.get("/check-penpos-session", checkPenposSession);
router.get("/get-list-team", getListTeam);
router.get("/get-team-playing", getTeamPlaying);
router.post("/create-game-session", createGameSession);
router.post("/get-score", getScore);
router.post("/match-result", matchResult);

export default router;
