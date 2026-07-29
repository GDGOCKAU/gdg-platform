const express = require("express");

const {loginAdmin, getCurrentAdmin, logoutAdmin,} = require("../controllers/adminAuthController");

const authMiddleware = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

// Login
router.post("/login", loginAdmin);

// Get current admin
router.get("/me", authMiddleware, requireAdmin, getCurrentAdmin);

// Logout
router.post("/logout", authMiddleware, requireAdmin, logoutAdmin);

module.exports = router;