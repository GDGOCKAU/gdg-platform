const pool = require("../config/database.js");
const { judgeSubmission } = require("../services/judgeWorker");

const { createSubmissionBatch } = require("../services/judge0Service");

const createSubmission = async (req, res) => {
  try {
    const teamId = req.user.team_id;
    const competitionId = req.user.competition_id;
    const {
      problemId,
      languageId,
      languageName,
      sourceCode,
    } = req.body;

    if (
      !Number.isInteger(problemId) ||
      !Number.isInteger(languageId) ||
      !languageName?.trim() ||
      !sourceCode?.trim()
    ) {
      return res.status(400).json({
        message:
          "problemId, languageId, languageName, and sourceCode are required",
      });
    }

    const teamResult = await pool.query(
      `SELECT is_disqualified FROM teams WHERE team_id = $1`,
      [teamId]
    );

    if (teamResult.rows[0]?.is_disqualified) {
      return res.status(403).json({
        message: "Your team has been disqualified from this competition.",
      });
    }

    const problemResult = await pool.query(
      `
        SELECT
          p.problem_id,
          p.points_assigned,
          p.time_limit,
          p.memory_limit_mb,
          c.started_at,
          c.ended_at
        FROM problems p
        JOIN competitions c
          ON c.competition_id = p.competition_id
        WHERE p.problem_id = $1
          AND p.competition_id = $2
      `,
      [problemId, competitionId]
    );

    if (problemResult.rows.length === 0) {
      return res.status(404).json({
        message: "Problem not found in your competition",
      });
    }


    const testCasesResult = await pool.query(
      `
        SELECT
          test_id,
          input_data,
          expected_output
        FROM test_cases
        WHERE problem_id = $1
        ORDER BY test_id
      `,
      [problemId]
    );

    if (testCasesResult.rows.length === 0) {
      return res.status(409).json({
        message: "This problem has no test cases configured",
      });
    }

    const problem = problemResult.rows[0];

    const now = new Date();
    const contestStart = new Date(problem.started_at);
    const contestEnd = new Date(problem.ended_at);

    if (Number.isNaN(contestStart.getTime()) || Number.isNaN(contestEnd.getTime())) {
      return res.status(500).json({
        message: "Contest start or end time is invalid",
      });
    }

    if (now < contestStart) {
      return res.status(403).json({
        message: "The contest has not started yet.",
      });
    }

    if (now >= contestEnd) {
      return res.status(403).json({
        message: "The contest has already ended.",
      });
    }
    const testCases = testCasesResult.rows;

    let submissionId;

    {
      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        const submissionResult = await client.query(
          `
            INSERT INTO submissions (
              team_id,
              problem_id,
              status,
              language_id,
              language_name,
              source_code,
              total_testcases
            )
            VALUES ($1, $2, 'Queued', $3, $4, $5, $6)
            RETURNING submission_id
          `,
          [
            teamId,
            problemId,
            languageId,
            languageName.trim(),
            sourceCode.trim(),
            testCases.length,
          ]
        );

        submissionId = submissionResult.rows[0].submission_id;

        for (const testCase of testCases) {
          await client.query(
            `
              INSERT INTO submission_test_results (
                submission_id,
                problem_id,
                test_id,
                status
              )
              VALUES ($1, $2, $3, 'Queued')
            `,
            [
              submissionId,
              problemId,
              testCase.test_id,
            ]
          );
        }

        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }

    // The submission row now exists as 'Queued'. If dispatching to Judge0
    // fails from here on (network blip, Judge0 down), fail the submission
    // cleanly instead of leaving it silently stuck at 'Queued' forever.
    try {
      const judgeSubmissions = await createSubmissionBatch({
        sourceCode: sourceCode.trim(),
        languageId,
        testCases,
        cpuTimeLimit: problem.time_limit / 1000,
        memoryLimit: problem.memory_limit_mb * 1024,
      });

      const tokens = judgeSubmissions.map((item) => item.token);

      if (tokens.length !== testCases.length || tokens.some((token) => !token)) {
        throw new Error("Judge0 did not return valid tokens for all test cases");
      }

      const tokenClient = await pool.connect();

      try {
        await tokenClient.query("BEGIN");

        for (let index = 0; index < testCases.length; index++) {
          await tokenClient.query(
            `
              UPDATE submission_test_results
              SET
                judge0_token = $1,
                status = 'Processing',
                processing_started_at = CURRENT_TIMESTAMP
              WHERE submission_id = $2
                AND test_id = $3
            `,
            [
              tokens[index],
              submissionId,
              testCases[index].test_id,
            ]
          );
        }

        await tokenClient.query(
          `
            UPDATE submissions
            SET
              status = 'Judging',
              judging_started_at = CURRENT_TIMESTAMP
            WHERE submission_id = $1
          `,
          [submissionId]
        );

        await tokenClient.query("COMMIT");
      } catch (error) {
        await tokenClient.query("ROLLBACK");
        throw error;
      } finally {
        tokenClient.release();
      }
    } catch (dispatchError) {
      console.error(
        `Judge0 dispatch failed for submission ${submissionId}:`,
        dispatchError
      );

      await pool.query(
        `
          UPDATE submissions
          SET
            status = 'Internal Error',
            error_message = $2,
            judged_at = CURRENT_TIMESTAMP
          WHERE submission_id = $1
        `,
        [
          submissionId,
          "Judge0 is currently unavailable. Please try submitting again.",
        ]
      );

      await pool.query(
        `
          UPDATE submission_test_results
          SET
            status = 'Internal Error',
            judge_message = 'Judge0 is currently unavailable.',
            completed_at = CURRENT_TIMESTAMP
          WHERE submission_id = $1
        `,
        [submissionId]
      );

      return res.status(503).json({
        message: "The judge is temporarily unavailable. Your submission was not evaluated — please try again in a moment.",
        submissionId,
      });
    }

    // Actual judging (polling Judge0 for results and persisting them) is
    // handled entirely by the background worker — the HTTP response doesn't
    // wait on it.
    judgeSubmission(submissionId).catch((error) => {
      console.error(
        `Background judging failed for submission ${submissionId}:`,
        error
      );
    });

    return res.status(201).json({
      message: "Submission sent to Judge0 successfully",
      submissionId,
      status: "Judging",
      totalTestCases: testCases.length,
    });
  } catch (error) {
    console.error("Create submission error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET /api/submissions?problem_id=X
// A team's own past attempts for one problem, most recent first — lets a
// contestant come back to a problem and see their previous verdicts instead
// of losing them the moment they navigate away.
const getSubmissionsForProblem = async (req, res) => {
  try {
    const problemId = Number(req.query.problem_id);

    if (!Number.isInteger(problemId)) {
      return res.status(400).json({
        message: "problem_id is required",
      });
    }

    const result = await pool.query(
      `
        SELECT
          submission_id,
          status,
          language_name,
          passed_testcases,
          total_testcases,
          score,
          submitted_at,
          judged_at
        FROM submissions
        WHERE problem_id = $1
          AND team_id = $2
        ORDER BY submitted_at DESC
        LIMIT 20
      `,
      [problemId, req.user.team_id]
    );

    return res.status(200).json({ submissions: result.rows });
  } catch (error) {
    console.error("Get submissions for problem error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getSubmissionById = async (req, res) => {
  try {
    const submissionId = Number(req.params.submissionId);

    if (!Number.isInteger(submissionId)) {
      return res.status(400).json({
        message: "Invalid submission id",
      });
    }

    const result = await pool.query(
      `
        SELECT
          submission_id,
          team_id,
          problem_id,
          status,
          language_name,
          passed_testcases,
          total_testcases,
          score,
          max_execution_time_ms,
          max_memory_used_kb,
          error_message,
          submitted_at,
          judged_at
        FROM submissions
        WHERE submission_id = $1
          AND team_id = $2
      `,
      [
        submissionId,
        req.user.team_id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    const submission = result.rows[0];

    const testResults = await pool.query(
      `
        SELECT
          str.test_id,
          str.status,
          str.execution_time_ms,
          str.memory_used_kb,
          tc.is_hidden
        FROM submission_test_results str
        JOIN test_cases tc
          ON tc.problem_id = str.problem_id
          AND tc.test_id = str.test_id
        WHERE str.submission_id = $1
        ORDER BY str.test_id
      `,
      [submissionId]
    );

    return res.status(200).json({
      submission,
      testResults: testResults.rows.filter((testResult) => !testResult.is_hidden),
    });
  } catch (error) {
    console.error("Get submission error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  createSubmission,
  getSubmissionById,
  getSubmissionsForProblem,
};