const pool = require("../config/database");

const getProblems = async (req, res) => {
  try {
    const query = `
        SELECT
          problem_id,
          problem_name,
          difficulty,
          points_assigned AS points,
          ROW_NUMBER() OVER (
            ORDER BY problem_id
          ) AS problem_order
        FROM problems
        ORDER BY problem_id
      `;

    const result = await pool.query(query);

    const problems = result.rows.map((problem) => ({
      ...problem,
      problem_code: String.fromCharCode(
        64 + Number(problem.problem_order)
      ),
    }));

    res.status(200).json(problems);
  } catch (error) {
    console.error("Get problems error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

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
        p.description,
        p.input_format,
        p.output_format,
        p.memory_limit_mb,
        p.constraints,
        p.difficulty,
        p.points_assigned AS points,
        p.time_limit,

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
    
    const testCasesQuery = `
    SELECT
    test_id,
    input_data,
    expected_output
    FROM test_cases
    WHERE problem_id = $1
    AND is_hidden = FALSE
    ORDER BY test_id
    `;
    
    const testCasesResult = await pool.query(testCasesQuery, [problemId]);
    
    const problemCode = String.fromCharCode(
      64 + Number(problem.problem_order)
    );

    return res.status(200).json({
      problem_id: problem.problem_id,
      problem_code: problemCode,
      problem_name: problem.problem_name,
      description: problem.description,
      input_format: problem.input_format,
      output_format: problem.output_format,
      memory_limit_mb: problem.memory_limit_mb,
      difficulty: problem.difficulty,
      points: problem.points,
      time_limit: problem.time_limit,
      constraints: problem.constraints,

      sample_test_cases: testCasesResult.rows,
    });
  } catch (error) {
    console.error("Get problem error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  getProblemById, getProblems
};