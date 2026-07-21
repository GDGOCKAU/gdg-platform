const pool = require("../config/database");

const getProblemById = async (req, res) => {
  try {
    const problemId = Number(req.params.problemId);

    if (!Number.isInteger(problemId) || problemId <= 0) {
      return res.status(400).json({
        message: "Invalid problem ID",
      });
    }

    const query = `
      SELECT
        p.problem_id,
        p.problem_name,
        p.difficulty,
        p.points_assigned AS points,
        EXTRACT(EPOCH FROM p.duration) AS time_limit_seconds,

        ROW_NUMBER() OVER (
          PARTITION BY p.competition_id
          ORDER BY p.problem_id
        ) AS problem_order

      FROM problems p
      WHERE p.competition_id = (
        SELECT competition_id
        FROM problems
        WHERE problem_id = $1
      )
    `;

    const result = await pool.query(query, [problemId]);

    const problem = result.rows.find(
      (row) => Number(row.problem_id) === problemId
    );

    if (!problem) {
      return res.status(404).json({
        message: "Problem not found",
      });
    }

    const problemCode = String.fromCharCode(
      64 + Number(problem.problem_order)
    );

    return res.status(200).json({
      problem_id: problem.problem_id,
      problem_code: problemCode,
      problem_name: problem.problem_name,
      difficulty: problem.difficulty,
      points: problem.points,
      time_limit_seconds: Number(problem.time_limit_seconds),
    });
  } catch (error) {
    console.error("Get problem error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  getProblemById,
};