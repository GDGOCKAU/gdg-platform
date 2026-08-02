const express = require("express");

const {loginAdmin, getCurrentAdmin, changePassword, getAdmins, createAdmin, logoutAdmin,} = require("../controllers/adminAuthController");

const adminAuthRoutes = require("../middleware/adminAuthMiddleware");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

// Login
router.post("/login", loginAdmin);

// Get current admin
router.get("/me", adminAuthRoutes, requireAdmin, getCurrentAdmin);

// Change own password
router.post("/change-password", adminAuthRoutes, requireAdmin, changePassword);

// List / create admin accounts
router.get("/admins", adminAuthRoutes, requireAdmin, getAdmins);
router.post("/admins", adminAuthRoutes, requireAdmin, createAdmin);

// Logout
router.post("/logout", adminAuthRoutes, requireAdmin, logoutAdmin);

module.exports = router;