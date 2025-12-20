import { getPos } from "../handler/penpos/getPos.js";
import { getListTeam } from "../handler/penpos/getListTeam.js";
import express from "express";

const router = express.Router();

router.get("/get-pos", getPos);

router.post("/get-list-team", getListTeam);

export default router;
