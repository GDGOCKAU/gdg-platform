const {createSubmissionBatch, getSubmissionBatch,} = require("../services/judge0Service");

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const testBatch = async (req, res) => {
  try {
    const { sourceCode, languageId, testCases } = req.body;

    if (!sourceCode?.trim()) {
      return res.status(400).json({
        message: "Source code is required",
      });
    }

    if (!Number.isInteger(languageId)) {
      return res.status(400).json({
        message: "A valid language ID is required",
      });
    }

    if (!Array.isArray(testCases) || testCases.length === 0) {
      return res.status(400).json({
        message: "At least one test case is required",
      });
    }

    const invalidTestCase = testCases.some(
      (testCase) =>
        typeof testCase.input_data !== "string" ||
        typeof testCase.expected_output !== "string"
    );

    if (invalidTestCase) {
      return res.status(400).json({
        message: "Every test case must contain input_data and expected_output",
      });
    }

    const createdSubmissions = await createSubmissionBatch({
      sourceCode,
      languageId,
      testCases,
    });

    const tokens = createdSubmissions.map((submission) => submission.token);

    if (tokens.length !== testCases.length || tokens.some((token) => !token)) {
      return res.status(502).json({
        message: "Judge0 did not return valid tokens for all test cases",
      });
    }

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
      return res.status(504).json({
        message: "Judge0 did not finish processing within the allowed time",
        tokens,
      });
    }

    const normalizeOutput = (output) =>
      String(output ?? "")
        .replace(/\r\n/g, "\n")
        .trim();

    const results = judgeResults.map((judgeResult, index) => {
      const testCase = testCases[index];

      const executionSucceeded = judgeResult.status?.id === 3;

      const outputMatches =
        normalizeOutput(judgeResult.stdout) ===
        normalizeOutput(testCase.expected_output);

      return {
        testId: testCase.test_id ?? index + 1,
        token: judgeResult.token,
        statusId: judgeResult.status?.id,
        judgeStatus: judgeResult.status?.description,
        platformStatus: executionSucceeded
          ? outputMatches
            ? "Accepted"
            : "Wrong Answer"
          : judgeResult.status?.description || "Internal Error",
        expectedOutput: testCase.expected_output,
        actualOutput: judgeResult.stdout,
        stderr: judgeResult.stderr,
        compileOutput: judgeResult.compile_output,
        message: judgeResult.message,
        executionTimeSeconds: judgeResult.time,
        memoryUsedKb: judgeResult.memory,
      };
    });

    const accepted = results.every(
      (result) => result.platformStatus === "Accepted"
    );

    return res.status(200).json({
      status: accepted ? "Accepted" : "Failed",
      passedTestCases: results.filter(
        (result) => result.platformStatus === "Accepted"
      ).length,
      totalTestCases: results.length,
      results,
    });
  } catch (error) {
    console.error("Judge batch test error:", error);

    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

module.exports = {
  testBatch,
};