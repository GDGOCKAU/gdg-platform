const pool = require("../config/database.js");
const { judgeSubmission } = require("../services/judgeWorker");
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const {createSubmissionBatch, getSubmissionBatch, } = require("../services/judge0Service");

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

      const submissionId = submissionResult.rows[0].submission_id;

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

      judgeSubmission(submissionId).catch((error) => {
        console.error(
          `Background judging failed for submission ${submissionId}:`,
          error
        );
      });

      let judgeResults = [];
      const maximumAttempts = 10;
      const pollingDelay = 1000;

      for (let attempt = 1; attempt <= maximumAttempts; attempt++) {
        await sleep(pollingDelay);

        judgeResults = await getSubmissionBatch(tokens);

        const allFinished = judgeResults.every(
          (result) => result.status?.id !== 1 && result.status?.id !== 2
        );

        if (allFinished) {
          break;
        }
      }

      const stillProcessing = judgeResults.some(
        (result) => result.status?.id === 1 || result.status?.id === 2
      );

      if (stillProcessing) {
        return res.status(202).json({
          message: "Submission is still being judged",
          submissionId,
          status: "Judging",
        });
      }

      const normalizeOutput = (output) =>
      String(output ?? "")
        .replace(/\r\n/g, "\n")
        .trim();

      const processedResults = judgeResults.map((judgeResult, index) => {
      const testCase = testCases[index];
      const judgeStatusId = judgeResult.status?.id;

      let platformStatus;

      if (judgeStatusId === 3) {
        platformStatus =
          normalizeOutput(judgeResult.stdout) ===
          normalizeOutput(testCase.expected_output)
            ? "Accepted"
            : "Wrong Answer";
      } else if (judgeStatusId === 5) {
        platformStatus = "Time Limit Exceeded";
      } else if (judgeStatusId === 6) {
        platformStatus = "Compilation Error";
      } else if (judgeStatusId >= 7 && judgeStatusId <= 12) {
        platformStatus = "Runtime Error";
      } else {
        platformStatus = "Internal Error";
      }

      return {
        testId: testCase.test_id,
        platformStatus,
        judgeStatusId,
        judgeStatusDescription: judgeResult.status?.description,
        stdout: judgeResult.stdout,
        stderr: judgeResult.stderr,
        compileOutput: judgeResult.compile_output,
        message: judgeResult.message,
        executionTimeMs:
          judgeResult.time !== null && judgeResult.time !== undefined
            ? Number(judgeResult.time) * 1000
            : null,
        memoryUsedKb:
          judgeResult.memory !== null && judgeResult.memory !== undefined
            ? Number(judgeResult.memory)
            : null,
      };
    });

      return res.status(201).json({
        message: "Submission sent to Judge0 successfully",
        submissionId,
        status: "Judging",
        totalTestCases: testCases.length,
      });

    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Create submission error:", error);

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
};