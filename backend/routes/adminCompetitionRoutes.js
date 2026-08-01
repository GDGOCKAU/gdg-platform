const express = require("express");
const router = express.Router();

const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");
const requireAdmin = require("../middleware/requireAdmin");
const { getCompetitions } = require("../controllers/adminCompetitionController");

router.get("/", adminAuthMiddleware, requireAdmin, getCompetitions);

module.exports = router;