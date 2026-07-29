-- =========================================================
-- GDG Programming Contest Platform
-- PostgreSQL Database Schema
-- =========================================================

BEGIN;

-- Remove old tables in dependency order.
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS test_cases CASCADE;
DROP TABLE IF EXISTS leaderboard CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS problems CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS competitions CASCADE;
DROP TABLE IF EXISTS submission_test_results CASCADE;
DROP TYPE IF EXISTS submission_status CASCADE;
DROP TYPE IF EXISTS test_result_status CASCADE;



-- =========================================================
-- 1. Competitions
-- =========================================================
CREATE TABLE competitions (
    competition_id      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    competition_name    VARCHAR(100) NOT NULL UNIQUE,
    description         TEXT,
    difficulty          VARCHAR(10) NOT NULL
                        CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'Mixed')),
    status              VARCHAR(15) NOT NULL DEFAULT 'Upcoming'
                        CHECK (status IN ('Upcoming', 'Active', 'Frozen', 'Finished', 'Cancelled')),
    max_teams           INTEGER NOT NULL CHECK (max_teams > 0),
    started_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    ended_at            TIMESTAMP WITHOUT TIME ZONE NOT NULL,

    CONSTRAINT chk_competition_dates
        CHECK (ended_at > started_at)
);

-- =========================================================
-- 2. Teams
-- Each team belongs to one competition.
-- =========================================================
CREATE TABLE teams (
    team_id             INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    team_name           VARCHAR(50) NOT NULL,
    access_code         VARCHAR(255) NOT NULL,
    competition_id      INTEGER NOT NULL,
    theme               VARCHAR(10) NOT NULL DEFAULT 'Light'
                        CHECK (theme IN ('Light', 'Dark')),

    CONSTRAINT fk_teams_competition
        FOREIGN KEY (competition_id)
        REFERENCES competitions (competition_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT uq_team_name_per_competition
        UNIQUE (competition_id, team_name)
);

-- =========================================================
-- 3. Users
-- "users" is used instead of "user" because USER is a
-- PostgreSQL keyword.
-- =========================================================
CREATE TABLE users (
    user_id             INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_name           VARCHAR(50) NOT NULL UNIQUE,
    password         VARCHAR(255) NOT NULL,
    role                VARCHAR(15) NOT NULL DEFAULT 'Admin'
                        CHECK (role = 'Admin'),
    theme               VARCHAR(10) NOT NULL DEFAULT 'Light'
                        CHECK (theme IN ('Light', 'Dark'))
);

-- =========================================================
-- 4. Problems
-- =========================================================
CREATE TABLE problems (
    problem_id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    problem_name        VARCHAR(100) NOT NULL,
    description         TEXT NOT NULL,
    input_format        TEXT NOT NULL,
    output_format       TEXT NOT NULL,
    memory_limit_mb     INTEGER NOT NULL DEFAULT 256,

    competition_id      INTEGER NOT NULL,

    difficulty          VARCHAR(10) NOT NULL
                        CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),

    time_limit          INTEGER NOT NULL DEFAULT 1000,

    constraints         TEXT,

    language            VARCHAR(20) NOT NULL,

    points_assigned     DOUBLE PRECISION NOT NULL
                        CHECK (points_assigned >= 0),

    CONSTRAINT fk_problems_competition
        FOREIGN KEY (competition_id)
        REFERENCES competitions (competition_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT uq_problem_name_per_competition
        UNIQUE (competition_id, problem_name),

    CONSTRAINT chk_problem_time_limit
        CHECK (time_limit > 0),

    CONSTRAINT chk_memory_limit_mb
        CHECK (memory_limit_mb > 0)
);

-- =========================================================
-- 5. Test Cases
-- Composite primary key: one problem can have many tests.
-- =========================================================
CREATE TABLE test_cases (
    problem_id          INTEGER NOT NULL,
    test_id             INTEGER NOT NULL CHECK (test_id > 0),
    input_data          TEXT NOT NULL,
    expected_output     TEXT NOT NULL,
    is_hidden           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_test_cases
        PRIMARY KEY (problem_id, test_id),

    CONSTRAINT fk_test_cases_problem
        FOREIGN KEY (problem_id)
        REFERENCES problems (problem_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- =========================================================
-- 6. Submissions
-- =========================================================
CREATE TYPE submission_status AS ENUM (
    'Queued',
    'Judging',
    'Accepted',
    'Wrong Answer',
    'Time Limit Exceeded',
    'Runtime Error',
    'Compilation Error',
    'Internal Error',
    'Cancelled'
);

CREATE TYPE test_result_status AS ENUM (
    'Queued',
    'Processing',
    'Accepted',
    'Wrong Answer',
    'Time Limit Exceeded',
    'Runtime Error',
    'Compilation Error',
    'Internal Error',
    'Skipped'
);

CREATE TABLE submissions (
    submission_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    team_id INTEGER NOT NULL,
    problem_id INTEGER NOT NULL,

    status submission_status NOT NULL DEFAULT 'Queued',

    -- Judge0 language identifier, such as 62, 63, 71, etc.
    language_id INTEGER NOT NULL,

    -- Snapshot of the language name at submission time.
    language_name VARCHAR(100) NOT NULL,

    source_code TEXT NOT NULL,

    -- Prevents accidental duplicate submissions caused by retries
    -- or double-clicking the Submit button.
    idempotency_key UUID UNIQUE,

    passed_testcases INTEGER NOT NULL DEFAULT 0
    CHECK (passed_testcases >= 0),

    total_testcases INTEGER NOT NULL DEFAULT 0
    CHECK (total_testcases >= 0),

    score NUMERIC(10, 2) NOT NULL DEFAULT 0
    CHECK (score >= 0),

    -- Longest execution time among all test cases.
    max_execution_time_ms NUMERIC(12, 3)
    CHECK (
        max_execution_time_ms IS NULL
        OR max_execution_time_ms >= 0
    ),

    -- Highest memory usage among all test cases.
    max_memory_used_kb INTEGER
    CHECK (
        max_memory_used_kb IS NULL
        OR max_memory_used_kb >= 0
    ),

    -- General error visible to the team, such as a compilation error.
    error_message TEXT,

    submitted_at TIMESTAMP WITH TIME ZONE
    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    judging_started_at TIMESTAMP WITH TIME ZONE,

    judged_at TIMESTAMP WITH TIME ZONE,

    updated_at TIMESTAMP WITH TIME ZONE
    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_submissions_team
        FOREIGN KEY (team_id)
        REFERENCES teams (team_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_submissions_problem
        FOREIGN KEY (problem_id)
        REFERENCES problems (problem_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_submission_testcase_counts
        CHECK (passed_testcases <= total_testcases),

    CONSTRAINT chk_submission_judging_times
        CHECK (
            judging_started_at IS NULL
            OR judging_started_at >= submitted_at
        ),

    CONSTRAINT chk_submission_judged_at
        CHECK (
            judged_at IS NULL
            OR judged_at >= submitted_at
        ),

    CONSTRAINT uq_submission_problem
        UNIQUE (submission_id, problem_id)
);

CREATE TABLE submission_test_results (
    result_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    submission_id BIGINT NOT NULL,
    problem_id INTEGER NOT NULL,
    test_id INTEGER NOT NULL,

    status test_result_status NOT NULL DEFAULT 'Queued',

    judge0_token VARCHAR(255) UNIQUE,

    -- Original Judge0 status for debugging and provider tracking.
    judge0_status_id INTEGER,
    judge0_status_description VARCHAR(100),

    execution_time_ms NUMERIC(12, 3)
    CHECK (
        execution_time_ms IS NULL
        OR execution_time_ms >= 0
    ),

    memory_used_kb INTEGER
    CHECK (
        memory_used_kb IS NULL
        OR memory_used_kb >= 0
    ),

    -- Actual program output.
    stdout TEXT,

    -- Runtime error output.
    stderr TEXT,

    -- Compiler output for compilation failures.
    compile_output TEXT,

    -- Additional Judge0 system message.
    judge_message TEXT,

    created_at TIMESTAMP WITH TIME ZONE
    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    processing_started_at TIMESTAMP WITH TIME ZONE,

    completed_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT fk_test_result_submission
        FOREIGN KEY (submission_id, problem_id)
        REFERENCES submissions (submission_id, problem_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_test_result_testcase
        FOREIGN KEY (problem_id, test_id)
        REFERENCES test_cases (problem_id, test_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT uq_submission_testcase
        UNIQUE (submission_id, test_id),

    CONSTRAINT chk_test_result_started_at
        CHECK (
            processing_started_at IS NULL
            OR processing_started_at >= created_at
        ),

    CONSTRAINT chk_test_result_completed_at
        CHECK (
            completed_at IS NULL
            OR completed_at >= created_at
        )
);

CREATE INDEX idx_submissions_team_submitted_at
ON submissions (team_id, submitted_at DESC);

CREATE INDEX idx_submissions_problem_submitted_at
ON submissions (problem_id, submitted_at DESC);

CREATE INDEX idx_submissions_status
ON submissions (status)
WHERE status IN ('Queued', 'Judging');

CREATE INDEX idx_submissions_team_problem_status
ON submissions (team_id, problem_id, status);

CREATE INDEX idx_submission_test_results_submission
ON submission_test_results (submission_id, test_id);

CREATE INDEX idx_submission_test_results_pending
ON submission_test_results (status)
WHERE status IN ('Queued', 'Processing');

CREATE INDEX idx_submission_test_results_judge0_token
ON submission_test_results (judge0_token)
WHERE judge0_token IS NOT NULL;



CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_submissions_updated_at
BEFORE UPDATE ON submissions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =========================================================
-- 7. Leaderboard
-- One leaderboard row for each team in each competition.
-- =========================================================
CREATE TABLE leaderboard (
    leaderboard_id      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    team_id             INTEGER NOT NULL,
    competition_id      INTEGER NOT NULL,
    solved_questions    INTEGER NOT NULL DEFAULT 0 CHECK (solved_questions >= 0),
    points              DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (points >= 0),

    CONSTRAINT fk_leaderboard_team
        FOREIGN KEY (team_id)
        REFERENCES teams (team_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_leaderboard_competition
        FOREIGN KEY (competition_id)
        REFERENCES competitions (competition_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT uq_leaderboard_team_competition
        UNIQUE (team_id, competition_id)
);

-- =========================================================
-- Useful indexes
-- =========================================================
CREATE INDEX idx_teams_competition_id
    ON teams (competition_id);

CREATE INDEX idx_problems_competition_id
    ON problems (competition_id);

CREATE INDEX idx_submissions_team_id
    ON submissions (team_id);

CREATE INDEX idx_submissions_problem_id
    ON submissions (problem_id);

CREATE INDEX idx_submissions_submitted_at
    ON submissions (submitted_at DESC);

CREATE INDEX idx_leaderboard_ranking
    ON leaderboard (competition_id, points DESC, solved_questions DESC);

COMMIT;
