
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

// How long before a competition ends the scoreboard freezes. Standings stop
// reflecting new Accepted verdicts during this window (they're still judged
// and scored internally) and reveal in full once the contest ends — this is
// the standard ICPC-style "final freeze" to keep the last stretch tense.
const FREEZE_WINDOW_MS = 15 * 60 * 1000;

// Whether the scoreboard is frozen right now, and why — shared by the
// leaderboard builder below and by the admin contest endpoints, so the admin
// UI can show "Frozen (Auto)" during the last-15-minutes window instead of
// only knowing about a freeze the admin triggered manually.
const getScoreboardFreezeState = ({ status, ended_at }) => {
    const freezeStartsAt = new Date(new Date(ended_at).getTime() - FREEZE_WINDOW_MS);
    const endedAt = new Date(ended_at);
    const now = new Date();

    const isAutoFrozen = status === "Active" && now >= freezeStartsAt && now < endedAt;
    const isFrozen = status === "Frozen" || isAutoFrozen;

    return { isFrozen, isAutoFrozen, freezeStartsAt };
};

//builds the ranked leaderboard payload for a competition — shared by the
//participant-facing route and the admin contest archive.
const buildLeaderboard = async (competitionId) => {

        const competitionResult = await pool.query(
            `SELECT started_at, ended_at, status FROM competitions WHERE competition_id = $1`,
            [competitionId]
        );

        if (competitionResult.rows.length === 0) {
            return null;
        }

        const { started_at: contestStartedAt, ended_at: contestEndedAt, status } = competitionResult.rows[0];

        const { isFrozen, isAutoFrozen, freezeStartsAt } = getScoreboardFreezeState({ status, ended_at: contestEndedAt });

        const cutoff = isFrozen ? freezeStartsAt : null;

        const problemsResult = await pool.query(
            `SELECT problem_id, problem_code, points_assigned
             FROM problems
             WHERE competition_id = $1
             ORDER BY problem_code`,
            [competitionId]
        );

        const problemIds = problemsResult.rows.map((p) => p.problem_id);

        const submissionsResult = problemIds.length === 0
            ? { rows: [] }
            : await pool.query(
                `
                SELECT
                    team_id,
                    problem_id,
                    MIN(submitted_at) FILTER (
                        WHERE status = 'Accepted'
                          AND ($2::timestamptz IS NULL OR submitted_at <= $2)
                    ) AS accepted_at,
                    COUNT(*) FILTER (
                        WHERE status NOT IN ('Queued', 'Judging')
                          AND ($2::timestamptz IS NULL OR submitted_at <= $2)
                    ) AS attempt_count
                FROM submissions
                WHERE problem_id = ANY($1::int[])
                GROUP BY team_id, problem_id
                `,
                [problemIds, cutoff]
            );

        const submissionsByTeam = new Map();
        for (const row of submissionsResult.rows) {
            if (!submissionsByTeam.has(row.team_id)) {
                submissionsByTeam.set(row.team_id, new Map());
            }
            submissionsByTeam.get(row.team_id).set(row.problem_id, row);
        }

        // Points/solved counts are recomputed directly from submissions (rather
        // than read off the live-updated `leaderboard` table) so the same
        // cutoff can be applied consistently to rank, score, and the per-problem
        // cells during a freeze.
        const teamsResult = await pool.query(
            `SELECT team_id, team_name FROM teams WHERE competition_id = $1 AND is_disqualified = FALSE`,
            [competitionId]
        );

        const scored = teamsResult.rows.map((team) => {
            const teamSubmissions = submissionsByTeam.get(team.team_id);
            let points = 0;
            let solvedQuestions = 0;
            let totalTimeMs = 0;

            const problems = problemsResult.rows.map((problem) => {
                const submission = teamSubmissions?.get(problem.problem_id);

                if (!submission || submission.attempt_count === "0") {
                    return { problem_code: problem.problem_code, state: "unattempted" };
                }

                if (submission.accepted_at) {
                    const offsetMs = new Date(submission.accepted_at) - new Date(contestStartedAt);
                    totalTimeMs += offsetMs;
                    solvedQuestions += 1;
                    points += Number(problem.points_assigned) || 0;
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
                team_id: team.team_id,
                team_name: team.team_name,
                points,
                solved_questions: solvedQuestions,
                total_time: formatDuration(totalTimeMs),
                problems,
            };
        });

        scored.sort((a, b) => b.points - a.points || b.solved_questions - a.solved_questions);

        const leaderboard = scored.map((team, index) => ({
            rank: index + 1,
            ...team,
        }));

        return {
            leaderboard,
            is_frozen: isFrozen,
            is_auto_frozen: isAutoFrozen,
            freeze_ends_at: isFrozen ? contestEndedAt : null,
        };

};

//displays the leaderboard per competition
const getLeaderboard = async (req, res) => {

    try {

        const { competitionId } = req.params;

        const leaderboard = await buildLeaderboard(competitionId);

        if (leaderboard === null) {
            return res.status(404).json({
                message: "Competition not found.",
            });
        }

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
    buildLeaderboard,
    getLeaderboard,
    getScoreboardFreezeState

};