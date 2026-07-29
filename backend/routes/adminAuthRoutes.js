const express = require("express");

const {loginAdmin, getCurrentAdmin, logoutAdmin,} = require("../controllers/adminAuthController");

const adminAuthRoutes = require("../middleware/adminAuthMiddleware");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

// Login
router.post("/login", loginAdmin);

// Get current admin
router.get("/me", adminAuthRoutes, requireAdmin, getCurrentAdmin);

// Logout
router.post("/logout", adminAuthRoutes, requireAdmin, logoutAdmin);

module.exports = router;