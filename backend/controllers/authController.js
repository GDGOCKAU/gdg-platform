const pool = require("../config/database");
const { generateToken } = require("../utils/jwt");

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
            team_id,
            team_name,
            competition_id
        FROM teams
        WHERE LOWER(team_name) = LOWER($1)
            AND access_code = $2
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

    const team = result.rows[0];

    const token = generateToken({
        team_id: team.team_id,
        competition_id: team.competition_id,
        role: "Participant",
        });

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 3 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        team_id: team.team_id,
        team_name: team.team_name,
        competition_id: team.competition_id,
        role: "Participant",
      },
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