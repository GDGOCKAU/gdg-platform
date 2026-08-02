const express = require("express");

const {getAdminOverview, getSubmissionsFeed, createAnnouncement, getAnnouncements, updateAnnouncement, deleteAnnouncement, getAvailableCompetitions } = require("../controllers/adminOverviewController");

const authMiddleware = require("../middleware/adminAuthMiddleware");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

router.get("/",authMiddleware, requireAdmin, getAdminOverview);
router.get("/submissions-feed", authMiddleware, requireAdmin, getSubmissionsFeed);
router.post("/announcements", authMiddleware, requireAdmin, createAnnouncement);
router.get("/announcements", authMiddleware, requireAdmin, getAnnouncements);
router.patch("/announcements/:id", authMiddleware, requireAdmin, updateAnnouncement);
router.delete("/announcements/:id", authMiddleware, requireAdmin, deleteAnnouncement);
router.get("/competitions",authMiddleware, requireAdmin, getAvailableCompetitions);

module.exports = router;