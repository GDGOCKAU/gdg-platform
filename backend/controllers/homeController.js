const pool = require("../config/database");

const getDashboard = async (req, res) => {
  try {
    const { team_id, competition_id } = req.user;

    const standingQuery = `
      SELECT team_id, points, solved_questions, rnk::int AS rnk
      FROM (
        SELECT
          team_id,
          points,
          solved_questions,
          RANK() OVER (
            ORDER BY points DESC, solved_questions DESC
          ) AS rnk
        FROM leaderboard
        WHERE competition_id = $1
      ) ranked
      WHERE team_id = $2
    `;

    const totalProblemsQuery = `
      SELECT COUNT(*)::int AS total
      FROM problems
      WHERE competition_id = $1
    `;

    const [standingResult, totalProblemsResult] = await Promise.all([
      pool.query(standingQuery, [competition_id, team_id]),
      pool.query(totalProblemsQuery, [competition_id]),
    ]);

    const standing = standingResult.rows[0] || {
      rnk: null,
      solved_questions: 0,
      points: 0,
    };

    res.status(200).json({
      rank: standing.rnk,
      solved: standing.solved_questions,
      total_problems: totalProblemsResult.rows[0].total,
      total_score: standing.points,
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    const { competition_id } = req.user;

    const query = `
      SELECT
        announcement_id,
        title,
        message,
        created_at
      FROM announcements
      WHERE competition_id = $1
        AND is_published = TRUE
      ORDER BY created_at DESC, announcement_id DESC
    `;

    const result = await pool.query(query, [competition_id]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get announcements error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getDashboard,
  getAnnouncements,
};
