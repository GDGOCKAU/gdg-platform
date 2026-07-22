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
    competition_id      INTEGER NOT NULL,

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
    user_name           VARCHAR(50) NOT NULL,
    access_code         VARCHAR(255) NOT NULL,
    team_id             INTEGER,
    role                VARCHAR(15) NOT NULL DEFAULT 'Participant'
                        CHECK (role IN ('Admin', 'Participant')),

    CONSTRAINT fk_users_team
        FOREIGN KEY (team_id)
        REFERENCES teams (team_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT uq_user_name
        UNIQUE (user_name),

    CONSTRAINT chk_admin_team
        CHECK (
            (role = 'Admin' AND team_id IS NULL)
            OR
            (role = 'Participant' AND team_id IS NOT NULL)
        )
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
CREATE TABLE submissions (
    submission_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    team_id INTEGER NOT NULL,
    problem_id INTEGER NOT NULL,

    status VARCHAR(30) NOT NULL
    CHECK (
        status IN (
            'Pending',
            'Processing',
            'Accepted',
            'Wrong Answer',
            'Time Limit',
            'Runtime Error',
            'Compile Error',
            'Internal Error'
        )
    ),

    language VARCHAR(50) NOT NULL,
    source_code TEXT NOT NULL,

    judge0_token VARCHAR(255),

    execution_time INTERVAL,

    memory_used_kb INTEGER
    CHECK (
        memory_used_kb IS NULL
        OR memory_used_kb >= 0
    ),

    submitted_at TIMESTAMP WITH TIME ZONE
    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_submissions_team
        FOREIGN KEY (team_id)
        REFERENCES teams (team_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_submissions_problem
        FOREIGN KEY (problem_id)
        REFERENCES problems (problem_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT chk_execution_time
        CHECK (
            execution_time IS NULL
            OR execution_time >= INTERVAL '0 seconds'
        )
);

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
