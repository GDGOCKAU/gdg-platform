const express = require("express");

const {createCompetition,} = require("../controllers/adminContestController");
const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

router.post("/", adminAuthMiddleware, requireAdmin, createCompetition);

module.exports = router;