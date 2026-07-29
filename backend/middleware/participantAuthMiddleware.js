const { verifyToken } = require("../utils/jwt");

const participantAuthMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.participant_token;

    if (!token) {
      return res.status(401).json({
        message: "Participant authentication required",
      });
    }

    const decoded = verifyToken(token);

    if (
      decoded.role !== "Participant" ||
      !decoded.team_id
    ) {
      return res.status(403).json({
        message: "Participant access only",
      });
    }

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired participant token",
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    if (!req.user?.team_id) {
      return res.status(401).json({
        message: "Participant authentication required",
      });
    }

    const query = `
      SELECT
        t.team_id,
        t.team_name,
        t.competition_id,
        t.theme,
        c.started_at,
        c.ended_at
      FROM teams t
      JOIN competitions c
        ON t.competition_id = c.competition_id
      WHERE t.team_id = $1
    `;

    const result = await pool.query(query, [
      req.user.team_id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    const team = result.rows[0];

    return res.status(200).json({
      user: {
        team_id: team.team_id,
        team_name: team.team_name,
        competition_id: team.competition_id,
        theme: team.theme,
        role: req.user.role,
      },
      competition: {
        started_at: team.started_at,
        ended_at: team.ended_at,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
module.exports = participantAuthMiddleware, getCurrentUser;