require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/database");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cors({origin: "http://localhost:5173", credentials: true,}));
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
app.get("/api/test-database", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");

    res.status(200).json({
      success: true,
      message: "Database connected successfully",
      databaseTime: result.rows[0].current_time,
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

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
const submissionRoutes = require("./routes/submissionRoutes");
const judgeRoutes = require("./routes/judgeRoutes");
const userRoutes = require("./routes/teamRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");

// =======================================================
// ===================== API Routes =======================
// =======================================================

app.use("/api/problems", problemRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/judge", judgeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin/auth", adminAuthRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});