const express = require("express");

const {getAdminOverview, } = require("../controllers/adminOverviewController");

const authMiddleware = require("../middleware/adminAuthMiddleware");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

router.get("/",authMiddleware, requireAdmin, getAdminOverview);

module.exports = router;