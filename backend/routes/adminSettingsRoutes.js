const express = require("express");

const {
  getAdminTheme,
  updateAdminTheme,
} = require("../controllers/adminSettingsController");

const adminAuthMiddleware = require(
  "../middleware/adminAuthMiddleware"
);

const requireAdmin = require(
  "../middleware/requireAdmin"
);

const router = express.Router();

router.get(
  "/theme",
  adminAuthMiddleware,
  requireAdmin,
  getAdminTheme
);

router.patch(
  "/theme",
  adminAuthMiddleware,
  requireAdmin,
  updateAdminTheme
);

module.exports = router;