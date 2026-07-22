const pool = require("../config/database.js");

const createSubmission = async (req, res) => {
  try {
    const {
      team_id,
      problem_id,
      language,
      source_code,
    } = req.body;

    if (!team_id || !problem_id || !language || !source_code?.trim()) {
      return res.status(400).json({
        message: "team_id, problem_id, language, and source_code are required",
      });
    }

    const query = `
      INSERT INTO submissions (
        team_id,
        problem_id,
        status,
        language,
        source_code
      )
      VALUES ($1, $2, 'Pending', $3, $4)
      RETURNING
        submission_id,
        team_id,
        problem_id,
        status,
        language,
        source_code,
        judge0_token,
        execution_time,
        memory_used_kb,
        submitted_at
    `;

    const values = [
      team_id,
      problem_id,
      language,
      source_code.trim(),
    ];

    const result = await pool.query(query, values);

    return res.status(201).json({
      message: "Submission created successfully",
      submission: result.rows[0],
    });
  } catch (error) {
    console.error("Create submission error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  createSubmission,
};