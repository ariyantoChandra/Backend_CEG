import db from "../../config/database.js";

export const getTeamDetail = async (req, res) => {
  try {
    const { teamId } = req.params;

    // 1. Ambil Data Tim
    const [teamRows] = await db.execute("SELECT * FROM tim WHERE user_id = ?", [
      teamId,
    ]);

    if (teamRows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Tim tidak ditemukan" });
    }

    // 2. Ambil Data Member
    const [memberRows] = await db.execute(
      "SELECT * FROM member WHERE tim_user_id = ?",
      [teamId]
    );

    return res.status(200).json({
      success: true,
      data: {
        ...teamRows[0],
        members: memberRows,
      },
    });
  } catch (error) {
    console.error("GET TEAM DETAIL ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
