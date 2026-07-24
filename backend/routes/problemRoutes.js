const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getProblems, getProblemById } = require("../controllers/problemController");
const router = express.Router();

router.get("/", authMiddleware, getProblems);
router.get("/:problemId", authMiddleware, getProblemById);

module.exports = router;