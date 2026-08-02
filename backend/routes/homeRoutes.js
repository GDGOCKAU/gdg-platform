const express = require("express");
const { participantAuthMiddleware: authMiddleware } = require("../middleware/participantAuthMiddleware");
const { getDashboard, getAnnouncements } = require("../controllers/homeController");

const router = express.Router();

router.get("/dashboard", authMiddleware, getDashboard);
router.get("/announcements", authMiddleware, getAnnouncements);

module.exports = router;