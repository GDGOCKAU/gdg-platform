const pool = require("../config/database");
const { getScoreboardFreezeState } = require("./leaderbord");

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

    const recentSubmissionsResult = await pool.query(
    `
      SELECT
        s.submission_id,
        s.submitted_at,
        s.status,
        s.language_name,

        t.team_id,
        t.team_name,

        p.problem_id,
        p.problem_code,
        p.problem_name

      FROM submissions s

      INNER JOIN teams t
        ON t.team_id = s.team_id

      INNER JOIN problems p
        ON p.problem_id = s.problem_id

      WHERE t.competition_id = $1
        AND p.competition_id = $1

      ORDER BY s.submitted_at DESC

      LIMIT 50
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

    const recentSubmissions = recentSubmissionsResult.rows;

    // Real trend lines for the stat-card sparklines: bucket the contest's
    // elapsed time (start -> now, capped at the contest end) into 7 equal
    // windows and tally submissions per window. Before the contest starts,
    // or with no elapsed time yet, there's nothing to bucket.
    const TREND_BUCKETS = 7;
    const trends = {
      submissions: new Array(TREND_BUCKETS).fill(0),
      active_teams: new Array(TREND_BUCKETS).fill(0),
      success_rate: new Array(TREND_BUCKETS).fill(0),
    };

    const contestStart = new Date(competition.started_at).getTime();
    const contestEnd = Math.min(Date.now(), new Date(competition.ended_at).getTime());

    if (contestEnd > contestStart) {
      const trendRowsResult = await pool.query(
        `
          SELECT s.submitted_at, s.status, s.team_id
          FROM submissions s
          INNER JOIN teams t
            ON t.team_id = s.team_id
          WHERE t.competition_id = $1
            AND s.submitted_at >= $2
            AND s.submitted_at <= $3
        `,
        [competitionId, new Date(contestStart), new Date(contestEnd)]
      );

      const bucketMs = (contestEnd - contestStart) / TREND_BUCKETS;
      const buckets = Array.from({ length: TREND_BUCKETS }, () => ({
        total: 0,
        accepted: 0,
        teams: new Set(),
      }));

      for (const row of trendRowsResult.rows) {
        const submittedAtMs = new Date(row.submitted_at).getTime();
        const index = Math.min(
          Math.max(Math.floor((submittedAtMs - contestStart) / bucketMs), 0),
          TREND_BUCKETS - 1
        );

        buckets[index].total += 1;
        if (row.status === "Accepted") buckets[index].accepted += 1;
        buckets[index].teams.add(row.team_id);
      }

      buckets.forEach((bucket, index) => {
        trends.submissions[index] = bucket.total;
        trends.active_teams[index] = bucket.teams.size;
        trends.success_rate[index] =
          bucket.total > 0 ? Number(((bucket.accepted / bucket.total) * 100).toFixed(1)) : 0;
      });
    }

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
      trends,
      recent_submissions: recentSubmissions,
    });
  } catch (error) {
    console.error("Get admin overview error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const ERROR_STATUSES = [
  "Wrong Answer",
  "Time Limit Exceeded",
  "Compilation Error",
  "Runtime Error",
  "Internal Error",
];

// GET /api/admin/overview/submissions-feed
// Searchable/paginated submissions list — separate from the capped 50-row
// "recent submissions" snapshot on the main overview, so the "View all"
// modal can actually reach submission #51+ and look up a specific team.
const getSubmissionsFeed = async (req, res) => {
  try {
    const competitionId = Number(req.query.competition_id);

    if (!competitionId) {
      return res.status(400).json({ message: "competition_id is required" });
    }

    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const statusFilter = req.query.status_filter === "accepted" || req.query.status_filter === "errors"
      ? req.query.status_filter
      : "all";

    const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    const conditions = ["t.competition_id = $1", "p.competition_id = $1"];
    const values = [competitionId];

    if (search) {
      values.push(`%${search}%`);
      conditions.push(`t.team_name ILIKE $${values.length}`);
    }

    if (statusFilter === "accepted") {
      conditions.push(`s.status = 'Accepted'`);
    } else if (statusFilter === "errors") {
      values.push(ERROR_STATUSES);
      conditions.push(`s.status = ANY($${values.length}::text[])`);
    }

    const whereClause = conditions.join(" AND ");

    const countResult = await pool.query(
      `
        SELECT COUNT(*)::int AS total
        FROM submissions s
        INNER JOIN teams t ON t.team_id = s.team_id
        INNER JOIN problems p ON p.problem_id = s.problem_id
        WHERE ${whereClause}
      `,
      values
    );

    const rowsResult = await pool.query(
      `
        SELECT
          s.submission_id,
          s.submitted_at,
          s.status,
          s.language_name,
          t.team_id,
          t.team_name,
          p.problem_id,
          p.problem_code,
          p.problem_name
        FROM submissions s
        INNER JOIN teams t ON t.team_id = s.team_id
        INNER JOIN problems p ON p.problem_id = s.problem_id
        WHERE ${whereClause}
        ORDER BY s.submitted_at DESC
        LIMIT $${values.length + 1} OFFSET $${values.length + 2}
      `,
      [...values, limit, offset]
    );

    return res.status(200).json({
      submissions: rowsResult.rows,
      total: countResult.rows[0].total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Get submissions feed error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { competition_id, title, message } = req.body;

    const competitionId = Number(competition_id);

    if (!competitionId) {
      return res.status(400).json({
        message: "Competition ID is required",
      });
    }

    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({
        message: "Title and message are required",
      });
    }

    if (title.trim().length > 100) {
      return res.status(400).json({
        message: "Title must not exceed 100 characters",
      });
    }

    const competitionResult = await pool.query(
      `
        SELECT competition_id
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

    const result = await pool.query(
      `
        INSERT INTO announcements
        (
          competition_id,
          created_by,
          title,
          message,
          is_published
        )
        VALUES ($1, $2, $3, $4, TRUE)

        RETURNING
          announcement_id,
          competition_id,
          created_by,
          title,
          message,
          is_published,
          created_at
      `,
      [
        competitionId,
        req.user.user_id,
        title.trim(),
        message.trim(),
      ]
    );

    return res.status(201).json({
      message: "Announcement published successfully",
      announcement: result.rows[0],
    });
  } catch (error) {
    console.error("Create announcement error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    const competitionId = Number(req.query.competition_id);

    if (!competitionId) {
      return res.status(400).json({
        message: "competition_id is required",
      });
    }

    const result = await pool.query(
      `
        SELECT
          a.announcement_id,
          a.competition_id,
          a.title,
          a.message,
          a.is_published,
          a.created_at,
          u.user_name AS created_by_name
        FROM announcements a
        INNER JOIN users u
          ON u.user_id = a.created_by
        WHERE a.competition_id = $1
        ORDER BY a.created_at DESC
        LIMIT 50
      `,
      [competitionId]
    );

    return res.status(200).json({
      announcements: result.rows,
    });
  } catch (error) {
    console.error("Get announcements error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// PATCH /api/admin/overview/announcements/:id
// Lets an admin fix a typo or unpublish/republish an announcement after the
// fact — the create endpoint is otherwise fire-and-forget.
const updateAnnouncement = async (req, res) => {
  try {
    const announcementId = Number(req.params.id);

    if (!announcementId) {
      return res.status(400).json({ message: "Invalid announcement id" });
    }

    const { title, message, is_published } = req.body;

    if (title !== undefined && title.trim().length > 100) {
      return res.status(400).json({
        message: "Title must not exceed 100 characters",
      });
    }

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ message: "Title cannot be empty" });
    }

    if (message !== undefined && !message.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const result = await pool.query(
      `
        UPDATE announcements
        SET
          title = COALESCE($1, title),
          message = COALESCE($2, message),
          is_published = COALESCE($3, is_published),
          updated_at = CURRENT_TIMESTAMP
        WHERE announcement_id = $4
        RETURNING
          announcement_id,
          competition_id,
          created_by,
          title,
          message,
          is_published,
          created_at,
          updated_at
      `,
      [
        title !== undefined ? title.trim() : null,
        message !== undefined ? message.trim() : null,
        is_published !== undefined ? Boolean(is_published) : null,
        announcementId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    return res.status(200).json({
      message: "Announcement updated successfully",
      announcement: result.rows[0],
    });
  } catch (error) {
    console.error("Update announcement error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /api/admin/overview/announcements/:id
const deleteAnnouncement = async (req, res) => {
  try {
    const announcementId = Number(req.params.id);

    if (!announcementId) {
      return res.status(400).json({ message: "Invalid announcement id" });
    }

    const result = await pool.query(
      `DELETE FROM announcements WHERE announcement_id = $1 RETURNING announcement_id`,
      [announcementId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    return res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("Delete announcement error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAvailableCompetitions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        competition_id,
        competition_name,
        status,
        started_at,
        ended_at
      FROM competitions
      ORDER BY started_at DESC
    `);

    const competitions = result.rows.map((competition) => {
      if (competition.status !== "Active" && competition.status !== "Frozen") {
        return { ...competition, is_frozen: competition.status === "Frozen", is_auto_frozen: false };
      }

      const { isFrozen, isAutoFrozen } = getScoreboardFreezeState(competition);
      return { ...competition, is_frozen: isFrozen, is_auto_frozen: isAutoFrozen };
    });

    return res.status(200).json({
      competitions,
    });
  } catch (error) {
    console.error("Get competitions error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  getAdminOverview, getSubmissionsFeed, createAnnouncement, getAnnouncements, updateAnnouncement, deleteAnnouncement, getAvailableCompetitions,
};