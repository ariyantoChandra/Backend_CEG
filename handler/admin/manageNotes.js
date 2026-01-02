import db from "../../config/database.js";

export const manageNotes = async (req, res) => {
  try {
    const { timId } = req.query; // ini sebenarnya user_id
    const { notes } = req.body;

    await db.execute(
      "UPDATE tim SET notes = ? WHERE user_id = ?",
      [notes ?? "", timId]
    );

    return res.status(200).json({
      success: true,
      message: `Catatan tim dengan user_id ${timId} berhasil diperbarui`,
    });
  } catch (error) {
    console.error("ERROR MANAGE NOTES:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
};