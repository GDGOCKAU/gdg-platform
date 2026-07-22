
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
(
    problem_name,
    description,
    input_format,
    output_format,
    memory_limit_mb,
    competition_id,
    difficulty,
    duration,
    language,
    points_assigned
)
VALUES
(
    'Two Sum',
    'Given two integers, print their sum.',
    'The input contains two integers A and B.',
    'Print a single integer representing A + B.',
    256,
    1,
    'Easy',
    INTERVAL '1 second',
    'Any',
    100
),
(
    'Palindrome Check',
    'Given a string, print YES if it is a palindrome; otherwise print NO.',
    'A single string S.',
    'Print YES if S is a palindrome, otherwise print NO.',
    256,
    1,
    'Easy',
    INTERVAL '1 second',
    'Any',
    150
),
(
    'Shortest Path',
    'Find the shortest distance from node 1 to node N in a weighted graph.',
    'The first line contains N and M, followed by M weighted edges.',
    'Print the shortest distance from node 1 to node N.',
    512,
    1,
    'Hard',
    INTERVAL '2 seconds',
    'Any',
    500
),
(
    'SQL Team Count',
    'Return the number of teams registered in a competition.',
    'No input.',
    'Return a single row containing the total number of teams.',
    256,
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
