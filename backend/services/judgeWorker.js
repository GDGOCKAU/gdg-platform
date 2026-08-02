// بعد أن يحفظ الكنترولر الـTokens، هذا الـWorker:
// يجلب الـTokens والـexpected outputs
// → يسأل Judge0 كل ثانية
// → ينتظر انتهاء جميع النتائج
// → يقارن stdout مع expected_output
// → يحدث submission_test_results
// → يحسب الحالة النهائية
// → يحدث submissions

const pool = require("../config/database");
const { getSubmissionBatch } = require("./judge0Service");

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const normalizeOutput = (output) =>
  String(output ?? "")
    .replace(/\r\n/g, "\n")
    .trim();

const mapJudgeStatus = (judgeResult, expectedOutput) => {
  const statusId = judgeResult.status?.id;

  if (statusId === 3) {
    return normalizeOutput(judgeResult.stdout) === normalizeOutput(expectedOutput)
      ? "Accepted"
      : "Wrong Answer";
  }

  if (statusId === 5) return "Time Limit Exceeded";
  if (statusId === 6) return "Compilation Error";
  if (statusId >= 7 && statusId <= 12) return "Runtime Error";

  return "Internal Error";
};

const getFinalSubmissionStatus = (results) => {
  if (results.every((result) => result.platformStatus === "Accepted")) {
    return "Accepted";
  }

  const statusPriority = [
    "Compilation Error",
    "Runtime Error",
    "Time Limit Exceeded",
    "Wrong Answer",
    "Internal Error",
  ];

  return (
    statusPriority.find((status) =>
      results.some((result) => result.platformStatus === status)
    ) || "Internal Error"
  );
};

const judgeSubmission = async (submissionId) => {
  try {
    const submissionResult = await pool.query(
      `
        SELECT
          s.submission_id,
          s.problem_id,
          p.points_assigned
        FROM submissions s
        JOIN problems p
          ON p.problem_id = s.problem_id
        WHERE s.submission_id = $1
      `,
      [submissionId]
    );

    if (submissionResult.rows.length === 0) {
      throw new Error(`Submission ${submissionId} was not found`);
    }

    const testResultsResult = await pool.query(
      `
        SELECT
          str.result_id,
          str.test_id,
          str.judge0_token,
          tc.expected_output
        FROM submission_test_results str
        JOIN test_cases tc
          ON tc.problem_id = str.problem_id
          AND tc.test_id = str.test_id
        WHERE str.submission_id = $1
        ORDER BY str.test_id
      `,
      [submissionId]
    );

    const testResults = testResultsResult.rows;

    if (testResults.length === 0) {
      throw new Error(`Submission ${submissionId} has no test results`);
    }

    const tokens = testResults.map((result) => result.judge0_token);

    if (tokens.some((token) => !token)) {
      throw new Error(`Submission ${submissionId} has missing Judge0 tokens`);
    }

    let judgeResults = [];
    const maximumAttempts = 15;
    const pollingDelay = 1000;

    for (let attempt = 1; attempt <= maximumAttempts; attempt++) {
      await sleep(pollingDelay);

      judgeResults = await getSubmissionBatch(tokens);

      const allFinished =
        judgeResults.length === tokens.length &&
        judgeResults.every(
          (result) => result.status?.id !== 1 && result.status?.id !== 2
        );

      if (allFinished) break;
    }

    const stillProcessing =
      judgeResults.length !== tokens.length ||
      judgeResults.some(
        (result) => result.status?.id === 1 || result.status?.id === 2
      );

    if (stillProcessing) {
      throw new Error("Judge0 did not finish within the allowed polling time");
    }

    const processedResults = judgeResults.map((judgeResult, index) => {
      const testResult = testResults[index];

      return {
        resultId: testResult.result_id,
        testId: testResult.test_id,
        platformStatus: mapJudgeStatus(
          judgeResult,
          testResult.expected_output
        ),
        judgeStatusId: judgeResult.status?.id ?? null,
        judgeStatusDescription:
          judgeResult.status?.description ?? null,
        stdout: judgeResult.stdout ?? null,
        stderr: judgeResult.stderr ?? null,
        compileOutput: judgeResult.compile_output ?? null,
        judgeMessage: judgeResult.message ?? null,
        executionTimeMs:
          judgeResult.time != null
            ? Number(judgeResult.time) * 1000
            : null,
        memoryUsedKb:
          judgeResult.memory != null
            ? Number(judgeResult.memory)
            : null,
      };
    });

    const finalStatus = getFinalSubmissionStatus(processedResults);

    const passedTestCases = processedResults.filter(
      (result) => result.platformStatus === "Accepted"
    ).length;

    const executionTimes = processedResults
      .map((result) => result.executionTimeMs)
      .filter((value) => value !== null);

    const memoryValues = processedResults
      .map((result) => result.memoryUsedKb)
      .filter((value) => value !== null);

    const maxExecutionTimeMs =
      executionTimes.length > 0 ? Math.max(...executionTimes) : null;

    const maxMemoryUsedKb =
      memoryValues.length > 0 ? Math.max(...memoryValues) : null;

    const score =
      finalStatus === "Accepted"
        ? Number(submissionResult.rows[0].points_assigned)
        : 0;

    const firstFailedResult = processedResults.find(
      (result) => result.platformStatus !== "Accepted"
    );

    const errorMessage = firstFailedResult
      ? firstFailedResult.compileOutput ||
        firstFailedResult.stderr ||
        firstFailedResult.judgeMessage ||
        firstFailedResult.platformStatus
      : null;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      for (const result of processedResults) {
        await client.query(
          `
            UPDATE submission_test_results
            SET
              status = $1,
              judge0_status_id = $2,
              judge0_status_description = $3,
              execution_time_ms = $4,
              memory_used_kb = $5,
              stdout = $6,
              stderr = $7,
              compile_output = $8,
              judge_message = $9,
              completed_at = CURRENT_TIMESTAMP
            WHERE result_id = $10
          `,
          [
            result.platformStatus,
            result.judgeStatusId,
            result.judgeStatusDescription,
            result.executionTimeMs,
            result.memoryUsedKb,
            result.stdout,
            result.stderr,
            result.compileOutput,
            result.judgeMessage,
            result.resultId,
          ]
        );
      }

      await client.query(
        `
          UPDATE submissions
          SET
            status = $1,
            passed_testcases = $2,
            score = $3,
            max_execution_time_ms = $4,
            max_memory_used_kb = $5,
            error_message = $6,
            judged_at = CURRENT_TIMESTAMP
          WHERE submission_id = $7
        `,
        [
          finalStatus,
          passedTestCases,
          score,
          maxExecutionTimeMs,
          maxMemoryUsedKb,
          errorMessage,
          submissionId,
        ]
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    console.log(
      `Submission ${submissionId} judged successfully: ${finalStatus}`
    );

    return {
      submissionId,
      status: finalStatus,
      passedTestCases,
      totalTestCases: processedResults.length,
    };
  } catch (error) {
    console.error(`Judge worker error for submission ${submissionId}:`, error);

    try {
      await pool.query(
        `
          UPDATE submissions
          SET
            status = 'Internal Error',
            error_message = $1,
            judged_at = CURRENT_TIMESTAMP
          WHERE submission_id = $2
            AND status = 'Judging'
        `,
        [error.message, submissionId]
      );

      await pool.query(
        `
          UPDATE submission_test_results
          SET
            status = 'Internal Error',
            judge_message = $1,
            completed_at = CURRENT_TIMESTAMP
          WHERE submission_id = $2
            AND status IN ('Queued', 'Processing')
        `,
        [error.message, submissionId]
      );
    } catch (databaseError) {
      console.error(
        `Failed to mark submission ${submissionId} as Internal Error:`,
        databaseError
      );
    }

    throw error;
  }
};

// Runs once at server startup. If the process was previously killed/restarted
// while submissions were mid-flight, they'd otherwise sit at 'Judging' or
// 'Queued' forever with nothing left to poll them (judgeSubmission runs
// in-process and fire-and-forget, so a crash silently drops it).
const recoverStuckSubmissions = async () => {
  try {
    // Already dispatched to Judge0 (has tokens) — just resume polling.
    const judgingResult = await pool.query(
      `SELECT submission_id FROM submissions WHERE status = 'Judging'`
    );

    for (const row of judgingResult.rows) {
      judgeSubmission(row.submission_id).catch((error) => {
        console.error(
          `Startup recovery: failed to resume submission ${row.submission_id}:`,
          error
        );
      });
    }

    // Never made it to Judge0 (no tokens exist yet) — nothing to resume, so
    // fail them cleanly instead of leaving the team staring at "Queued"
    // forever. The 2-minute cutoff avoids racing a submission that is still
    // legitimately mid-dispatch on this same boot.
    const staleQueuedResult = await pool.query(
      `
        UPDATE submissions
        SET
          status = 'Internal Error',
          error_message = 'Submission was interrupted by a server restart. Please resubmit.',
          judged_at = CURRENT_TIMESTAMP
        WHERE status = 'Queued'
          AND submitted_at < CURRENT_TIMESTAMP - INTERVAL '2 minutes'
        RETURNING submission_id
      `
    );

    if (staleQueuedResult.rows.length > 0) {
      await pool.query(
        `
          UPDATE submission_test_results
          SET
            status = 'Internal Error',
            judge_message = 'Submission was interrupted by a server restart.',
            completed_at = CURRENT_TIMESTAMP
          WHERE submission_id = ANY($1::bigint[])
            AND status = 'Queued'
        `,
        [staleQueuedResult.rows.map((row) => row.submission_id)]
      );
    }

    if (judgingResult.rows.length > 0 || staleQueuedResult.rows.length > 0) {
      console.log(
        `Startup recovery: resumed ${judgingResult.rows.length} judging submission(s), failed ${staleQueuedResult.rows.length} stale queued submission(s).`
      );
    }
  } catch (error) {
    console.error("Startup submission recovery failed:", error);
  }
};

module.exports = {
  judgeSubmission,
  recoverStuckSubmissions,
};