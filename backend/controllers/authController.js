const pool = require("../config/database");

const login = async (req, res) => {
  try {
    const { teamName, accessCode } = req.body;

    if (!teamName?.trim() || !accessCode?.trim()) {
      return res.status(400).json({
        message: "Team name and access code are required",
      });
    }

    const query = `
      SELECT
        t.team_id,
        t.team_name,
        u.role
      FROM users u
      INNER JOIN teams t
        ON u.team_id = t.team_id
      WHERE LOWER(t.team_name) = LOWER($1)
        AND u.access_code = $2
      LIMIT 1
    `;

    const result = await pool.query(query, [
      teamName.trim(),
      accessCode.trim(),
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid team name or access code",
      });
    }

    return res.status(200).json({
      message: "Login successful",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  login,
};