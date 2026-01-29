import express from "express";
import { verifyPayment } from "../handler/admin/verifyPayment.js";
import { getAllTeams } from "../handler/admin/getAllTeams.js";
import { getTeamDetail } from "../handler/admin/getTeamDetail.js";
import { getLeaderboard } from "../handler/user/getLeaderboard.js";
import { upload } from "../middleware/uploadImage.js";

const router = express.Router();

router.get("/get-all-teams", getAllTeams);
router.get("/get-team-detail/:teamId", getTeamDetail);
router.put("/verify-payment/:teamId", upload.any(), verifyPayment);
router.get("/leaderboard", getLeaderboard);

export default router;
