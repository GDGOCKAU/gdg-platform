const express = require("express");
const authMiddleware = require("../middleware/participantAuthMiddleware");
const { getDashboard } = require("../controllers/homeController");

const router = express.Router();

router.get("/dashboard", authMiddleware, getDashboard);

module.exports = router;