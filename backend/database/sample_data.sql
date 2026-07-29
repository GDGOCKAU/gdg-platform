
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
INSERT INTO teams
(
    team_name,
    access_code,
    competition_id,
    theme,
    last_seen_at
)
VALUES
(
    'Byte Force',
    '111111',
    1,
    'Dark',
    CURRENT_TIMESTAMP
),
(
    'Code Falcons',
    '222222',
    1,
    'Dark',
    CURRENT_TIMESTAMP - INTERVAL '2 minutes'
),
(
    'Null Pointers',
    '333333',
    1,
    'Dark',
    CURRENT_TIMESTAMP - INTERVAL '5 minutes'
),
(
    'API Masters',
    '444444',
    2,
    'Dark',
    CURRENT_TIMESTAMP - INTERVAL '25 minutes'
),
(
    'test',
    '1234',
    1,
    'Dark',
    CURRENT_TIMESTAMP - INTERVAL '1 minute'
);

-- =========================================================
-- Users
-- Admin accounts only.
-- Access codes are plain text temporarily for development.
-- In production, store hashed access codes.
-- =========================================================
INSERT INTO users (user_name, password, role, theme)
VALUES
    ('admin', '$2b$12$jlo/11rVY7K7vrAHFfl0c.UML.umakErP/d0f7wmQGV2OGP89l7Yy', 'Admin', 'Dark');

-- =========================================================
-- Problems
-- =========================================================
INSERT INTO problems
(
    problem_code,
    problem_name,
    description,
    input_format,
    output_format,
    memory_limit_mb,
    competition_id,
    difficulty,
    time_limit,
    constraints,
    language,
    points_assigned
)
VALUES
(
    'A',
    'Two Sum',
    'Given two integers, print their sum.',
    'The input contains two integers A and B.',
    'Print a single integer representing A + B.',
    256,
    1,
    'Easy',
    1000,
    '1 ≤ A, B ≤ 10^9',
    'Any',
    100
),
(
    'B',
    'Palindrome Check',
    'Given a string, print YES if it is a palindrome; otherwise print NO.',
    'A single string S.',
    'Print YES if S is a palindrome, otherwise print NO.',
    256,
    1,
    'Easy',
    1000,
    '1 ≤ |S| ≤ 10^5',
    'Any',
    150
),
(
    'C',
    'Shortest Path',
    'Find the shortest distance from node 1 to node N in a weighted graph.',
    'The first line contains N and M followed by M weighted edges.',
    'Print the shortest distance from node 1 to node N.',
    512,
    1,
    'Hard',
    2000,
    '1 ≤ N ≤ 10^5
1 ≤ M ≤ 2×10^5
1 ≤ edge weight ≤ 10^9',
    'Any',
    500
),
(
    'A',
    'SQL Team Count',
    'Return the number of teams registered in a competition.',
    'No input.',
    'Return a single row containing the total number of teams.',
    256,
    2,
    'Medium',
    2000,
    'At least one team may exist.',
    'SQL',
    250
);

-- =========================================================
-- Test Cases
-- =========================================================

INSERT INTO test_cases
    (
        problem_id,
        test_id,
        input_data,
        expected_output,
        is_hidden
    )
VALUES
    (1, 1, '2 3', '5', FALSE),
    (1, 2, '-10 4', '-6', TRUE),
    (1, 3, '100000 250000', '350000', TRUE),

    (2, 1, 'level', 'YES', FALSE),
    (2, 2, 'hello', 'NO', FALSE),
    (2, 3, 'racecar', 'YES', TRUE),

    (
        3,
        1,
        E'4 4\n1 2 5\n2 4 3\n1 3 2\n3 4 10',
        '8',
        FALSE
    ),
    (
        3,
        2,
        E'5 6\n1 2 2\n2 5 4\n1 3 1\n3 4 1\n4 5 1\n2 3 2',
        '3',
        TRUE
    ),

    (4, 1, 'competition_id = 1', '3', FALSE),
    (4, 2, 'competition_id = 2', '1', TRUE);

-- =========================================================
-- Submissions
--
-- Example Judge0 language IDs:
-- 54 = C++ (GCC)
-- 62 = Java
-- 71 = Python
-- 82 = SQL (SQLite)
--
-- Verify IDs against the actual Judge0 host before production.
-- =========================================================

INSERT INTO submissions
    (
        team_id,
        problem_id,
        status,
        language_id,
        language_name,
        source_code,
        passed_testcases,
        total_testcases,
        score,
        max_execution_time_ms,
        max_memory_used_kb,
        error_message,
        submitted_at,
        judging_started_at,
        judged_at
    )
VALUES
    (
        1,
        1,
        'Accepted',
        71,
        'Python 3',
        $$a, b = map(int, input().split())
print(a + b)$$,
        3,
        3,
        100.00,
        21.000,
        3400,
        NULL,
        '2026-07-21 18:15:00+03',
        '2026-07-21 18:15:01+03',
        '2026-07-21 18:15:03+03'
    ),

    (
        1,
        2,
        'Accepted',
        62,
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
}$$,
        3,
        3,
        150.00,
        30.000,
        15200,
        NULL,
        '2026-07-21 18:27:00+03',
        '2026-07-21 18:27:01+03',
        '2026-07-21 18:27:04+03'
    ),

    (
        2,
        1,
        'Wrong Answer',
        54,
        'C++',
        $$#include <iostream>
using namespace std;

int main() {
    long long a, b;
    cin >> a >> b;
    cout << a - b;
}$$,
        0,
        3,
        0.00,
        18.000,
        3200,
        'Output did not match the expected result.',
        '2026-07-21 18:20:00+03',
        '2026-07-21 18:20:01+03',
        '2026-07-21 18:20:02+03'
    ),

    (
        2,
        1,
        'Accepted',
        54,
        'C++',
        $$#include <iostream>
using namespace std;

int main() {
    long long a, b;
    cin >> a >> b;
    cout << a + b;
}$$,
        3,
        3,
        100.00,
        12.000,
        3100,
        NULL,
        '2026-07-21 18:24:00+03',
        '2026-07-21 18:24:01+03',
        '2026-07-21 18:24:03+03'
    ),

    (
        3,
        3,
        'Time Limit Exceeded',
        71,
        'Python 3',
        $$while True:
    pass$$,
        0,
        2,
        0.00,
        2001.000,
        3500,
        'Execution exceeded the problem time limit.',
        '2026-07-21 19:05:00+03',
        '2026-07-21 19:05:01+03',
        '2026-07-21 19:05:04+03'
    ),

    (
        4,
        4,
        'Queued',
        82,
        'SQL (SQLite)',
        $$SELECT COUNT(*)
FROM teams
WHERE competition_id = 1;$$,
        0,
        2,
        0.00,
        NULL,
        NULL,
        NULL,
        '2026-08-01 17:10:00+03',
        NULL,
        NULL
    );

-- =========================================================
-- Submission Test Results
-- =========================================================

INSERT INTO submission_test_results
    (
        submission_id,
        problem_id,
        test_id,
        status,
        judge0_token,
        judge0_status_id,
        judge0_status_description,
        execution_time_ms,
        memory_used_kb,
        stdout,
        stderr,
        compile_output,
        judge_message,
        created_at,
        processing_started_at,
        completed_at
    )
VALUES
    -- -----------------------------------------------------
    -- Submission 1: Python solution, Problem 1, Accepted
    -- -----------------------------------------------------
    (
        1, 1, 1,
        'Accepted',
        'sample-token-submission-1-test-1',
        3,
        'Accepted',
        15.000,
        3300,
        '5',
        NULL,
        NULL,
        NULL,
        '2026-07-21 18:15:01+03',
        '2026-07-21 18:15:01+03',
        '2026-07-21 18:15:02+03'
    ),
    (
        1, 1, 2,
        'Accepted',
        'sample-token-submission-1-test-2',
        3,
        'Accepted',
        18.000,
        3350,
        '-6',
        NULL,
        NULL,
        NULL,
        '2026-07-21 18:15:01+03',
        '2026-07-21 18:15:01+03',
        '2026-07-21 18:15:02+03'
    ),
    (
        1, 1, 3,
        'Accepted',
        'sample-token-submission-1-test-3',
        3,
        'Accepted',
        21.000,
        3400,
        '350000',
        NULL,
        NULL,
        NULL,
        '2026-07-21 18:15:01+03',
        '2026-07-21 18:15:02+03',
        '2026-07-21 18:15:03+03'
    ),

    -- -----------------------------------------------------
    -- Submission 2: Java solution, Problem 2, Accepted
    -- -----------------------------------------------------
    (
        2, 2, 1,
        'Accepted',
        'sample-token-submission-2-test-1',
        3,
        'Accepted',
        27.000,
        15000,
        'YES',
        NULL,
        NULL,
        NULL,
        '2026-07-21 18:27:01+03',
        '2026-07-21 18:27:01+03',
        '2026-07-21 18:27:03+03'
    ),
    (
        2, 2, 2,
        'Accepted',
        'sample-token-submission-2-test-2',
        3,
        'Accepted',
        30.000,
        15200,
        'NO',
        NULL,
        NULL,
        NULL,
        '2026-07-21 18:27:01+03',
        '2026-07-21 18:27:02+03',
        '2026-07-21 18:27:03+03'
    ),
    (
        2, 2, 3,
        'Accepted',
        'sample-token-submission-2-test-3',
        3,
        'Accepted',
        29.000,
        15100,
        'YES',
        NULL,
        NULL,
        NULL,
        '2026-07-21 18:27:01+03',
        '2026-07-21 18:27:02+03',
        '2026-07-21 18:27:04+03'
    ),

    -- -----------------------------------------------------
    -- Submission 3: Wrong Answer on first testcase
    -- Remaining testcases were skipped
    -- -----------------------------------------------------
    (
        3, 1, 1,
        'Wrong Answer',
        'sample-token-submission-3-test-1',
        3,
        'Accepted',
        18.000,
        3200,
        '-1',
        NULL,
        NULL,
        'Program executed successfully, but output was incorrect.',
        '2026-07-21 18:20:01+03',
        '2026-07-21 18:20:01+03',
        '2026-07-21 18:20:02+03'
    ),
    (
        3, 1, 2,
        'Skipped',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        'Skipped after a previous testcase failed.',
        '2026-07-21 18:20:02+03',
        NULL,
        NULL
    ),
    (
        3, 1, 3,
        'Skipped',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        'Skipped after a previous testcase failed.',
        '2026-07-21 18:20:02+03',
        NULL,
        NULL
    ),

    -- -----------------------------------------------------
    -- Submission 4: Corrected C++ solution, Accepted
    -- -----------------------------------------------------
    (
        4, 1, 1,
        'Accepted',
        'sample-token-submission-4-test-1',
        3,
        'Accepted',
        10.000,
        3000,
        '5',
        NULL,
        NULL,
        NULL,
        '2026-07-21 18:24:01+03',
        '2026-07-21 18:24:01+03',
        '2026-07-21 18:24:02+03'
    ),
    (
        4, 1, 2,
        'Accepted',
        'sample-token-submission-4-test-2',
        3,
        'Accepted',
        11.000,
        3050,
        '-6',
        NULL,
        NULL,
        NULL,
        '2026-07-21 18:24:01+03',
        '2026-07-21 18:24:01+03',
        '2026-07-21 18:24:02+03'
    ),
    (
        4, 1, 3,
        'Accepted',
        'sample-token-submission-4-test-3',
        3,
        'Accepted',
        12.000,
        3100,
        '350000',
        NULL,
        NULL,
        NULL,
        '2026-07-21 18:24:01+03',
        '2026-07-21 18:24:02+03',
        '2026-07-21 18:24:03+03'
    ),

    -- -----------------------------------------------------
    -- Submission 5: Time limit on first testcase
    -- -----------------------------------------------------
    (
        5, 3, 1,
        'Time Limit Exceeded',
        'sample-token-submission-5-test-1',
        5,
        'Time Limit Exceeded',
        2001.000,
        3500,
        NULL,
        NULL,
        NULL,
        'Execution exceeded the configured CPU time limit.',
        '2026-07-21 19:05:01+03',
        '2026-07-21 19:05:01+03',
        '2026-07-21 19:05:04+03'
    ),
    (
        5, 3, 2,
        'Skipped',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        'Skipped after a previous testcase failed.',
        '2026-07-21 19:05:04+03',
        NULL,
        NULL
    ),

    -- -----------------------------------------------------
    -- Submission 6: Still waiting to be processed
    -- -----------------------------------------------------
    (
        6, 4, 1,
        'Queued',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        '2026-08-01 17:10:00+03',
        NULL,
        NULL
    ),
    (
        6, 4, 2,
        'Queued',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        '2026-08-01 17:10:00+03',
        NULL,
        NULL
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

-- =========================================================
-- announcements
-- =========================================================

INSERT INTO announcements
(
    competition_id,
    created_by,
    title,
    message
)
VALUES
(
    1,
    1,
    'Welcome Contestants',
    'Welcome to the GDG Programming Competition. We wish everyone the best of luck!'
),
(
    1,
    1,
    'Clarification for Problem B',
    'The sample explanation has been updated. The input and output format remain unchanged.'
),
(
    1,
    1,
    'Submission Reminder',
    'Remember that only the latest accepted submission will be counted before the contest ends.'
),
(
    2,
    1,
    'SQL Contest Started',
    'The SQL competition is now live. You may begin solving the problems.'
);