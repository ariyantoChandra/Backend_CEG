import { getListPos } from "../handler/penpos/getListPos.js";
import { updateUserPos } from "../handler/penpos/updateUserPos.js";
import express from "express";

const router = express.Router();

router.get("/get-list-pos", getListPos);

router.put("/update-user-pos", updateUserPos);

export default router;
