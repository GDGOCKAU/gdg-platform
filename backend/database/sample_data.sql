
-- =========================================================
-- GDG Programming Contest Platform
-- Sample Data
-- Run schema.sql first.
--
-- Coverage notes (why the data looks the way it does):
--   * competitions.status: covers all 5 CHECK values (Upcoming, Active,
--     Frozen, Finished, Cancelled). NOTE: adminContestController only
--     allows ONE competition to be Upcoming/Active/Frozen at a time.
--     Having 3 of them here is intentional -- it lets you verify that
--     "Create Competition" / PATCH status correctly returns 409
--     "Another unfinished competition already exists" until the extras
--     are resolved to Finished/Cancelled.
--   * submissions.status: all 9 enum values are represented at least once
--     (Queued, Judging, Accepted, Wrong Answer, Time Limit Exceeded,
--     Runtime Error, Compilation Error, Internal Error, Cancelled).
--   * submission_test_results.status: all 9 enum values are represented,
--     including 'Skipped' -- note the current judgeWorker.js never
--     produces 'Skipped' itself (it judges every test case via Judge0's
--     batch endpoint), so these rows model a "stop after first failure"
--     UX for admin-side testing even though the worker doesn't do that
--     today.
--   * teams: a spread of last_seen_at values across every getTeamStatus
--     bucket (Active <=10min, Inactive >10min, Pending = never logged in)
--     plus one team per competition with zero submissions, to exercise
--     empty states.
--   * problems: at least one is_published = FALSE ("draft") problem per
--     competition family that has any, to test the admin problem
--     creator/editor publish toggle.
--   * leaderboard: matches the Accepted submissions below exactly
--     (points = SUM(points_assigned) for Accepted, solved_questions =
--     COUNT(Accepted)); competition 3 has a genuine points tie to
--     exercise RANK() tie handling.
--   * Timestamps are all CURRENT_TIMESTAMP +/- INTERVAL so the data is
--     always "fresh" relative to whenever this script is run instead of
--     going stale. Because the whole file runs in one transaction,
--     CURRENT_TIMESTAMP is stable across every statement here.
-- =========================================================

BEGIN;

-- =========================================================
-- Competitions
-- =========================================================
INSERT INTO competitions
    (competition_name, description, difficulty, status, max_teams, started_at, ended_at)
VALUES
    (
        -- Currently running "now" (started 2h ago, ends in 3h) so the
        -- full submit -> judge flow can actually be exercised through
        -- the UI without the "contest has not started/already ended"
        -- guard in submissionController rejecting it.
        'GDG Coding Challenge 2026',
        'A university programming contest covering problem solving, algorithms, and data structures.',
        'Mixed',
        'Active',
        20,
        (CURRENT_TIMESTAMP - INTERVAL '2 hours')::TIMESTAMP,
        (CURRENT_TIMESTAMP + INTERVAL '4 hours')::TIMESTAMP
    ),
    (
        'Backend Sprint Contest',
        'A smaller contest focused on backend logic and SQL.',
        'Medium',
        'Upcoming',
        10,
        (CURRENT_TIMESTAMP + INTERVAL '5 days')::TIMESTAMP,
        (CURRENT_TIMESTAMP + INTERVAL '5 days 2 hours')::TIMESTAMP
    ),
    (
        'Frozen Finals',
        'Regional final round; scoreboard frozen for the last hour.',
        'Hard',
        'Frozen',
        15,
        (CURRENT_TIMESTAMP - INTERVAL '1 day')::TIMESTAMP,
        (CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '3 hours')::TIMESTAMP
    ),
    (
        'Summer Kickoff 2026',
        'Warm-up contest held earlier in the summer.',
        'Easy',
        'Finished',
        8,
        (CURRENT_TIMESTAMP - INTERVAL '20 days')::TIMESTAMP,
        (CURRENT_TIMESTAMP - INTERVAL '20 days' + INTERVAL '3 hours')::TIMESTAMP
    ),
    (
        'Cancelled Regional Round',
        'Cancelled ahead of time due to a venue conflict.',
        'Medium',
        'Cancelled',
        12,
        (CURRENT_TIMESTAMP - INTERVAL '10 days')::TIMESTAMP,
        (CURRENT_TIMESTAMP - INTERVAL '10 days' + INTERVAL '2 hours')::TIMESTAMP
    );

-- =========================================================
-- Teams
-- =========================================================
INSERT INTO teams
    (team_name, access_code, competition_id, theme, last_seen_at)
VALUES
    -- Competition 1 (Active): full spread of Active / Inactive / Pending
    ('Byte Force',     '111111', 1, 'Dark',  CURRENT_TIMESTAMP),                             -- Active
    ('Code Falcons',   '222222', 1, 'Light', CURRENT_TIMESTAMP - INTERVAL '2 minutes'),       -- Active
    ('Null Pointers',  '333333', 1, 'Dark',  CURRENT_TIMESTAMP - INTERVAL '5 minutes'),       -- Active
    ('Stack Overflow', '555555', 1, 'Light', CURRENT_TIMESTAMP - INTERVAL '45 minutes'),      -- Inactive
    ('Kernel Panic',   '666666', 1, 'Dark',  NULL),                                           -- Pending, never logged in, zero submissions
    ('test',           '1234',   1, 'Dark',  CURRENT_TIMESTAMP - INTERVAL '1 minute'),        -- Active, convenient for manual login testing

    -- Competition 2 (Upcoming): nobody has logged in yet
    ('API Masters',    '444444', 2, 'Dark',  NULL),
    ('Query Wizards',  '777777', 2, 'Light', NULL),

    -- Competition 3 (Frozen): contest window already closed
    ('Frozen Flames',  '888888', 3, 'Dark',  CURRENT_TIMESTAMP - INTERVAL '23 hours'),
    ('Ice Breakers',   '999999', 3, 'Light', CURRENT_TIMESTAMP - INTERVAL '23 hours 30 minutes'),

    -- Competition 4 (Finished): long inactive
    ('Legacy Legends', '121212', 4, 'Dark',  CURRENT_TIMESTAMP - INTERVAL '20 days'),
    ('Old Timers',     '131313', 4, 'Light', CURRENT_TIMESTAMP - INTERVAL '20 days' + INTERVAL '10 minutes'),

    -- Competition 5 (Cancelled): registered, never got to log in
    ('Ghost Team',     '141414', 5, 'Dark',  NULL);

-- =========================================================
-- Users
-- Seeded separately by users_seed.sql (run for both `db:setup` and
-- `db:setup:schema` so a login always exists).
-- =========================================================

-- =========================================================
-- Problems
-- =========================================================
INSERT INTO problems
    (
        problem_code, problem_name, description, input_format, output_format,
        memory_limit_mb, competition_id, difficulty, time_limit, constraints,
        language, points_assigned, is_published
    )
VALUES
    -- Competition 1 (Active)
    (
        'A', 'Two Sum',
        'Given two integers, print their sum.',
        'The input contains two integers A and B.',
        'Print a single integer representing A + B.',
        256, 1, 'Easy', 1000, '1 ≤ A, B ≤ 10^9', 'Any', 100, TRUE
    ),
    (
        'B', 'Palindrome Check',
        'Given a string, print YES if it is a palindrome; otherwise print NO.',
        'A single string S.',
        'Print YES if S is a palindrome, otherwise print NO.',
        256, 1, 'Easy', 1000, '1 ≤ |S| ≤ 10^5', 'Any', 150, TRUE
    ),
    (
        'C', 'Shortest Path',
        'Find the shortest distance from node 1 to node N in a weighted graph.',
        'The first line contains N and M followed by M weighted edges.',
        'Print the shortest distance from node 1 to node N.',
        512, 1, 'Hard', 2000,
        E'1 ≤ N ≤ 10^5\n1 ≤ M ≤ 2×10^5\n1 ≤ edge weight ≤ 10^9',
        'Any', 500, TRUE
    ),
    (
        'D', 'Matrix Rotation',
        'Rotate an N x N matrix 90 degrees clockwise.',
        'The first line contains N, followed by N rows of N integers.',
        'Print the rotated matrix, one row per line.',
        256, 1, 'Medium', 1500, '1 ≤ N ≤ 500', 'Any', 300, FALSE
    ),

    -- Competition 2 (Upcoming)
    (
        'A', 'SQL Team Count',
        'Return the number of teams registered in a competition.',
        'No input.',
        'Return a single row containing the total number of teams.',
        256, 2, 'Medium', 2000, 'At least one team may exist.', 'SQL', 250, TRUE
    ),
    (
        'B', 'Average Score',
        'Return the average submission score for a competition.',
        'No input.',
        'Return a single row containing the average score, rounded to 1 decimal place.',
        256, 2, 'Medium', 2000, 'At least one submission may exist.', 'SQL', 200, FALSE
    ),

    -- Competition 3 (Frozen)
    (
        'A', 'Binary Search',
        'Find the index of a target value in a sorted array, or -1 if absent.',
        'The first line contains N, the second line N sorted integers, the third line the target.',
        'Print the 0-indexed position of the target, or -1 if not found.',
        256, 3, 'Medium', 1000, '1 ≤ N ≤ 10^5', 'Any', 200, TRUE
    ),
    (
        'B', 'Longest Common Subsequence',
        'Given two strings, print their longest common subsequence.',
        'Two lines, each containing a string.',
        'Print the longest common subsequence.',
        256, 3, 'Hard', 2000, '1 ≤ |S| ≤ 1000', 'Any', 400, TRUE
    ),

    -- Competition 4 (Finished)
    (
        'A', 'FizzBuzz',
        'Print numbers from 1 to N, replacing multiples of 3 with Fizz, 5 with Buzz, and 15 with FizzBuzz.',
        'A single integer N.',
        'Print N lines as described above.',
        256, 4, 'Easy', 1000, '1 ≤ N ≤ 10^4', 'Any', 100, TRUE
    ),
    (
        'B', 'Prime Sieve',
        'Print all prime numbers up to and including N.',
        'A single integer N.',
        'Print all primes up to N, space separated.',
        256, 4, 'Medium', 1000, '2 ≤ N ≤ 10^6', 'Any', 250, TRUE
    ),

    -- Competition 5 (Cancelled)
    (
        'A', 'Cancelled Problem Stub',
        'Placeholder problem drafted before the round was cancelled.',
        'A single integer N.',
        'Print N unchanged.',
        256, 5, 'Easy', 1000, '1 ≤ N ≤ 100', 'Any', 100, TRUE
    );

-- =========================================================
-- Test Cases
-- =========================================================
INSERT INTO test_cases
    (problem_id, test_id, input_data, expected_output, is_hidden)
VALUES
    -- Problem 1: Two Sum
    (1, 1, '2 3', '5', FALSE),
    (1, 2, '-10 4', '-6', TRUE),
    (1, 3, '100000 250000', '350000', TRUE),

    -- Problem 2: Palindrome Check
    (2, 1, 'level', 'YES', FALSE),
    (2, 2, 'hello', 'NO', FALSE),
    (2, 3, 'racecar', 'YES', TRUE),

    -- Problem 3: Shortest Path
    (3, 1, E'4 4\n1 2 5\n2 4 3\n1 3 2\n3 4 10', '8', FALSE),
    (3, 2, E'5 6\n1 2 2\n2 5 4\n1 3 1\n3 4 1\n4 5 1\n2 3 2', '3', TRUE),

    -- Problem 4: Matrix Rotation (draft, unpublished)
    (4, 1, E'2\n1 2\n3 4', E'3 1\n4 2', FALSE),
    (4, 2, E'3\n1 2 3\n4 5 6\n7 8 9', E'7 4 1\n8 5 2\n9 6 3', TRUE),

    -- Problem 5: SQL Team Count
    (5, 1, 'competition_id = 1', '6', FALSE),
    (5, 2, 'competition_id = 2', '2', TRUE),

    -- Problem 6: Average Score (draft, unpublished)
    (6, 1, 'competition_id = 1', '75.5', FALSE),
    (6, 2, 'competition_id = 2', '0.0', TRUE),

    -- Problem 7: Binary Search
    (7, 1, E'5\n1 3 5 7 9\n5', '2', FALSE),
    (7, 2, E'5\n1 3 5 7 9\n4', '-1', TRUE),

    -- Problem 8: Longest Common Subsequence
    (8, 1, E'ABCBDAB\nBDCABA', 'BCBA', FALSE),
    (8, 2, E'AGGTAB\nGXTXAYB', 'GTAB', TRUE),

    -- Problem 9: FizzBuzz
    (9, 1, '5', E'1\n2\nFizz\n4\nBuzz', FALSE),
    (9, 2, '15', E'1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz', TRUE),

    -- Problem 10: Prime Sieve
    (10, 1, '10', '2 3 5 7', FALSE),
    (10, 2, '20', '2 3 5 7 11 13 17 19', TRUE),

    -- Problem 11: Cancelled Problem Stub
    (11, 1, '1', '1', FALSE),
    (11, 2, '42', '42', TRUE);

-- =========================================================
-- Submissions
--
-- Example Judge0 language IDs:
-- 54 = C++ (GCC)
-- 62 = Java
-- 71 = Python
--
-- Verify IDs against the actual Judge0 host before production.
-- =========================================================
INSERT INTO submissions
    (
        team_id, problem_id, status, language_id, language_name, source_code,
        idempotency_key, passed_testcases, total_testcases, score,
        max_execution_time_ms, max_memory_used_kb, error_message,
        submitted_at, judging_started_at, judged_at
    )
VALUES
    -- 1: Byte Force / Two Sum -- Accepted
    (
        1, 1, 'Accepted', 71, 'Python 3',
        $$a, b = map(int, input().split())
print(a + b)$$,
        NULL, 3, 3, 100.00, 21.000, 3400, NULL,
        CURRENT_TIMESTAMP - INTERVAL '100 minutes',
        CURRENT_TIMESTAMP - INTERVAL '100 minutes' + INTERVAL '1 second',
        CURRENT_TIMESTAMP - INTERVAL '100 minutes' + INTERVAL '3 seconds'
    ),
    -- 2: Byte Force / Palindrome Check -- Accepted
    (
        1, 2, 'Accepted', 62, 'Java',
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
        NULL, 3, 3, 150.00, 30.000, 15200, NULL,
        CURRENT_TIMESTAMP - INTERVAL '95 minutes',
        CURRENT_TIMESTAMP - INTERVAL '95 minutes' + INTERVAL '1 second',
        CURRENT_TIMESTAMP - INTERVAL '95 minutes' + INTERVAL '4 seconds'
    ),
    -- 3: Code Falcons / Two Sum -- Wrong Answer (subtracts instead of adds)
    (
        2, 1, 'Wrong Answer', 54, 'C++',
        $$#include <iostream>
using namespace std;

int main() {
    long long a, b;
    cin >> a >> b;
    cout << a - b;
}$$,
        NULL, 0, 3, 0.00, 18.000, 3200, 'Output did not match the expected result.',
        CURRENT_TIMESTAMP - INTERVAL '92 minutes',
        CURRENT_TIMESTAMP - INTERVAL '92 minutes' + INTERVAL '1 second',
        CURRENT_TIMESTAMP - INTERVAL '92 minutes' + INTERVAL '2 seconds'
    ),
    -- 4: Code Falcons / Two Sum -- corrected, Accepted
    (
        2, 1, 'Accepted', 54, 'C++',
        $$#include <iostream>
using namespace std;

int main() {
    long long a, b;
    cin >> a >> b;
    cout << a + b;
}$$,
        'a1111111-1111-4111-8111-111111111111', 3, 3, 100.00, 12.000, 3100, NULL,
        CURRENT_TIMESTAMP - INTERVAL '85 minutes',
        CURRENT_TIMESTAMP - INTERVAL '85 minutes' + INTERVAL '1 second',
        CURRENT_TIMESTAMP - INTERVAL '85 minutes' + INTERVAL '3 seconds'
    ),
    -- 5: Null Pointers / Shortest Path -- Time Limit Exceeded
    (
        3, 3, 'Time Limit Exceeded', 71, 'Python 3',
        $$while True:
    pass$$,
        NULL, 0, 2, 0.00, 2001.000, 3500, 'Execution exceeded the problem time limit.',
        CURRENT_TIMESTAMP - INTERVAL '70 minutes',
        CURRENT_TIMESTAMP - INTERVAL '70 minutes' + INTERVAL '1 second',
        CURRENT_TIMESTAMP - INTERVAL '70 minutes' + INTERVAL '4 seconds'
    ),
    -- 6: Stack Overflow / Two Sum -- Compilation Error
    (
        4, 1, 'Compilation Error', 54, 'C++',
        $$#include <iostream>
using namespace std;

int main() {
    long long a, b
    cin >> a >> b;
    cout << a + b;
}$$,
        NULL, 0, 3, 0.00, NULL, NULL, E'main.cpp:6:16: error: expected \';\' before \'cin\'',
        CURRENT_TIMESTAMP - INTERVAL '60 minutes',
        CURRENT_TIMESTAMP - INTERVAL '60 minutes' + INTERVAL '1 second',
        CURRENT_TIMESTAMP - INTERVAL '60 minutes' + INTERVAL '2 seconds'
    ),
    -- 7: Stack Overflow / Palindrome Check -- Runtime Error (NullPointerException)
    (
        4, 2, 'Runtime Error', 62, 'Java',
        $$import java.util.*;

class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        String rev = null;

        System.out.println(s.equals(rev.toString()) ? "YES" : "NO");
    }
}$$,
        NULL, 1, 3, 0.00, 45.000, 16000, E'Exception in thread "main" java.lang.NullPointerException\n\tat Main.main(Main.java:9)',
        CURRENT_TIMESTAMP - INTERVAL '55 minutes',
        CURRENT_TIMESTAMP - INTERVAL '55 minutes' + INTERVAL '1 second',
        CURRENT_TIMESTAMP - INTERVAL '55 minutes' + INTERVAL '3 seconds'
    ),
    -- 8: test / Two Sum -- Internal Error (Judge0-side failure)
    (
        6, 1, 'Internal Error', 71, 'Python 3',
        $$a, b = map(int, input().split())
print(a + b)$$,
        NULL, 0, 3, 0.00, NULL, NULL, 'Judge0 could not process this submission.',
        CURRENT_TIMESTAMP - INTERVAL '40 minutes',
        CURRENT_TIMESTAMP - INTERVAL '40 minutes' + INTERVAL '1 second',
        CURRENT_TIMESTAMP - INTERVAL '40 minutes' + INTERVAL '5 seconds'
    ),
    -- 9: test / Palindrome Check -- Cancelled (administratively cancelled)
    (
        6, 2, 'Cancelled', 62, 'Java',
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
        NULL, 0, 3, 0.00, NULL, NULL, 'Submission cancelled by administrator.',
        CURRENT_TIMESTAMP - INTERVAL '35 minutes',
        CURRENT_TIMESTAMP - INTERVAL '35 minutes' + INTERVAL '1 second',
        CURRENT_TIMESTAMP - INTERVAL '35 minutes' + INTERVAL '2 seconds'
    ),
    -- 10: Code Falcons / Palindrome Check -- Queued (just submitted, not yet picked up)
    (
        2, 2, 'Queued', 62, 'Java',
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
        NULL, 0, 3, 0.00, NULL, NULL, NULL,
        CURRENT_TIMESTAMP - INTERVAL '1 minute',
        NULL, NULL
    ),
    -- 11: Byte Force / Shortest Path -- Judging (in progress right now)
    (
        1, 3, 'Judging', 71, 'Python 3',
        $$import heapq

def dijkstra(n, edges, src):
    graph = {i: [] for i in range(1, n + 1)}
    for u, v, w in edges:
        graph[u].append((v, w))
        graph[v].append((u, w))

    dist = {i: float('inf') for i in range(1, n + 1)}
    dist[src] = 0
    pq = [(0, src)]

    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue
        for v, w in graph[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(pq, (dist[v], v))

    return dist

n, m = map(int, input().split())
edges = [tuple(map(int, input().split())) for _ in range(m)]
print(dijkstra(n, edges, 1)[n])$$,
        NULL, 0, 2, 0.00, NULL, NULL, NULL,
        CURRENT_TIMESTAMP - INTERVAL '30 seconds',
        CURRENT_TIMESTAMP - INTERVAL '25 seconds', NULL
    ),
    -- 12: Frozen Flames / Binary Search -- Accepted
    (
        9, 7, 'Accepted', 54, 'C++',
        $$#include <iostream>
using namespace std;

int main() {
    int n; cin >> n;
    int arr[100000];
    for (int i = 0; i < n; i++) cin >> arr[i];
    int target; cin >> target;

    int lo = 0, hi = n - 1, ans = -1;
    while (lo <= hi) {
        int mid = (lo + hi) / 2;
        if (arr[mid] == target) { ans = mid; break; }
        else if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    cout << ans;
}$$,
        NULL, 2, 2, 200.00, 15.000, 3200, NULL,
        CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '30 minutes',
        CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '30 minutes' + INTERVAL '1 second',
        CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '30 minutes' + INTERVAL '3 seconds'
    ),
    -- 13: Frozen Flames / Longest Common Subsequence -- Wrong Answer
    (
        9, 8, 'Wrong Answer', 71, 'Python 3',
        $$def lcs(a, b):
    # Bug: finds the longest common SUBSTRING, not subsequence.
    best = ""
    for i in range(len(a)):
        for j in range(len(b)):
            k = 0
            while i + k < len(a) and j + k < len(b) and a[i + k] == b[j + k]:
                k += 1
            if k > len(best):
                best = a[i:i + k]
    return best

a = input()
b = input()
print(lcs(a, b))$$,
        NULL, 0, 2, 0.00, 20.000, 3300, 'Output did not match the expected result.',
        CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '45 minutes',
        CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '45 minutes' + INTERVAL '1 second',
        CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '45 minutes' + INTERVAL '2 seconds'
    ),
    -- 14: Ice Breakers / Binary Search -- Accepted
    (
        10, 7, 'Accepted', 62, 'Java',
        $$import java.util.*;

class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        int target = sc.nextInt();

        int lo = 0, hi = n - 1, ans = -1;
        while (lo <= hi) {
            int mid = (lo + hi) / 2;
            if (arr[mid] == target) { ans = mid; break; }
            else if (arr[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
        System.out.println(ans);
    }
}$$,
        NULL, 2, 2, 200.00, 25.000, 15500, NULL,
        CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '1 hour',
        CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '1 hour' + INTERVAL '1 second',
        CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '1 hour' + INTERVAL '3 seconds'
    ),
    -- 15: Legacy Legends / FizzBuzz -- Accepted
    (
        11, 9, 'Accepted', 71, 'Python 3',
        $$n = int(input())
for i in range(1, n + 1):
    if i % 15 == 0:
        print("FizzBuzz")
    elif i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)$$,
        NULL, 2, 2, 100.00, 10.000, 3100, NULL,
        CURRENT_TIMESTAMP - INTERVAL '20 days' + INTERVAL '20 minutes',
        CURRENT_TIMESTAMP - INTERVAL '20 days' + INTERVAL '20 minutes' + INTERVAL '1 second',
        CURRENT_TIMESTAMP - INTERVAL '20 days' + INTERVAL '20 minutes' + INTERVAL '2 seconds'
    ),
    -- 16: Legacy Legends / Prime Sieve -- Accepted
    (
        11, 10, 'Accepted', 54, 'C++',
        $$#include <bits/stdc++.h>
using namespace std;

int main() {
    int n; cin >> n;
    vector<bool> sieve(n + 1, true);
    sieve[0] = sieve[1] = false;

    for (int i = 2; (long long)i * i <= n; i++) {
        if (sieve[i]) {
            for (int j = i * i; j <= n; j += i) sieve[j] = false;
        }
    }

    vector<int> primes;
    for (int i = 2; i <= n; i++) if (sieve[i]) primes.push_back(i);

    for (size_t i = 0; i < primes.size(); i++) {
        cout << primes[i] << (i + 1 < primes.size() ? " " : "");
    }
}$$,
        'a2222222-2222-4222-8222-222222222222', 2, 2, 250.00, 18.000, 3400, NULL,
        CURRENT_TIMESTAMP - INTERVAL '20 days' + INTERVAL '40 minutes',
        CURRENT_TIMESTAMP - INTERVAL '20 days' + INTERVAL '40 minutes' + INTERVAL '1 second',
        CURRENT_TIMESTAMP - INTERVAL '20 days' + INTERVAL '40 minutes' + INTERVAL '3 seconds'
    ),
    -- 17: Old Timers / FizzBuzz -- Wrong Answer (Fizz/Buzz swapped)
    (
        12, 9, 'Wrong Answer', 62, 'Java',
        $$public class Main {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        int n = sc.nextInt();
        for (int i = 1; i <= n; i++) {
            if (i % 15 == 0) System.out.println("FizzBuzz");
            else if (i % 3 == 0) System.out.println("Buzz");
            else if (i % 5 == 0) System.out.println("Fizz");
            else System.out.println(i);
        }
    }
}$$,
        NULL, 0, 2, 0.00, 12.000, 15100, 'Output did not match the expected result.',
        CURRENT_TIMESTAMP - INTERVAL '20 days' + INTERVAL '25 minutes',
        CURRENT_TIMESTAMP - INTERVAL '20 days' + INTERVAL '25 minutes' + INTERVAL '1 second',
        CURRENT_TIMESTAMP - INTERVAL '20 days' + INTERVAL '25 minutes' + INTERVAL '2 seconds'
    );

-- =========================================================
-- Submission Test Results
-- =========================================================
INSERT INTO submission_test_results
    (
        submission_id, problem_id, test_id, status, judge0_token,
        judge0_status_id, judge0_status_description,
        execution_time_ms, memory_used_kb, stdout, stderr, compile_output,
        judge_message, created_at, processing_started_at, completed_at
    )
VALUES
    -- Submission 1: Accepted (Two Sum, Python)
    (1, 1, 1, 'Accepted', 'sample-token-1-1', 3, 'Accepted', 15.000, 3300, '5', NULL, NULL, NULL,
     CURRENT_TIMESTAMP - INTERVAL '100 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '100 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '100 minutes' + INTERVAL '2 seconds'),
    (1, 1, 2, 'Accepted', 'sample-token-1-2', 3, 'Accepted', 18.000, 3350, '-6', NULL, NULL, NULL,
     CURRENT_TIMESTAMP - INTERVAL '100 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '100 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '100 minutes' + INTERVAL '2 seconds'),
    (1, 1, 3, 'Accepted', 'sample-token-1-3', 3, 'Accepted', 21.000, 3400, '350000', NULL, NULL, NULL,
     CURRENT_TIMESTAMP - INTERVAL '100 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '100 minutes' + INTERVAL '2 seconds',
     CURRENT_TIMESTAMP - INTERVAL '100 minutes' + INTERVAL '3 seconds'),

    -- Submission 2: Accepted (Palindrome, Java)
    (2, 2, 1, 'Accepted', 'sample-token-2-1', 3, 'Accepted', 27.000, 15000, 'YES', NULL, NULL, NULL,
     CURRENT_TIMESTAMP - INTERVAL '95 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '95 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '95 minutes' + INTERVAL '3 seconds'),
    (2, 2, 2, 'Accepted', 'sample-token-2-2', 3, 'Accepted', 30.000, 15200, 'NO', NULL, NULL, NULL,
     CURRENT_TIMESTAMP - INTERVAL '95 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '95 minutes' + INTERVAL '2 seconds',
     CURRENT_TIMESTAMP - INTERVAL '95 minutes' + INTERVAL '3 seconds'),
    (2, 2, 3, 'Accepted', 'sample-token-2-3', 3, 'Accepted', 29.000, 15100, 'YES', NULL, NULL, NULL,
     CURRENT_TIMESTAMP - INTERVAL '95 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '95 minutes' + INTERVAL '2 seconds',
     CURRENT_TIMESTAMP - INTERVAL '95 minutes' + INTERVAL '4 seconds'),

    -- Submission 3: Wrong Answer on test 1, rest Skipped
    (3, 1, 1, 'Wrong Answer', 'sample-token-3-1', 4, 'Wrong Answer', 18.000, 3200, '-1', NULL, NULL,
     'Program executed successfully, but output was incorrect.',
     CURRENT_TIMESTAMP - INTERVAL '92 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '92 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '92 minutes' + INTERVAL '2 seconds'),
    (3, 1, 2, 'Skipped', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
     'Skipped after a previous testcase failed.',
     CURRENT_TIMESTAMP - INTERVAL '92 minutes' + INTERVAL '2 seconds', NULL, NULL),
    (3, 1, 3, 'Skipped', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
     'Skipped after a previous testcase failed.',
     CURRENT_TIMESTAMP - INTERVAL '92 minutes' + INTERVAL '2 seconds', NULL, NULL),

    -- Submission 4: corrected, Accepted
    (4, 1, 1, 'Accepted', 'sample-token-4-1', 3, 'Accepted', 10.000, 3000, '5', NULL, NULL, NULL,
     CURRENT_TIMESTAMP - INTERVAL '85 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '85 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '85 minutes' + INTERVAL '2 seconds'),
    (4, 1, 2, 'Accepted', 'sample-token-4-2', 3, 'Accepted', 11.000, 3050, '-6', NULL, NULL, NULL,
     CURRENT_TIMESTAMP - INTERVAL '85 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '85 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '85 minutes' + INTERVAL '2 seconds'),
    (4, 1, 3, 'Accepted', 'sample-token-4-3', 3, 'Accepted', 12.000, 3100, '350000', NULL, NULL, NULL,
     CURRENT_TIMESTAMP - INTERVAL '85 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '85 minutes' + INTERVAL '2 seconds',
     CURRENT_TIMESTAMP - INTERVAL '85 minutes' + INTERVAL '3 seconds'),

    -- Submission 5: Time Limit Exceeded on test 1, rest Skipped
    (5, 3, 1, 'Time Limit Exceeded', 'sample-token-5-1', 5, 'Time Limit Exceeded', 2001.000, 3500, NULL, NULL, NULL,
     'Execution exceeded the configured CPU time limit.',
     CURRENT_TIMESTAMP - INTERVAL '70 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '70 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '70 minutes' + INTERVAL '4 seconds'),
    (5, 3, 2, 'Skipped', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
     'Skipped after a previous testcase failed.',
     CURRENT_TIMESTAMP - INTERVAL '70 minutes' + INTERVAL '4 seconds', NULL, NULL),

    -- Submission 6: Compilation Error on test 1, rest Skipped
    (6, 1, 1, 'Compilation Error', 'sample-token-6-1', 6, 'Compilation Error', NULL, NULL, NULL, NULL,
     E'main.cpp:6:16: error: expected \';\' before \'cin\'', NULL,
     CURRENT_TIMESTAMP - INTERVAL '60 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '60 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '60 minutes' + INTERVAL '2 seconds'),
    (6, 1, 2, 'Skipped', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
     'Skipped after a previous testcase failed.',
     CURRENT_TIMESTAMP - INTERVAL '60 minutes' + INTERVAL '2 seconds', NULL, NULL),
    (6, 1, 3, 'Skipped', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
     'Skipped after a previous testcase failed.',
     CURRENT_TIMESTAMP - INTERVAL '60 minutes' + INTERVAL '2 seconds', NULL, NULL),

    -- Submission 7: test 1 passes, test 2 Runtime Error, test 3 Skipped
    (7, 2, 1, 'Accepted', 'sample-token-7-1', 3, 'Accepted', 26.000, 15900, 'YES', NULL, NULL, NULL,
     CURRENT_TIMESTAMP - INTERVAL '55 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '55 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '55 minutes' + INTERVAL '2 seconds'),
    (7, 2, 2, 'Runtime Error', 'sample-token-7-2', 11, 'Runtime Error (NZEC)', 45.000, 16000, NULL,
     E'Exception in thread "main" java.lang.NullPointerException\n\tat Main.main(Main.java:9)', NULL, NULL,
     CURRENT_TIMESTAMP - INTERVAL '55 minutes' + INTERVAL '2 seconds',
     CURRENT_TIMESTAMP - INTERVAL '55 minutes' + INTERVAL '2 seconds',
     CURRENT_TIMESTAMP - INTERVAL '55 minutes' + INTERVAL '3 seconds'),
    (7, 2, 3, 'Skipped', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
     'Skipped after a previous testcase failed.',
     CURRENT_TIMESTAMP - INTERVAL '55 minutes' + INTERVAL '3 seconds', NULL, NULL),

    -- Submission 8: Internal Error on test 1, rest Skipped
    (8, 1, 1, 'Internal Error', NULL, 13, 'Internal Error', NULL, NULL, NULL, NULL, NULL,
     'Judge0 could not process this submission.',
     CURRENT_TIMESTAMP - INTERVAL '40 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '40 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '40 minutes' + INTERVAL '5 seconds'),
    (8, 1, 2, 'Skipped', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
     'Skipped after a previous testcase failed.',
     CURRENT_TIMESTAMP - INTERVAL '40 minutes' + INTERVAL '5 seconds', NULL, NULL),
    (8, 1, 3, 'Skipped', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
     'Skipped after a previous testcase failed.',
     CURRENT_TIMESTAMP - INTERVAL '40 minutes' + INTERVAL '5 seconds', NULL, NULL),

    -- Submission 9: Cancelled -- all tests Skipped
    (9, 2, 1, 'Skipped', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
     'Submission cancelled by administrator.',
     CURRENT_TIMESTAMP - INTERVAL '35 minutes' + INTERVAL '1 second', NULL, NULL),
    (9, 2, 2, 'Skipped', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
     'Submission cancelled by administrator.',
     CURRENT_TIMESTAMP - INTERVAL '35 minutes' + INTERVAL '1 second', NULL, NULL),
    (9, 2, 3, 'Skipped', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
     'Submission cancelled by administrator.',
     CURRENT_TIMESTAMP - INTERVAL '35 minutes' + INTERVAL '1 second', NULL, NULL),

    -- Submission 10: Queued -- nothing has run yet
    (10, 2, 1, 'Queued', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
     CURRENT_TIMESTAMP - INTERVAL '1 minute', NULL, NULL),
    (10, 2, 2, 'Queued', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
     CURRENT_TIMESTAMP - INTERVAL '1 minute', NULL, NULL),
    (10, 2, 3, 'Queued', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
     CURRENT_TIMESTAMP - INTERVAL '1 minute', NULL, NULL),

    -- Submission 11: Judging -- one test actively Processing, one still Queued
    (11, 3, 1, 'Processing', 'sample-token-11-1', 2, 'Processing', NULL, NULL, NULL, NULL, NULL, NULL,
     CURRENT_TIMESTAMP - INTERVAL '25 seconds',
     CURRENT_TIMESTAMP - INTERVAL '25 seconds', NULL),
    (11, 3, 2, 'Queued', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
     CURRENT_TIMESTAMP - INTERVAL '25 seconds', NULL, NULL),

    -- Submission 12: Accepted (Binary Search, C++)
    (12, 7, 1, 'Accepted', 'sample-token-12-1', 3, 'Accepted', 14.000, 3150, '2', NULL, NULL, NULL,
     CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '30 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '30 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '30 minutes' + INTERVAL '2 seconds'),
    (12, 7, 2, 'Accepted', 'sample-token-12-2', 3, 'Accepted', 15.000, 3200, '-1', NULL, NULL, NULL,
     CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '30 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '30 minutes' + INTERVAL '2 seconds',
     CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '30 minutes' + INTERVAL '3 seconds'),

    -- Submission 13: Wrong Answer on test 1, rest Skipped
    (13, 8, 1, 'Wrong Answer', 'sample-token-13-1', 4, 'Wrong Answer', 20.000, 3300, 'BCAB', NULL, NULL,
     'Program executed successfully, but output was incorrect.',
     CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '45 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '45 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '45 minutes' + INTERVAL '2 seconds'),
    (13, 8, 2, 'Skipped', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
     'Skipped after a previous testcase failed.',
     CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '45 minutes' + INTERVAL '2 seconds', NULL, NULL),

    -- Submission 14: Accepted (Binary Search, Java)
    (14, 7, 1, 'Accepted', 'sample-token-14-1', 3, 'Accepted', 24.000, 15400, '2', NULL, NULL, NULL,
     CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '1 hour' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '1 hour' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '1 hour' + INTERVAL '2 seconds'),
    (14, 7, 2, 'Accepted', 'sample-token-14-2', 3, 'Accepted', 25.000, 15500, '-1', NULL, NULL, NULL,
     CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '1 hour' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '1 hour' + INTERVAL '2 seconds',
     CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '1 hour' + INTERVAL '3 seconds'),

    -- Submission 15: Accepted (FizzBuzz, Python)
    (15, 9, 1, 'Accepted', 'sample-token-15-1', 3, 'Accepted', 9.000, 3050, E'1\n2\nFizz\n4\nBuzz', NULL, NULL, NULL,
     CURRENT_TIMESTAMP - INTERVAL '20 days' + INTERVAL '20 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '20 days' + INTERVAL '20 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '20 days' + INTERVAL '20 minutes' + INTERVAL '2 seconds'),
    (15, 9, 2, 'Accepted', 'sample-token-15-2', 3, 'Accepted', 10.000, 3100,
     E'1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz', NULL, NULL, NULL,
     CURRENT_TIMESTAMP - INTERVAL '20 days' + INTERVAL '20 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '20 days' + INTERVAL '20 minutes' + INTERVAL '2 seconds',
     CURRENT_TIMESTAMP - INTERVAL '20 days' + INTERVAL '20 minutes' + INTERVAL '2 seconds'),

    -- Submission 16: Accepted (Prime Sieve, C++)
    (16, 10, 1, 'Accepted', 'sample-token-16-1', 3, 'Accepted', 17.000, 3350, '2 3 5 7', NULL, NULL, NULL,
     CURRENT_TIMESTAMP - INTERVAL '20 days' + INTERVAL '40 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '20 days' + INTERVAL '40 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '20 days' + INTERVAL '40 minutes' + INTERVAL '2 seconds'),
    (16, 10, 2, 'Accepted', 'sample-token-16-2', 3, 'Accepted', 18.000, 3400, '2 3 5 7 11 13 17 19', NULL, NULL, NULL,
     CURRENT_TIMESTAMP - INTERVAL '20 days' + INTERVAL '40 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '20 days' + INTERVAL '40 minutes' + INTERVAL '2 seconds',
     CURRENT_TIMESTAMP - INTERVAL '20 days' + INTERVAL '40 minutes' + INTERVAL '3 seconds'),

    -- Submission 17: Wrong Answer on test 1, rest Skipped
    (17, 9, 1, 'Wrong Answer', 'sample-token-17-1', 4, 'Wrong Answer', 12.000, 15100, E'1\n2\nBuzz\n4\nFizz', NULL, NULL,
     'Program executed successfully, but output was incorrect.',
     CURRENT_TIMESTAMP - INTERVAL '20 days' + INTERVAL '25 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '20 days' + INTERVAL '25 minutes' + INTERVAL '1 second',
     CURRENT_TIMESTAMP - INTERVAL '20 days' + INTERVAL '25 minutes' + INTERVAL '2 seconds'),
    (17, 9, 2, 'Skipped', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
     'Skipped after a previous testcase failed.',
     CURRENT_TIMESTAMP - INTERVAL '20 days' + INTERVAL '25 minutes' + INTERVAL '2 seconds', NULL, NULL);

-- =========================================================
-- Leaderboard
-- One row per team per competition. points/solved_questions here mirror
-- the Accepted submissions above exactly. Normally your backend updates
-- this table after judging (see leaderbord.js leaderboardTrigger).
-- =========================================================
INSERT INTO leaderboard
    (team_id, competition_id, solved_questions, points)
VALUES
    -- Competition 1
    (1, 1, 2, 250),  -- Byte Force: Two Sum + Palindrome
    (2, 1, 1, 100),  -- Code Falcons: Two Sum (after a wrong attempt)
    (3, 1, 0, 0),    -- Null Pointers: only a TLE so far
    (4, 1, 0, 0),    -- Stack Overflow: compile + runtime errors, nothing accepted
    (5, 1, 0, 0),    -- Kernel Panic: never logged in, zero submissions
    (6, 1, 0, 0),    -- test: internal error + cancelled, nothing accepted

    -- Competition 2 (Upcoming, nobody has submitted)
    (7, 2, 0, 0),
    (8, 2, 0, 0),

    -- Competition 3 (Frozen) -- deliberate tie at 200 pts / 1 solved
    (9, 3, 1, 200),
    (10, 3, 1, 200),

    -- Competition 4 (Finished)
    (11, 4, 2, 350),
    (12, 4, 0, 0),

    -- Competition 5 (Cancelled, never started)
    (13, 5, 0, 0);

-- =========================================================
-- Announcements
-- =========================================================
INSERT INTO announcements
    (competition_id, created_by, title, message, is_published)
VALUES
    (1, 1, 'Welcome Contestants',
     'Welcome to the GDG Programming Competition. We wish everyone the best of luck!', TRUE),
    (1, 1, 'Clarification for Problem B',
     'The sample explanation has been updated. The input and output format remain unchanged.', TRUE),
    (1, 2, 'Judge0 Maintenance Window',
     'Draft: judging may briefly pause around the two-hour mark for a routine restart.', FALSE),
    (2, 1, 'Backend Sprint Starts Soon',
     'The Backend Sprint Contest opens in a few days. Make sure your team credentials work before then.', TRUE),
    (3, 1, 'Scoreboard Frozen for the Final Hour',
     'Standings are frozen for the last hour of Frozen Finals. Final results will be revealed at the closing ceremony.', TRUE),
    (4, 2, 'Thanks for Participating',
     'Summer Kickoff 2026 has concluded. Thank you to everyone who joined, and congratulations to our winners!', TRUE);

COMMIT;
