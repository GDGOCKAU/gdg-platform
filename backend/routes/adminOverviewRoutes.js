const express = require("express");

const {getAdminOverview, createAnnouncement, getAvailableCompetitions } = require("../controllers/adminOverviewController");

const authMiddleware = require("../middleware/adminAuthMiddleware");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

router.get("/",authMiddleware, requireAdmin, getAdminOverview);
router.post("/announcements", authMiddleware, requireAdmin, createAnnouncement);
router.get("/competitions",authMiddleware, requireAdmin, getAvailableCompetitions);

module.exports = router;