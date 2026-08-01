const pool = require("../config/database");

// GET /api/admin/competitions
const getCompetitions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT competition_id, competition_name, status FROM competitions ORDER BY competition_id`
    );
    return res.status(200).json({ competitions: result.rows });
  } catch (error) {
    console.error("Get competitions error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getCompetitions };