
-- =========================================================
-- Users
-- Admin accounts only. Plaintext passwords documented here for local
-- testing convenience -- do NOT reuse these in a real deployment.
--   test      / 1234
--   gdgadmin  / 2026
-- Run for both `db:setup` and `db:setup:schema` so a login always exists.
-- =========================================================
INSERT INTO users (user_name, password, role, theme)
VALUES
    ('test',     '$2b$12$VC4rulkRrdmMfKERJQ4Vq.H9BF2abbOfaoFkyTqDFhKzEJ7KCJEKy', 'Admin', 'Dark'),
    ('gdgadmin', '$2b$12$hzIedFmYYTl1kMb0i5gqq.BbTNCRMVNq5mW6e8QZ9oRBZlEOIiifq', 'Admin', 'Light');
