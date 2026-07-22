const express = require("express");
const { getProblems, getProblemById } = require("../controllers/problemController");
const router = express.Router();

router.get("/", getProblems);
router.get("/:problemId", getProblemById);

module.exports = router;