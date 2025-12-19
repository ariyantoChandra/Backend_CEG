import { login } from "../handler/auth/login.js";
import express from "express";

const router = express.Router();

router.post("/login", login);

export default router;

