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
    competition_id      INTEGER NOT NULL,
    difficulty          VARCHAR(10) NOT NULL
                        CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    duration            INTERVAL NOT NULL DEFAULT INTERVAL '1 second',
    language            VARCHAR(20) NOT NULL,
    points_assigned     DOUBLE PRECISION NOT NULL CHECK (points_assigned >= 0),

    CONSTRAINT fk_problems_competition
        FOREIGN KEY (competition_id)
        REFERENCES competitions (competition_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT uq_problem_name_per_competition
        UNIQUE (competition_id, problem_name),

    CONSTRAINT chk_problem_duration
        CHECK (duration > INTERVAL '0 seconds')
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
    submission_id       INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    team_id             INTEGER NOT NULL,
    problem_id          INTEGER NOT NULL,
    status              VARCHAR(20) NOT NULL
                        CHECK (
                            status IN (
                                'Pending',
                                'Accepted',
                                'Wrong Answer',
                                'Time Limit',
                                'Runtime Error',
                                'Compile Error'
                            )
                        ),
    execution_time      INTERVAL,
    submitted_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    language            VARCHAR(20) NOT NULL,
    source_code         TEXT NOT NULL,

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
        CHECK (execution_time IS NULL OR execution_time >= INTERVAL '0 seconds')
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


-- =========================================================
-- GDG Programming Contest Platform
-- Sample Data
-- Run schema.sql first.
-- =========================================================

BEGIN;

-- =========================================================
-- Competitions
-- =========================================================
INSERT INTO competitions
    (competition_name, description, difficulty, status, max_teams, started_at, ended_at)
VALUES
    (
        'GDG Coding Challenge 2026',
        'A university programming contest covering problem solving, algorithms, and data structures.',
        'Mixed',
        'Active',
        20,
        '2026-07-21 18:00:00',
        '2026-07-21 21:00:00'
    ),
    (
        'Backend Sprint Contest',
        'A smaller contest focused on backend logic and SQL.',
        'Medium',
        'Upcoming',
        10,
        '2026-08-01 17:00:00',
        '2026-08-01 19:00:00'
    );

-- =========================================================
-- Teams
-- =========================================================
INSERT INTO teams (team_name, competition_id)
VALUES
    ('Byte Force', 1),
    ('Code Falcons', 1),
    ('Null Pointers', 1),
    ('API Masters', 2);

-- =========================================================
-- Users
-- Sample access codes are plain text only for demonstration.
-- In the real backend, store password/access-code hashes.
-- =========================================================
INSERT INTO users (user_name, access_code, team_id, role)
VALUES
    ('admin_gdg', '$2b$12$sampleAdminHash', NULL, 'Admin'),
    ('abdullah',  '$2b$12$sampleTeam1Hash', 1, 'Participant'),
    ('shahad',    '$2b$12$sampleTeam2Hash', 2, 'Participant'),
    ('abdulrahman','$2b$12$sampleTeam3Hash', 3, 'Participant'),
    ('backend_api','$2b$12$sampleTeam4Hash', 4, 'Participant');

-- =========================================================
-- Problems
-- =========================================================
INSERT INTO problems
    (problem_name, description, competition_id, difficulty, duration, language, points_assigned)
VALUES
    (
        'Two Sum',
        'Given two integers, print their sum.',
        1,
        'Easy',
        INTERVAL '1 second',
        'Any',
        100
    ),
    (
        'Palindrome Check',
        'Given a string, print YES if it is a palindrome; otherwise print NO.',
        1,
        'Easy',
        INTERVAL '1 second',
        'Any',
        150
    ),
    (
        'Shortest Path',
        'Find the shortest distance from node 1 to node N in a weighted graph.',
        1,
        'Hard',
        INTERVAL '2 seconds',
        'Any',
        500
    ),
    (
        'SQL Team Count',
        'Return the number of teams registered in a competition.',
        2,
        'Medium',
        INTERVAL '2 seconds',
        'SQL',
        250
    );

-- =========================================================
-- Test Cases
-- =========================================================
INSERT INTO test_cases
    (problem_id, test_id, input_data, expected_output, is_hidden)
VALUES
    (1, 1, '2 3', '5', FALSE),
    (1, 2, '-10 4', '-6', TRUE),
    (1, 3, '100000 250000', '350000', TRUE),

    (2, 1, 'level', 'YES', FALSE),
    (2, 2, 'hello', 'NO', FALSE),
    (2, 3, 'racecar', 'YES', TRUE),

    (3, 1,
     E'4 4\n1 2 5\n2 4 3\n1 3 2\n3 4 10',
     '8',
     FALSE),
    (3, 2,
     E'5 6\n1 2 2\n2 5 4\n1 3 1\n3 4 1\n4 5 1\n2 3 2',
     '3',
     TRUE),

    (4, 1, 'competition_id = 1', '3', FALSE),
    (4, 2, 'competition_id = 2', '1', TRUE);

-- =========================================================
-- Submissions
-- =========================================================

INSERT INTO submissions
    (
        team_id,
        problem_id,
        status,
        execution_time,
        submitted_at,
        language,
        source_code
    )
VALUES
    (
        1,
        1,
        'Accepted',
        INTERVAL '0.021 seconds',
        '2026-07-21 18:15:00+03',
        'Python',
        $$a, b = map(int, input().split())
print(a + b)$$
    ),

    (
        1,
        2,
        'Accepted',
        INTERVAL '0.030 seconds',
        '2026-07-21 18:27:00+03',
        'Java',
        $$import java.util.*;

class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();

        System.out.println(
            s.equals(new StringBuilder(s).reverse().toString())
            ? "YES"
            : "NO"
        );
    }
}$$
    ),

    (
        2,
        1,
        'Wrong Answer',
        INTERVAL '0.018 seconds',
        '2026-07-21 18:20:00+03',
        'C++',
        $$#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a - b;
}$$
    ),

    (
        2,
        1,
        'Accepted',
        INTERVAL '0.012 seconds',
        '2026-07-21 18:24:00+03',
        'C++',
        $$#include <iostream>
using namespace std;

int main() {
    long long a, b;
    cin >> a >> b;
    cout << a + b;
}$$
    ),

    (
        3,
        3,
        'Time Limit',
        INTERVAL '2.001 seconds',
        '2026-07-21 19:05:00+03',
        'Python',
        $$# Initial brute-force attempt
print("TLE")$$
    ),

    (
        4,
        4,
        'Pending',
        NULL,
        '2026-08-01 17:10:00+03',
        'SQL',
        $$SELECT COUNT(*)
FROM teams
WHERE competition_id = 1;$$
    );

-- =========================================================
-- Leaderboard
-- Normally your backend updates this table after judging.
-- =========================================================
INSERT INTO leaderboard
    (team_id, competition_id, solved_questions, points)
VALUES
    (1, 1, 2, 250),
    (2, 1, 1, 100),
    (3, 1, 0, 0),
    (4, 2, 0, 0);

COMMIT;
