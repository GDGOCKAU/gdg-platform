const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const teamController = require("../controllers/teamController");

router.patch("/theme", authenticateToken, teamController.updateTheme);

module.exports = router;