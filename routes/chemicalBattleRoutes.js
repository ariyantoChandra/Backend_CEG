import { getCard } from "../handler/chemicalPlantBattle/getCard.js";
import express from "express";

const router = express.Router();

router.get("/get-card", getCard);

export default router;
