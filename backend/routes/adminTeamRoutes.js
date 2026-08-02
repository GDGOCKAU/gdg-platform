const express = require("express");
const router = express.Router();

const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");
const requireAdmin = require("../middleware/requireAdmin");
const {
  getTeams,
  createTeam,
  createTeamsBulk,
  updateTeam,
  deleteTeam,
} = require("../controllers/adminTeamController");

router.get("/", adminAuthMiddleware, requireAdmin, getTeams);
router.post("/", adminAuthMiddleware, requireAdmin, createTeam);
router.post("/bulk", adminAuthMiddleware, requireAdmin, createTeamsBulk);
router.patch("/:id", adminAuthMiddleware, requireAdmin, updateTeam);
router.delete("/:id", adminAuthMiddleware, requireAdmin, deleteTeam);

module.exports = router;