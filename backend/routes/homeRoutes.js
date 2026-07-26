const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getDashboard } = require("../controllers/homeController");

const router = express.Router();

router.get("/dashboard", authMiddleware, getDashboard);

module.exports = router;