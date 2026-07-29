const pool = require("../config/database");

const getAdminOverview = async (req, res) => {
  try {
    const competitionId = Number(req.query.competition_id);

    if (!competitionId) {
      return res.status(400).json({
        message: "competition_id is required",
      });
    }

    const competitionResult = await pool.query(
      `
        SELECT
          competition_id,
          competition_name,
          status,
          started_at,
          ended_at
        FROM competitions
        WHERE competition_id = $1
      `,
      [competitionId]
    );

    if (competitionResult.rows.length === 0) {
      return res.status(404).json({
        message: "Competition not found",
      });
    }

    const registeredTeamsResult = await pool.query(
      `
        SELECT COUNT(*)::INTEGER AS registered_teams
        FROM teams
        WHERE competition_id = $1
      `,
      [competitionId]
    );

    const activeTeamsResult = await pool.query(
      `
        SELECT COUNT(*)::INTEGER AS active_teams
        FROM teams
        WHERE competition_id = $1
          AND last_seen_at >= CURRENT_TIMESTAMP - INTERVAL '10 minutes'
      `,
      [competitionId]
    );

    const submissionsStatsResult = await pool.query(
      `
        SELECT
          COUNT(*)::INTEGER AS total_submissions,

          COUNT(*) FILTER (
            WHERE status = 'Accepted'
          )::INTEGER AS accepted_submissions,

          COUNT(*) FILTER (
            WHERE submitted_at >= CURRENT_TIMESTAMP - INTERVAL '5 minutes'
          )::INTEGER AS submissions_last_five_minutes

        FROM submissions s
        INNER JOIN teams t
          ON t.team_id = s.team_id
        WHERE t.competition_id = $1
      `,
      [competitionId]
    );

    const competition = competitionResult.rows[0];
    const registeredTeams = registeredTeamsResult.rows[0].registered_teams;

    const activeTeams = activeTeamsResult.rows[0].active_teams;

    const totalSubmissions = submissionsStatsResult.rows[0].total_submissions;

    const acceptedSubmissions = submissionsStatsResult.rows[0].accepted_submissions;

    const submissionsLastFiveMinutes = submissionsStatsResult.rows[0].submissions_last_five_minutes;

    const successRate =
      totalSubmissions > 0 ? Number(((acceptedSubmissions / totalSubmissions) * 100).toFixed(1)) : 0;

    return res.status(200).json({
      competition,
      stats: {
        active_teams: activeTeams,
        registered_teams: registeredTeams,
        total_submissions: totalSubmissions,
        accepted_submissions: acceptedSubmissions,
        success_rate: successRate,
        submissions_last_five_minutes:
          submissionsLastFiveMinutes,
      },
    });
  } catch (error) {
    console.error("Get admin overview error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  getAdminOverview,
};