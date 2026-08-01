const express = require("express");
const router = express.Router();

const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");
const requireAdmin = require("../middleware/requireAdmin");
const {
  getProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
} = require("../controllers/adminProblemController");

router.get("/", adminAuthMiddleware, requireAdmin, getProblems);
router.get("/:id", adminAuthMiddleware, requireAdmin, getProblemById);
router.post("/", adminAuthMiddleware, requireAdmin, createProblem);
router.patch("/:id", adminAuthMiddleware, requireAdmin, updateProblem);
router.delete("/:id", adminAuthMiddleware, requireAdmin, deleteProblem);

module.exports = router;