
/*
Judge0 finishes evaluating a submission.
if submission status == Accepted, then --> leaderboardTrigger() function is called.
the leaderboard controller retrieves the problem's point value from the problems table in the DB.
the team's leaderboard totalPoints is updated by incrementing the points --> defualt is 0
the leaderboard is re-ranked based on the updated scores.
the updated leaderboard is stored in the DB.
when a user opens the leaderboard page, the ranked results are returned to the frontend.
 
 **/




const pool = require("../config/database");

//triggered after Judge0 returns Accepted --> trigger implemented in judgeWorker class
//calls all the helper methods below
const leaderboardTrigger = async (teamId, problemId) => {

    try {

        const competitionResult = await pool.query(
            `
            SELECT competition_id
            FROM teams
            WHERE team_id = $1
            `,
            [teamId]
        );

        if (competitionResult.rows.length === 0) {
            return;
        }

        const competitionId =
            competitionResult.rows[0].competition_id;

        const pointsAssigned =
            await getProblemPoints(problemId);

        await assignPoints(

            teamId,

            competitionId,

            pointsAssigned

        );

        await recalculateRanks(
            competitionId
        );

        await storeLeaderboard(
            competitionId
        );

    }

    catch (error) {

        console.error(
            "Leaderboard trigger error:",
            error
        );

        throw error;

    }

};

//retrieves the points assigned to a problem from problems table
const getProblemPoints = async (problemId) => {

    const problemResult = await pool.query(

        `
        SELECT points_assigned
        FROM problems
        WHERE problem_id = $1
        `,

        [problemId]

    );

    if (problemResult.rows.length === 0) {

        throw new Error(
            "Problem not found."
        );

    }

    return Number(
        problemResult.rows[0].points_assigned
    );

};

//assign the points retrieved to the teams total points --> defualt is 0
const assignPoints = async (teamId,competitionId,pointsAssigned) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const leaderboardResult =
            await client.query(

                `
                SELECT

                    points,

                    solved_questions

                FROM leaderboard

                WHERE

                    team_id = $1

                    AND competition_id = $2
                `,

                [

                    teamId,

                    competitionId

                ]

            );

        if (
            leaderboardResult.rows.length === 0
        ) {

            throw new Error(
                "Leaderboard row not found."
            );

        }

        const currentPoints =
            Number(
                leaderboardResult.rows[0].points
            );

        const currentSolvedQuestions =
            Number(
                leaderboardResult.rows[0].solved_questions
            );

        const updatedPoints =
            currentPoints + pointsAssigned;

        const updatedSolvedQuestions =
            currentSolvedQuestions + 1;

        await client.query(

            `
            UPDATE leaderboard

            SET

                points = $1,

                solved_questions = $2

            WHERE

                team_id = $3

                AND competition_id = $4
            `,

            [

                updatedPoints,

                updatedSolvedQuestions,

                teamId,

                competitionId

            ]

        );

        await client.query("COMMIT");

    }

    catch (error) {

        await client.query("ROLLBACK");

        throw error;

    }

    finally {

        client.release();

    }

};

//after changing the points by adding to the balance, this method recalculates the ranks
const recalculateRanks = async (competitionId) => {

    const leaderboardResult =
        await pool.query(

            `
            SELECT

                leaderboard.team_id,

                leaderboard.points,

                leaderboard.solved_questions

            FROM leaderboard

            WHERE

                leaderboard.competition_id = $1

            ORDER BY

                leaderboard.points DESC,

                leaderboard.solved_questions DESC
            `,

            [

                competitionId

            ]

        );

    return leaderboardResult.rows;

};

//stores the re-ranking into the leaderboard teble inside the DB 
const storeLeaderboard = async (competitionId) => {

    const leaderboardResult =
        await pool.query(

            `
            SELECT

                leaderboard.team_id,

                leaderboard.competition_id,

                leaderboard.points,

                leaderboard.solved_questions

            FROM leaderboard

            WHERE

                leaderboard.competition_id = $1

            ORDER BY

                leaderboard.points DESC,

                leaderboard.solved_questions DESC
            `,

            [

                competitionId

            ]

        );

    return leaderboardResult.rows;

};

//formats a millisecond offset as "+NN min" for a single accepted problem
const formatOffset = (ms) => {
    const totalMinutes = Math.max(0, Math.floor(ms / 60000));
    return `+${String(totalMinutes).padStart(2, "0")} min`;
};

//formats a millisecond duration as "HH:MM:SS" for the total time column
const formatDuration = (ms) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

//displays the leaderboard per competition
const getLeaderboard = async (req,res) => {

    try {

        const {competitionId} = req.params;

        const competitionResult = await pool.query(
            `SELECT started_at FROM competitions WHERE competition_id = $1`,
            [competitionId]
        );

        if (competitionResult.rows.length === 0) {
            return res.status(404).json({
                message: "Competition not found.",
            });
        }

        const contestStartedAt = competitionResult.rows[0].started_at;

        const problemsResult = await pool.query(
            `SELECT problem_id, problem_code
             FROM problems
             WHERE competition_id = $1
             ORDER BY problem_code`,
            [competitionId]
        );

        const leaderboardResult =
            await pool.query(

                `
                SELECT

                    ROW_NUMBER() OVER(

                        PARTITION BY leaderboard.competition_id

                        ORDER BY

                            leaderboard.points DESC,

                            leaderboard.solved_questions DESC

                    ) AS rank,

                    team.team_id,

                    team.team_name,

                    leaderboard.points,

                    leaderboard.solved_questions

                FROM leaderboard

                INNER JOIN teams team

                    ON leaderboard.team_id =
                    team.team_id

                WHERE

                    leaderboard.competition_id = $1

                ORDER BY

                    leaderboard.points DESC,

                    leaderboard.solved_questions DESC
                `,

                [

                    competitionId

                ]

            );

        const problemIds = problemsResult.rows.map((p) => p.problem_id);

        const submissionsResult = problemIds.length === 0
            ? { rows: [] }
            : await pool.query(
                `
                SELECT
                    team_id,
                    problem_id,
                    MIN(submitted_at) FILTER (WHERE status = 'Accepted') AS accepted_at,
                    COUNT(*) FILTER (WHERE status NOT IN ('Queued', 'Judging')) AS attempt_count
                FROM submissions
                WHERE problem_id = ANY($1::int[])
                GROUP BY team_id, problem_id
                `,
                [problemIds]
            );

        const submissionsByTeam = new Map();
        for (const row of submissionsResult.rows) {
            if (!submissionsByTeam.has(row.team_id)) {
                submissionsByTeam.set(row.team_id, new Map());
            }
            submissionsByTeam.get(row.team_id).set(row.problem_id, row);
        }

        const leaderboard = leaderboardResult.rows.map((team) => {
            const teamSubmissions = submissionsByTeam.get(team.team_id);
            let totalTimeMs = 0;

            const problems = problemsResult.rows.map((problem) => {
                const submission = teamSubmissions?.get(problem.problem_id);

                if (!submission || submission.attempt_count === "0") {
                    return { problem_code: problem.problem_code, state: "unattempted" };
                }

                if (submission.accepted_at) {
                    const offsetMs = new Date(submission.accepted_at) - new Date(contestStartedAt);
                    totalTimeMs += offsetMs;
                    return {
                        problem_code: problem.problem_code,
                        state: "accepted",
                        time: formatOffset(offsetMs),
                    };
                }

                return {
                    problem_code: problem.problem_code,
                    state: "wrong",
                    attempts: Number(submission.attempt_count),
                };
            });

            return {
                rank: Number(team.rank),
                team_id: team.team_id,
                team_name: team.team_name,
                points: team.points,
                solved_questions: team.solved_questions,
                total_time: formatDuration(totalTimeMs),
                problems,
            };
        });

        return res.status(200).json(leaderboard);

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            message:

            "Unable to retrieve leaderboard."

        });

    }

};


module.exports = {

    leaderboardTrigger,
    getProblemPoints,
    assignPoints,
    recalculateRanks,
    storeLeaderboard,
    getLeaderboard

};