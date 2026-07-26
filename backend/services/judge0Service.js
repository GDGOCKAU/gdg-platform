const axios = require("axios");

const judge0Client = axios.create({
  baseURL: process.env.JUDGE0_API_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    ...(process.env.JUDGE0_API_KEY && {
      "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
    }),
    ...(process.env.JUDGE0_API_HOST && {
      "X-RapidAPI-Host": process.env.JUDGE0_API_HOST,
    }),
  },
});

const createSubmissionBatch = async ({
  sourceCode,
  languageId,
  testCases,
  cpuTimeLimit,
  memoryLimit,
}) => {
  try {
    const submissions = testCases.map((testCase) => ({
      source_code: sourceCode,
      language_id: languageId,
      stdin: testCase.input_data,
      ...(cpuTimeLimit !== undefined && {
        cpu_time_limit: cpuTimeLimit,
      }),
      ...(memoryLimit !== undefined && {
        memory_limit: memoryLimit,
      }),
    }));

    const response = await judge0Client.post(
      "/submissions/batch",
      { submissions },
      {
        params: {
          base64_encoded: false,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Judge0 create batch error:",
      error.response?.data || error.message
    );

    throw new Error("Failed to create Judge0 submission batch");
  }
};

const getSubmissionBatch = async (tokens) => {
  try {
    const response = await judge0Client.get("/submissions/batch", {
      params: {
        tokens: tokens.join(","),
        base64_encoded: false,
        fields: [
          "token",
          "stdout",
          "stderr",
          "compile_output",
          "message",
          "status",
          "time",
          "memory",
        ].join(","),
      },
    });

    return response.data.submissions;
  } catch (error) {
    console.error(
      "Judge0 get batch error:",
      error.response?.data || error.message
    );

    throw new Error("Failed to retrieve Judge0 submission batch");
  }
};

module.exports = {
  createSubmissionBatch,
  getSubmissionBatch,
};