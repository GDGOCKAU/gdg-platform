require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/database");
const cookieParser = require("cookie-parser");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("Not allowed by CORS")
      );
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    message: "GDG Contest Platform API is running",
  });
});

// =======================================================
// ================== Database Tester ====================
// =======================================================

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM competitions
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// =======================================================
// =======================================================


// =======================================================
// ==================== Route Imports =====================
// =======================================================

const problemRoutes = require("./routes/problemRoutes");
const authRoutes = require("./routes/authRoutes");
const homeRoutes = require("./routes/homeRoutes");
const leaderbord = require("./routes/leaderbordRoutes.js");
const submissionRoutes = require("./routes/submissionRoutes");
const judgeRoutes = require("./routes/judgeRoutes");
const userRoutes = require("./routes/teamRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const adminOverviewRoutes = require("./routes/adminOverviewRoutes");
const adminTeamRoutes = require("./routes/adminTeamRoutes");
const adminSettingsRoutes = require("./routes/adminSettingsRoutes");
const adminContestRoutes = require("./routes/adminContestRoutes");
const adminProblemRoutes = require("./routes/adminProblemRoutes");
const adminCompetitionRoutes = require("./routes/adminCompetitionRoutes");
// =======================================================
// ===================== API Routes =======================
// =======================================================

app.use("/api/problems", problemRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/leaderboard", leaderbord);
app.use("/api/submissions", submissionRoutes);
app.use("/api/judge", judgeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/overview", adminOverviewRoutes);
app.use("/api/admin/teams", adminTeamRoutes);
app.use("/api/admin/settings", adminSettingsRoutes);
app.use("/api/admin/contests", adminContestRoutes);
app.use("/api/admin/problems", adminProblemRoutes);
app.use("/api/admin/competitions", adminCompetitionRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});