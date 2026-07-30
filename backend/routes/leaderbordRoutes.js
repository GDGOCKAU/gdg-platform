const express = require("express");
const { participantAuthMiddleware: authMiddleware } = require("../middleware/participantAuthMiddleware");

const router = express.Router();
const leaderboardController = require("../controllers/leaderboardController");

router.get( "/:competitionId", authMiddleware, leaderboardController.getLeaderboard);

module.exports = router;
