const pool = require("../config/database");

const updateTheme = async (req, res) => {
  try {
    const { theme } = req.body;
    const teamId = req.user.team_id;

    if (!["Light", "Dark"].includes(theme)) {
      return res.status(400).json({
        message: "Theme must be Light or Dark",
      });
    }

    const result = await pool.query(
      `
        UPDATE teams
        SET theme = $1
        WHERE team_id = $2
        RETURNING team_id, team_name, theme
      `,
      [theme, teamId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    return res.status(200).json({
      message: "Theme updated successfully",
      team: result.rows[0],
    });
  } catch (error) {
    console.error("Update theme error:", error);

    return res.status(500).json({
      message: "Failed to update theme",
    });
  }
};

module.exports = {
  updateTheme,
};