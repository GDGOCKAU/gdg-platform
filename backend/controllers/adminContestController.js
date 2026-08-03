const pool = require("../config/database");
const archiver = require("archiver");
const { buildLeaderboard, getScoreboardFreezeState } = require("./leaderbord");

const ALLOWED_DIFFICULTIES = ["Easy", "Medium", "Hard", "Mixed"];
const ALLOWED_STATUSES = ["Upcoming", "Active", "Frozen", "Finished", "Cancelled"];
const NON_FINISHED_STATUSES = ["Upcoming", "Active", "Frozen"];

// Only "Active"/"Frozen" competitions have a meaningful freeze state; for
// anything else (Upcoming/Finished/Cancelled) ended_at math doesn't apply.
const withFreezeState = (competition) => {
  if (competition.status !== "Active" && competition.status !== "Frozen") {
    return { ...competition, is_frozen: competition.status === "Frozen", is_auto_frozen: false };
  }

  const { isFrozen, isAutoFrozen } = getScoreboardFreezeState(competition);
  return { ...competition, is_frozen: isFrozen, is_auto_frozen: isAutoFrozen };
};

const createCompetition = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      competition_name,
      description,
      difficulty,
      max_teams,
      started_at,
      duration_minutes,
    } = req.body;

    const allowedDifficulties = [
      "Easy",
      "Medium",
      "Hard",
      "Mixed",
    ];

    const competitionName =
      typeof competition_name === "string"
        ? competition_name.trim()
        : "";

    const competitionDescription =
      typeof description === "string"
        ? description.trim()
        : null;

    const maxTeams = Number(max_teams);
    const durationMinutes = Number(duration_minutes);

    if (!competitionName) {
      return res.status(400).json({
        message: "Competition name is required",
      });
    }

    if (competitionName.length > 100) {
      return res.status(400).json({
        message:
          "Competition name must not exceed 100 characters",
      });
    }

    if (!allowedDifficulties.includes(difficulty)) {
      return res.status(400).json({
        message:
          "Difficulty must be Easy, Medium, Hard, or Mixed",
      });
    }

    if (
      !Number.isInteger(maxTeams) ||
      maxTeams <= 0
    ) {
      return res.status(400).json({
        message:
          "Maximum teams must be a positive integer",
      });
    }

    if (!started_at) {
      return res.status(400).json({
        message: "Start date and time are required",
      });
    }

    const parsedStartDate = new Date(started_at);

    if (Number.isNaN(parsedStartDate.getTime())) {
      return res.status(400).json({
        message: "Invalid start date and time",
      });
    }

    if (
      !Number.isInteger(durationMinutes) ||
      durationMinutes <= 0
    ) {
      return res.status(400).json({
        message:
          "Duration must be a positive number of minutes",
      });
    }

    await client.query("BEGIN");

    const existingCompetitionResult =
      await client.query(
        `
          SELECT
            competition_id,
            competition_name,
            status
          FROM competitions
          WHERE status IN (
            'Upcoming',
            'Active',
            'Frozen'
          )
          ORDER BY started_at ASC
          LIMIT 1
          FOR UPDATE
        `
      );

    if (existingCompetitionResult.rows.length > 0) {
      await client.query("ROLLBACK");

      const existingCompetition =
        existingCompetitionResult.rows[0];

      return res.status(409).json({
        message:
          "Another unfinished competition already exists",
        competition: existingCompetition,
      });
    }

    const duplicateNameResult = await client.query(
      `
        SELECT competition_id
        FROM competitions
        WHERE LOWER(competition_name) = LOWER($1)
        LIMIT 1
      `,
      [competitionName]
    );

    if (duplicateNameResult.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        message:
          "A competition with this name already exists",
      });
    }

    const result = await client.query(
      `
        INSERT INTO competitions
        (
          competition_name,
          description,
          difficulty,
          status,
          max_teams,
          started_at,
          ended_at
        )
        VALUES
        (
          $1,
          $2,
          $3,
          'Upcoming',
          $4,
          $5::TIMESTAMP,
          $5::TIMESTAMP
            + ($6 * INTERVAL '1 minute')
        )
        RETURNING
          competition_id,
          competition_name,
          description,
          difficulty,
          status,
          max_teams,
          started_at,
          ended_at
      `,
      [
        competitionName,
        competitionDescription || null,
        difficulty,
        maxTeams,
        started_at,
        durationMinutes,
      ]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Competition created successfully",
      competition: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Create admin competition error:",
      error
    );

    if (error.code === "23505") {
      return res.status(409).json({
        message:
          "A competition with this name already exists",
      });
    }

    if (error.code === "23514") {
      return res.status(400).json({
        message:
          "Competition data violates database rules",
      });
    }

    if (error.code === "22007") {
      return res.status(400).json({
        message: "Invalid start date and time",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  } finally {
    client.release();
  }
};

// GET /api/admin/contests/:id
const getCompetitionById = async (req, res) => {
  try {
    const competitionId = Number(req.params.id);

    if (!competitionId) {
      return res.status(400).json({ message: "Invalid competition id" });
    }

    const result = await pool.query(
      `SELECT * FROM competitions WHERE competition_id = $1`,
      [competitionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Competition not found" });
    }

    return res.status(200).json({ competition: withFreezeState(result.rows[0]) });
  } catch (error) {
    console.error("Get competition by id error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /api/admin/contests/:id
const updateCompetition = async (req, res) => {
  const client = await pool.connect();

  try {
    const competitionId = Number(req.params.id);

    if (!competitionId) {
      client.release();
      return res.status(400).json({ message: "Invalid competition id" });
    }

    const {
      competition_name,
      description,
      difficulty,
      max_teams,
      started_at,
      ended_at,
      duration_minutes,
      status,
    } = req.body;

    await client.query("BEGIN");

    const existingResult = await client.query(
      `SELECT * FROM competitions WHERE competition_id = $1 FOR UPDATE`,
      [competitionId]
    );

    if (existingResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Competition not found" });
    }

    const existing = existingResult.rows[0];

    const fields = [];
    const values = [];
    let index = 1;

    if (competition_name !== undefined) {
      const trimmedName = String(competition_name).trim();

      if (!trimmedName) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Competition name is required" });
      }

      if (trimmedName.length > 100) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Competition name must not exceed 100 characters" });
      }

      const duplicateNameResult = await client.query(
        `SELECT competition_id FROM competitions WHERE LOWER(competition_name) = LOWER($1) AND competition_id != $2`,
        [trimmedName, competitionId]
      );

      if (duplicateNameResult.rows.length > 0) {
        await client.query("ROLLBACK");
        return res.status(409).json({ message: "A competition with this name already exists" });
      }

      fields.push(`competition_name = $${index++}`);
      values.push(trimmedName);
    }

    if (description !== undefined) {
      fields.push(`description = $${index++}`);
      values.push(typeof description === "string" ? description.trim() || null : null);
    }

    if (difficulty !== undefined) {
      if (!ALLOWED_DIFFICULTIES.includes(difficulty)) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Difficulty must be Easy, Medium, Hard, or Mixed" });
      }
      fields.push(`difficulty = $${index++}`);
      values.push(difficulty);
    }

    if (max_teams !== undefined) {
      const maxTeams = Number(max_teams);

      if (!Number.isInteger(maxTeams) || maxTeams <= 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Maximum teams must be a positive integer" });
      }

      const teamCountResult = await client.query(
        `SELECT COUNT(*)::int AS team_count FROM teams WHERE competition_id = $1`,
        [competitionId]
      );

      if (maxTeams < teamCountResult.rows[0].team_count) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: `Maximum teams cannot be lower than the ${teamCountResult.rows[0].team_count} teams already registered`,
        });
      }

      fields.push(`max_teams = $${index++}`);
      values.push(maxTeams);
    }

    if (status !== undefined) {
      if (!ALLOWED_STATUSES.includes(status)) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Invalid competition status" });
      }

      // Only block this when the competition is newly claiming an
      // "unfinished" slot (e.g. moving from Finished/Cancelled back into
      // Upcoming/Active/Frozen). Toggling between two statuses that were
      // BOTH already unfinished -- Active <-> Frozen on this same contest,
      // most commonly -- doesn't change how many competitions are
      // unfinished, so it shouldn't trip this guard.
      const isClaimingUnfinishedSlot =
        NON_FINISHED_STATUSES.includes(status) && !NON_FINISHED_STATUSES.includes(existing.status);

      if (isClaimingUnfinishedSlot) {
        const conflictingResult = await client.query(
          `
            SELECT competition_id FROM competitions
            WHERE status IN ('Upcoming', 'Active', 'Frozen')
              AND competition_id != $1
            LIMIT 1
          `,
          [competitionId]
        );

        if (conflictingResult.rows.length > 0) {
          await client.query("ROLLBACK");
          return res.status(409).json({ message: "Another unfinished competition already exists" });
        }
      }

      fields.push(`status = $${index++}`);
      values.push(status);
    }

    // Dates: resolve the effective started_at/ended_at so the ended_at > started_at
    // check below always reflects the row's final state, not just the changed fields.
    let effectiveStartedAt = existing.started_at;
    let effectiveEndedAt = existing.ended_at;

    if (started_at !== undefined) {
      const parsedStart = new Date(started_at);
      if (Number.isNaN(parsedStart.getTime())) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Invalid start date and time" });
      }
      effectiveStartedAt = parsedStart;
      fields.push(`started_at = $${index++}`);
      values.push(started_at);
    }

    if (duration_minutes !== undefined) {
      const durationMinutes = Number(duration_minutes);

      if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Duration must be a positive number of minutes" });
      }

      effectiveEndedAt = new Date(new Date(effectiveStartedAt).getTime() + durationMinutes * 60000);
      fields.push(`ended_at = $${index++}`);
      values.push(effectiveEndedAt.toISOString());
    } else if (ended_at !== undefined) {
      const parsedEnd = new Date(ended_at);
      if (Number.isNaN(parsedEnd.getTime())) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Invalid end date and time" });
      }
      effectiveEndedAt = parsedEnd;
      fields.push(`ended_at = $${index++}`);
      values.push(ended_at);
    }

    if (new Date(effectiveEndedAt) <= new Date(effectiveStartedAt)) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "End date must be after the start date" });
    }

    if (fields.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "No fields to update" });
    }

    values.push(competitionId);

    const result = await client.query(
      `
        UPDATE competitions
        SET ${fields.join(", ")}
        WHERE competition_id = $${index}
        RETURNING *
      `,
      values
    );

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Competition updated successfully",
      competition: withFreezeState(result.rows[0]),
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Update competition error:", error);

    if (error.code === "23505") {
      return res.status(409).json({ message: "A competition with this name already exists" });
    }

    if (error.code === "23514") {
      return res.status(400).json({ message: "Competition data violates database rules" });
    }

    return res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

// DELETE /api/admin/contests/:id
// Only succeeds for a competition with no real activity yet — teams/problems
// cascade-delete, but a team or problem that already has submissions is
// protected by ON DELETE RESTRICT further down the chain, so Postgres itself
// refuses the delete (surfaced below as 23503) once a contest actually ran.
const deleteCompetition = async (req, res) => {
  try {
    const competitionId = Number(req.params.id);

    if (!competitionId) {
      return res.status(400).json({ message: "Invalid competition id" });
    }

    const result = await pool.query(
      `DELETE FROM competitions WHERE competition_id = $1 RETURNING competition_id`,
      [competitionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Competition not found" });
    }

    return res.status(200).json({ message: "Competition deleted successfully" });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(409).json({
        message: "Cannot delete: this competition already has teams or problems with submissions linked to it",
      });
    }

    console.error("Delete competition error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/admin/contests/history
// Finished competitions, each with how many teams took part and who won.
const getCompetitionHistory = async (req, res) => {
  try {
    const competitionsResult = await pool.query(
      `
        SELECT
          c.competition_id,
          c.competition_name,
          c.description,
          c.difficulty,
          c.status,
          c.max_teams,
          c.started_at,
          c.ended_at,
          COUNT(t.team_id)::int AS team_count
        FROM competitions c
        LEFT JOIN teams t ON t.competition_id = c.competition_id
        WHERE c.status = 'Finished'
        GROUP BY c.competition_id
        ORDER BY c.ended_at DESC
      `
    );

    const competitionIds = competitionsResult.rows.map((c) => c.competition_id);

    const winnersResult = competitionIds.length === 0
      ? { rows: [] }
      : await pool.query(
          `
            SELECT DISTINCT ON (l.competition_id)
              l.competition_id,
              t.team_id,
              t.team_name,
              l.points,
              l.solved_questions
            FROM leaderboard l
            INNER JOIN teams t ON t.team_id = l.team_id
            WHERE l.competition_id = ANY($1::int[])
            ORDER BY l.competition_id, l.points DESC, l.solved_questions DESC
          `,
          [competitionIds]
        );

    const winnerByCompetition = new Map(
      winnersResult.rows.map((row) => [row.competition_id, row])
    );

    const competitions = competitionsResult.rows.map((competition) => ({
      ...competition,
      winner: winnerByCompetition.get(competition.competition_id) || null,
    }));

    return res.status(200).json({ competitions });
  } catch (error) {
    console.error("Get competition history error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/admin/contests/:id/leaderboard
const getCompetitionLeaderboard = async (req, res) => {
  try {
    const competitionId = Number(req.params.id);

    if (!competitionId) {
      return res.status(400).json({ message: "Invalid competition id" });
    }

    const result = await buildLeaderboard(competitionId);

    if (result === null) {
      return res.status(404).json({ message: "Competition not found" });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get competition leaderboard error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// -- Submission code archives -------------------------------------------

const EXTENSION_BY_LANGUAGE = [
  [/python/i, "py"],
  [/c\+\+|cpp/i, "cpp"],
  [/c#|csharp/i, "cs"],
  [/typescript/i, "ts"],
  [/javascript|node/i, "js"],
  [/\bjava\b/i, "java"],
  [/kotlin/i, "kt"],
  [/swift/i, "swift"],
  [/rust/i, "rs"],
  [/\bgo\b|golang/i, "go"],
  [/ruby/i, "rb"],
  [/php/i, "php"],
  [/^c$|\bc\b/i, "c"],
];

const extensionForLanguage = (languageName) => {
  const name = languageName || "";
  const match = EXTENSION_BY_LANGUAGE.find(([pattern]) => pattern.test(name));
  return match ? match[1] : "txt";
};

const sanitizeFileSegment = (value) => {
  const cleaned = String(value ?? "").trim().replace(/[^a-zA-Z0-9_\-]+/g, "_").slice(0, 60);
  return cleaned || "untitled";
};

// One row per (team, problem) holding that team's best submission for the
// problem — Accepted wins over other statuses, most recent wins ties.
const fetchBestSubmissionsForCompetition = async (competitionId, teamId = null) => {
  const params = teamId ? [competitionId, teamId] : [competitionId];

  const result = await pool.query(
    `
      SELECT DISTINCT ON (t.team_id, p.problem_id)
        t.team_id,
        t.team_name,
        p.problem_id,
        p.problem_code,
        p.problem_name,
        s.language_name,
        s.source_code,
        s.status
      FROM teams t
      CROSS JOIN problems p
      LEFT JOIN submissions s
        ON s.problem_id = p.problem_id AND s.team_id = t.team_id
      WHERE t.competition_id = $1
        AND p.competition_id = $1
        ${teamId ? "AND t.team_id = $2" : ""}
      ORDER BY
        t.team_id,
        p.problem_id,
        (s.status = 'Accepted') DESC,
        s.submitted_at DESC NULLS LAST
    `,
    params
  );

  return result.rows.filter((row) => row.source_code !== null);
};

// GET /api/admin/contests/:id/teams/:teamId/submissions.zip
const downloadTeamSubmissionsZip = async (req, res) => {
  try {
    const competitionId = Number(req.params.id);
    const teamId = Number(req.params.teamId);

    if (!competitionId || !teamId) {
      return res.status(400).json({ message: "Invalid competition or team id" });
    }

    const rows = await fetchBestSubmissionsForCompetition(competitionId, teamId);

    if (rows.length === 0) {
      const teamResult = await pool.query(
        `SELECT team_id FROM teams WHERE team_id = $1 AND competition_id = $2`,
        [teamId, competitionId]
      );

      if (teamResult.rows.length === 0) {
        return res.status(404).json({ message: "Team not found in this competition" });
      }
    }

    const teamName = rows[0]?.team_name || "team";
    const zipName = `${sanitizeFileSegment(teamName)}.zip`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${zipName}"`);

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", (error) => {
      console.error("Team submissions zip error:", error);
      res.destroy(error);
    });
    archive.pipe(res);

    for (const row of rows) {
      const fileName = `${row.problem_code}_${sanitizeFileSegment(row.problem_name)}.${extensionForLanguage(row.language_name)}`;
      archive.append(row.source_code, { name: fileName });
    }

    await archive.finalize();
  } catch (error) {
    console.error("Download team submissions zip error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error" });
    } else {
      res.destroy();
    }
  }
};

// GET /api/admin/contests/:id/submissions.zip
const downloadAllSubmissionsZip = async (req, res) => {
  try {
    const competitionId = Number(req.params.id);

    if (!competitionId) {
      return res.status(400).json({ message: "Invalid competition id" });
    }

    const competitionResult = await pool.query(
      `SELECT competition_name FROM competitions WHERE competition_id = $1`,
      [competitionId]
    );

    if (competitionResult.rows.length === 0) {
      return res.status(404).json({ message: "Competition not found" });
    }

    const rows = await fetchBestSubmissionsForCompetition(competitionId);

    const zipName = `${sanitizeFileSegment(competitionResult.rows[0].competition_name)}_submissions.zip`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${zipName}"`);

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", (error) => {
      console.error("All submissions zip error:", error);
      res.destroy(error);
    });
    archive.pipe(res);

    for (const row of rows) {
      const fileName = `${sanitizeFileSegment(row.team_name)}/${row.problem_code}_${sanitizeFileSegment(row.problem_name)}.${extensionForLanguage(row.language_name)}`;
      archive.append(row.source_code, { name: fileName });
    }

    await archive.finalize();
  } catch (error) {
    console.error("Download all submissions zip error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error" });
    } else {
      res.destroy();
    }
  }
};

module.exports = {
  createCompetition,
  getCompetitionById,
  updateCompetition,
  deleteCompetition,
  getCompetitionHistory,
  getCompetitionLeaderboard,
  downloadTeamSubmissionsZip,
  downloadAllSubmissionsZip,
};