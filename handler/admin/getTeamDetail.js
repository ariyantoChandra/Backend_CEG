import db from "../../config/database.js";

export const getTeamDetail = async (req, res) => {
  try {
    const { teamId } = req.params;

    // Validasi team id
    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: "team id wajib dikirim",
      });
    }

    // Mengambil data tim berdasarkan user_id
    const [teamRows] = await db.execute(
      "select * from tim where user_id = ?",
      [teamId]
    );

    if (teamRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "tim tidak ditemukan",
      });
    }

    // Mengambil data member berdasarkan user_id
    const [memberRows] = await db.execute(
      "select * from member where tim_user_id = ?",
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
    console.error("get team detail error:", error);
    return res.status(500).json({
      success: false,
      message: "terjadi kesalahan server",
    });
  }
};
