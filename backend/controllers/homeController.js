const pool = require("../config/database");
const { buildLeaderboard } = require("./leaderbord");

const getDashboard = async (req, res) => {
  try {
    const { team_id, competition_id } = req.user;

    const totalProblemsQuery = `
      SELECT COUNT(*)::int AS total
      FROM problems
      WHERE competition_id = $1
    `;

    // Rank/points/solved come from the same buildLeaderboard() the
    // scoreboard uses, so this widget matches it exactly -- same points ->
    // solved -> total-time tiebreak, and the same freeze cutoff.
    const [leaderboardResult, totalProblemsResult] = await Promise.all([
      buildLeaderboard(competition_id),
      pool.query(totalProblemsQuery, [competition_id]),
    ]);

    const standing = leaderboardResult?.leaderboard?.find(
      (team) => team.team_id === team_id
    ) || {
      rank: null,
      solved_questions: 0,
      points: 0,
    };

    res.status(200).json({
      rank: standing.rank,
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
