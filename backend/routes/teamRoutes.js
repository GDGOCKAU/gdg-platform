const express = require("express");
const router = express.Router();

const { participantAuthMiddleware: authenticateToken } = require("../middleware/participantAuthMiddleware");
const teamController = require("../controllers/teamController");

router.patch("/theme", authenticateToken, teamController.updateTheme);

module.exports = router;