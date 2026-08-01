const express = require("express");
const { participantAuthMiddleware: authMiddleware } = require("../middleware/participantAuthMiddleware");

const router = express.Router();
const leaderboardController = require("../controllers/leaderbord");

router.get( "/:competitionId", authMiddleware, leaderboardController.getLeaderboard);

module.exports = router;
