const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const leaderboardController = require("../controllers/leaderboardController");

router.get( "/:competitionId", authMiddleware, leaderboardController.getLeaderboard);

module.exports = router;
