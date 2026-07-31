const pool = require("../config/database");

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

module.exports = {
  createCompetition,
};