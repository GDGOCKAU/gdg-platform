const pool = require("../config/database");

const secondsToMs = (value) => {
    //convert to int
  const seconds = parseFloat(value);
  if (!seconds || Number.isNaN(seconds)) return 1000; // matches schema default
  return Math.round(seconds * 1000);
};

// Posts a system announcement so contestants notice new/removed problems
// without having to keep refreshing the problem list. Uses the same
// `client` transaction as the problem write it's paired with, so the
// announcement never appears without the change actually having committed.
const postProblemAnnouncement = async (client, { competitionId, adminUserId, title, message }) => {
  await client.query(
    `
      INSERT INTO announcements (competition_id, created_by, title, message, is_published)
      VALUES ($1, $2, $3, $4, TRUE)
    `,
    [competitionId, adminUserId, title, message]
  );
};

// GET /api/admin/problems?competition_id=1
const getProblems = async (req, res) => {
  try {
    const competitionId = req.query.competition_id
      ? Number(req.query.competition_id)
      : null;

    const result = competitionId
      ? await pool.query(
          `SELECT * FROM problems WHERE competition_id = $1 ORDER BY problem_code`,
          [competitionId]
        )
      : await pool.query(`SELECT * FROM problems ORDER BY competition_id, problem_code`);

    return res.status(200).json({ problems: result.rows });
  } catch (error) {
    console.error("Get problems error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/admin/problems/:id  
const getProblemById = async (req, res) => {
  try {
    const problemId = Number(req.params.id);
    if (!problemId) {
      return res.status(400).json({ message: "Invalid problem id" });
    }

    const problemResult = await pool.query(
      `SELECT * FROM problems WHERE problem_id = $1`,
      [problemId]
    );

    if (problemResult.rows.length === 0) {
      return res.status(404).json({ message: "Problem not found" });
    }

    const testCasesResult = await pool.query(
      `SELECT test_id, input_data, expected_output, is_hidden FROM test_cases WHERE problem_id = $1 ORDER BY test_id`,
      [problemId]
    );

    return res.status(200).json({
      problem: problemResult.rows[0],
      test_cases: testCasesResult.rows,
    });
  } catch (error) {
    console.error("Get problem by id error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/admin/problems
const createProblem = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      problem_code,
      problem_name,
      description,
      input_format,
      output_format,
      constraints,
      difficulty,
      points_assigned,
      time_limit,
      memory_limit_mb,
      competition_id,
      is_published,
      test_cases,
    } = req.body;

    if (!problem_code || !problem_name || !problem_name.trim() || !description) {
      return res.status(400).json({
        message: "problem_code, problem_name and description are required",
      });
    }

    if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
      return res.status(400).json({ message: "difficulty must be Easy, Medium or Hard" });
    }

    let resolvedMemoryLimitMb = 256;
    if (memory_limit_mb !== undefined && memory_limit_mb !== null && memory_limit_mb !== "") {
      resolvedMemoryLimitMb = Number(memory_limit_mb);
      if (!Number.isFinite(resolvedMemoryLimitMb) || resolvedMemoryLimitMb <= 0) {
        return res.status(400).json({ message: "memory_limit_mb must be a positive number" });
      }
    }

    let resolvedPointsAssigned = 0;
    if (points_assigned !== undefined && points_assigned !== null && points_assigned !== "") {
      resolvedPointsAssigned = Number(points_assigned);
      if (!Number.isFinite(resolvedPointsAssigned) || resolvedPointsAssigned < 0) {
        return res.status(400).json({ message: "points_assigned must be a non-negative number" });
      }
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

    await client.query("BEGIN");

    const problemResult = await client.query(
      `
        INSERT INTO problems (
          problem_code, problem_name, description, input_format, output_format,
          memory_limit_mb, competition_id, difficulty, time_limit, constraints,
          language, points_assigned, is_published
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `,
      [
        problem_code,
        problem_name.trim(),
        description,
        input_format?.trim() || "",
        output_format?.trim() || "",
        resolvedMemoryLimitMb,
        resolvedCompetitionId,
        difficulty,
        secondsToMs(time_limit),
        constraints?.trim() || null,
        "Any",
        resolvedPointsAssigned,
        Boolean(is_published),
      ]
    );

    const problem = problemResult.rows[0];
    const cases = Array.isArray(test_cases) ? test_cases : [];

    for (let i = 0; i < cases.length; i++) {
      const tc = cases[i];
      await client.query(
        `
          INSERT INTO test_cases (problem_id, test_id, input_data, expected_output, is_hidden)
          VALUES ($1, $2, $3, $4, $5)
        `,
        [problem.problem_id, i + 1, tc.input_data ?? "", tc.expected_output ?? "", !tc.visible]
      );
    }

    if (problem.is_published) {
      await postProblemAnnouncement(client, {
        competitionId: resolvedCompetitionId,
        adminUserId: req.user.user_id,
        title: `New Problem Published: ${problem.problem_code}`,
        message: `${problem.problem_name} is now available to solve! Difficulty: ${problem.difficulty}, Points: ${problem.points_assigned}.`,
      });
    }

    await client.query("COMMIT");

    return res.status(201).json({ problem, test_cases_saved: cases.length });
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23505") {
      return res.status(409).json({
        message: "A problem with this code or name already exists in the competition",
      });
    }

    console.error("Create problem error:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

// PATCH /api/admin/problems/:id 
const updateProblem = async (req, res) => {
  const client = await pool.connect();

  try {
    const problemId = Number(req.params.id);
    if (!problemId) {
      return res.status(400).json({ message: "Invalid problem id" });
    }

    const {
      problem_code,
      problem_name,
      description,
      input_format,
      output_format,
      constraints,
      difficulty,
      points_assigned,
      time_limit,
      memory_limit_mb,
      is_published,
      test_cases,
    } = req.body;

    let resolvedMemoryLimitMb;
    if (memory_limit_mb !== undefined) {
      resolvedMemoryLimitMb = Number(memory_limit_mb);
      if (!Number.isFinite(resolvedMemoryLimitMb) || resolvedMemoryLimitMb <= 0) {
        return res.status(400).json({ message: "memory_limit_mb must be a positive number" });
      }
    }

    let resolvedPointsAssigned;
    if (points_assigned !== undefined) {
      resolvedPointsAssigned = Number(points_assigned);
      if (!Number.isFinite(resolvedPointsAssigned) || resolvedPointsAssigned < 0) {
        return res.status(400).json({ message: "points_assigned must be a non-negative number" });
      }
    }

    await client.query("BEGIN");

    const existingResult = await client.query(
      `SELECT is_published, competition_id FROM problems WHERE problem_id = $1 FOR UPDATE`,
      [problemId]
    );

    if (existingResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Problem not found" });
    }

    const wasPublished = existingResult.rows[0].is_published;

    const updateResult = await client.query(
      `
        UPDATE problems
        SET
          problem_code = COALESCE($1, problem_code),
          problem_name = COALESCE($2, problem_name),
          description = COALESCE($3, description),
          input_format = COALESCE($4, input_format),
          output_format = COALESCE($5, output_format),
          constraints = COALESCE($6, constraints),
          difficulty = COALESCE($7, difficulty),
          points_assigned = COALESCE($8, points_assigned),
          time_limit = COALESCE($9, time_limit),
          memory_limit_mb = COALESCE($10, memory_limit_mb),
          is_published = COALESCE($11, is_published)
        WHERE problem_id = $12
        RETURNING *
      `,
      [
        problem_code ?? null,
        problem_name ? problem_name.trim() : null,
        description ?? null,
        input_format !== undefined ? input_format.trim() : null,
        output_format !== undefined ? output_format.trim() : null,
        constraints !== undefined ? constraints.trim() : null,
        difficulty ?? null,
        resolvedPointsAssigned !== undefined ? resolvedPointsAssigned : null,
        time_limit !== undefined ? secondsToMs(time_limit) : null,
        resolvedMemoryLimitMb !== undefined ? resolvedMemoryLimitMb : null,
        is_published !== undefined ? Boolean(is_published) : null,
        problemId,
      ]
    );

    if (updateResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Problem not found" });
    }

    if (Array.isArray(test_cases)) {
      // Upsert instead of delete-then-reinsert: once a problem has contestant
      // submissions, submission_test_results references test_cases with
      // ON DELETE RESTRICT, so blindly deleting every row here would throw a
      // foreign-key violation and roll back the whole update (including
      // is_published and the is_hidden/visible sync).
      const keptTestIds = [];

      for (let i = 0; i < test_cases.length; i++) {
        const tc = test_cases[i];
        const testId = i + 1;
        keptTestIds.push(testId);

        await client.query(
          `
            INSERT INTO test_cases (problem_id, test_id, input_data, expected_output, is_hidden)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (problem_id, test_id) DO UPDATE SET
              input_data = EXCLUDED.input_data,
              expected_output = EXCLUDED.expected_output,
              is_hidden = EXCLUDED.is_hidden
          `,
          [problemId, testId, tc.input_data ?? "", tc.expected_output ?? "", !tc.visible]
        );
      }

      await client.query(
        `DELETE FROM test_cases WHERE problem_id = $1 AND test_id != ALL($2::int[])`,
        [problemId, keptTestIds]
      );
    }

    const updatedProblem = updateResult.rows[0];

    // Only announce the false -> true transition, not every edit to an
    // already-published problem.
    if (!wasPublished && updatedProblem.is_published) {
      await postProblemAnnouncement(client, {
        competitionId: updatedProblem.competition_id,
        adminUserId: req.user.user_id,
        title: `New Problem Published: ${updatedProblem.problem_code}`,
        message: `${updatedProblem.problem_name} is now available to solve! Difficulty: ${updatedProblem.difficulty}, Points: ${updatedProblem.points_assigned}.`,
      });
    }

    await client.query("COMMIT");

    return res.status(200).json({ problem: updatedProblem });
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23505") {
      return res.status(409).json({
        message: "A problem with this code or name already exists in the competition",
      });
    }

    if (error.code === "23503") {
      return res.status(409).json({
        message: "Cannot remove a test case that already has contestant submissions against it.",
      });
    }

    console.error("Update problem error:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

// DELETE /api/admin/problems/:id
const deleteProblem = async (req, res) => {
  const client = await pool.connect();

  try {
    const problemId = Number(req.params.id);
    if (!problemId) {
      return res.status(400).json({ message: "Invalid problem id" });
    }

    await client.query("BEGIN");

    const result = await client.query(
      `
        DELETE FROM problems
        WHERE problem_id = $1
        RETURNING problem_id, problem_code, problem_name, competition_id, is_published
      `,
      [problemId]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Problem not found" });
    }

    const deletedProblem = result.rows[0];

    // Only announce the removal of a problem contestants could actually see.
    if (deletedProblem.is_published) {
      await postProblemAnnouncement(client, {
        competitionId: deletedProblem.competition_id,
        adminUserId: req.user.user_id,
        title: `Problem Removed: ${deletedProblem.problem_code}`,
        message: `${deletedProblem.problem_name} has been removed from the contest.`,
      });
    }

    await client.query("COMMIT");

    return res.status(200).json({ message: "Problem deleted successfully" });
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23503") {
      return res.status(409).json({
        message: "Cannot delete: this problem already has submissions linked to it",
      });
    }
    console.error("Delete problem error:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

module.exports = {
  getProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
};