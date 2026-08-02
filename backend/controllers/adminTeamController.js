const crypto = require("crypto");
const pool = require("../config/database");

const generateAccessCode = () => crypto.randomBytes(3).toString("hex").toUpperCase();

const getTeamStatus = (lastSeenAt) => {
  if (!lastSeenAt) return "Pending";
  const diffMs = Date.now() - new Date(lastSeenAt).getTime();
  return diffMs <= 10 * 60 * 1000 ? "Active" : "Inactive";
};

//just format before sent
const formatTeam = (team) => ({
  id: team.team_id,
  name: team.team_name,
  code: team.access_code,
  competition_id: team.competition_id,
  status: getTeamStatus(team.last_seen_at),
  joined: team.created_at,
  is_disqualified: team.is_disqualified,
});

// GET /api/admin/teams?competition_id=1
const getTeams = async (req, res) => {
  try {
    const competitionId = req.query.competition_id
      ? Number(req.query.competition_id)
      : null;

    const result = competitionId
      ? await pool.query(
          `
            SELECT team_id, team_name, access_code, competition_id, theme, last_seen_at, created_at, is_disqualified
            FROM teams
            WHERE competition_id = $1
            ORDER BY created_at DESC
          `,
          [competitionId]
        )
      : await pool.query(
          `
            SELECT team_id, team_name, access_code, competition_id, theme, last_seen_at, created_at, is_disqualified
            FROM teams
            ORDER BY created_at DESC
          `
        );

    return res.status(200).json({ teams: result.rows.map(formatTeam) });
  } catch (error) {
    console.error("Get teams error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/admin/teams
const createTeam = async (req, res) => {
  try {
    const { team_name, access_code, competition_id } = req.body;

    if (!team_name || !team_name.trim()) {
      return res.status(400).json({ message: "team_name is required" });
    }
    if (!access_code || !access_code.trim()) {
      return res.status(400).json({ message: "access_code is required" });
    }

    let resolvedCompetitionId = competition_id ? Number(competition_id) : null;

    if (!resolvedCompetitionId) {
      const activeCompetition = await pool.query(
        `SELECT competition_id FROM competitions WHERE status = 'Active' ORDER BY competition_id LIMIT 1`
      );

      if (activeCompetition.rows.length === 0) {
        return res.status(400).json({
          message: "No active competition found. Please specify competition_id.",
        });
      }

      resolvedCompetitionId = activeCompetition.rows[0].competition_id;
    }

    // Avoid ambiguous participant logins caused by duplicate access codes.
    const duplicateCode = await pool.query(
      `SELECT team_id FROM teams WHERE competition_id = $1 AND access_code = $2`,
      [resolvedCompetitionId, access_code.trim()]
    );

    if (duplicateCode.rows.length > 0) {
      return res.status(409).json({ message: "Access code already in use for this competition" });
    }

    const result = await pool.query(
      `
        INSERT INTO teams (team_name, access_code, competition_id)
        VALUES ($1, $2, $3)
        RETURNING team_id, team_name, access_code, competition_id, theme, last_seen_at, created_at, is_disqualified
      `,
      [team_name.trim(), access_code.trim(), resolvedCompetitionId]
    );

    return res.status(201).json({ team: formatTeam(result.rows[0]) });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "A team with this name already exists in the competition" });
    }
    console.error("Create team error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/admin/teams/bulk
// Accepts { competition_id, teams: [{ team_name, access_code? }, ...] }.
// Access codes are optional per entry — omitted ones are auto-generated.
// Rows that collide with an existing team (duplicate name/code) are skipped
// rather than failing the whole batch, since that's the common case when
// re-running an import after fixing a typo in one row.
const createTeamsBulk = async (req, res) => {
  try {
    const { competition_id, teams } = req.body;

    if (!Array.isArray(teams) || teams.length === 0) {
      return res.status(400).json({ message: "teams must be a non-empty array" });
    }

    let resolvedCompetitionId = competition_id ? Number(competition_id) : null;

    if (!resolvedCompetitionId) {
      const activeCompetition = await pool.query(
        `SELECT competition_id FROM competitions WHERE status = 'Active' ORDER BY competition_id LIMIT 1`
      );

      if (activeCompetition.rows.length === 0) {
        return res.status(400).json({
          message: "No active competition found. Please specify competition_id.",
        });
      }

      resolvedCompetitionId = activeCompetition.rows[0].competition_id;
    }

    const created = [];
    const skipped = [];

    for (const entry of teams) {
      const teamName = entry?.team_name?.trim();

      if (!teamName) {
        skipped.push({ team_name: entry?.team_name ?? null, reason: "Missing team name" });
        continue;
      }

      const explicitCode = entry?.access_code?.trim();
      let accessCode = explicitCode || generateAccessCode();

      if (!explicitCode) {
        // Auto-generated codes get a few tries to dodge a collision; an
        // explicitly-supplied code is left as-is so we don't silently hand
        // out a different code than the one the admin typed.
        for (let attempt = 0; attempt < 5; attempt++) {
          const duplicateCode = await pool.query(
            `SELECT team_id FROM teams WHERE competition_id = $1 AND access_code = $2`,
            [resolvedCompetitionId, accessCode]
          );
          if (duplicateCode.rows.length === 0) break;
          accessCode = generateAccessCode();
        }
      }

      try {
        const result = await pool.query(
          `
            INSERT INTO teams (team_name, access_code, competition_id)
            VALUES ($1, $2, $3)
            RETURNING team_id, team_name, access_code, competition_id, theme, last_seen_at, created_at, is_disqualified
          `,
          [teamName, accessCode, resolvedCompetitionId]
        );
        created.push(formatTeam(result.rows[0]));
      } catch (error) {
        if (error.code === "23505") {
          skipped.push({
            team_name: teamName,
            reason: "A team with this name or access code already exists in the competition",
          });
        } else {
          throw error;
        }
      }
    }

    return res.status(201).json({
      message: `${created.length} team(s) created${skipped.length > 0 ? `, ${skipped.length} skipped` : ""}`,
      teams: created,
      skipped,
    });
  } catch (error) {
    console.error("Bulk create teams error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /api/admin/teams/:id
const updateTeam = async (req, res) => {
  try {
    const teamId = Number(req.params.id);
    const { team_name, access_code, is_disqualified } = req.body;

    if (!teamId) {
      return res.status(400).json({ message: "Invalid team id" });
    }

    const fields = [];
    const values = [];
    let index = 1;

    if (team_name !== undefined) {
      fields.push(`team_name = $${index++}`);
      values.push(team_name.trim());
    }
    if (access_code !== undefined) {
      fields.push(`access_code = $${index++}`);
      values.push(access_code.trim());
    }
    if (is_disqualified !== undefined) {
      fields.push(`is_disqualified = $${index++}`);
      values.push(Boolean(is_disqualified));
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    values.push(teamId);

    const result = await pool.query(
      `
        UPDATE teams
        SET ${fields.join(", ")}
        WHERE team_id = $${index}
        RETURNING team_id, team_name, access_code, competition_id, theme, last_seen_at, created_at, is_disqualified
      `,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Team not found" });
    }

    return res.status(200).json({ team: formatTeam(result.rows[0]) });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "A team with this name or code already exists" });
    }
    console.error("Update team error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /api/admin/teams/:id
const deleteTeam = async (req, res) => {
  try {
    const teamId = Number(req.params.id);

    if (!teamId) {
      return res.status(400).json({ message: "Invalid team id" });
    }

    const result = await pool.query(
      `DELETE FROM teams WHERE team_id = $1 RETURNING team_id`,
      [teamId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Team not found" });
    }

    return res.status(200).json({ message: "Team deleted successfully" });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(409).json({
        message: "Cannot delete: this team already has submissions linked to it",
      });
    }
    console.error("Delete team error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getTeams,
  createTeam,
  createTeamsBulk,
  updateTeam,
  deleteTeam,
};