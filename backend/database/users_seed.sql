
-- =========================================================
-- Users
-- Admin accounts only. Plaintext passwords documented here for local
-- testing convenience -- do NOT reuse these in a real deployment.
--   test      / test1234
--   gdgadmin  / GdgAdmin#2026
-- Run for both `db:setup` and `db:setup:schema` so a login always exists.
-- =========================================================
INSERT INTO users (user_name, password, role, theme)
VALUES
    ('test',     '$2b$12$FY6j6N9GdY.NU.LtenKZvueTLzwwmXrb4IrZO1CeoRrYh/irAalm.', 'Admin', 'Dark'),
    ('gdgadmin', '$2b$12$FGhc.bvIpKMf.WgpMoriJe.ajJApoaIaS/QzZaazMu7lUQJfCpkES', 'Admin', 'Light');
