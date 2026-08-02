const express = require("express");

const {
  createCompetition,
  getCompetitionById,
  updateCompetition,
  deleteCompetition,
  getCompetitionHistory,
  getCompetitionLeaderboard,
  downloadTeamSubmissionsZip,
  downloadAllSubmissionsZip,
} = require("../controllers/adminContestController");
const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

router.post("/", adminAuthMiddleware, requireAdmin, createCompetition);

// Static paths before the /:id catch-all so they don't get swallowed by it.
router.get("/history", adminAuthMiddleware, requireAdmin, getCompetitionHistory);

router.get("/:id", adminAuthMiddleware, requireAdmin, getCompetitionById);
router.patch("/:id", adminAuthMiddleware, requireAdmin, updateCompetition);
router.delete("/:id", adminAuthMiddleware, requireAdmin, deleteCompetition);

router.get("/:id/leaderboard", adminAuthMiddleware, requireAdmin, getCompetitionLeaderboard);
router.get("/:id/submissions.zip", adminAuthMiddleware, requireAdmin, downloadAllSubmissionsZip);
router.get("/:id/teams/:teamId/submissions.zip", adminAuthMiddleware, requireAdmin, downloadTeamSubmissionsZip);

module.exports = router;
