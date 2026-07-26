const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {createSubmission, getSubmissionById} = require("../controllers/submissionController");

const router = express.Router();

router.post("/", authMiddleware, createSubmission);
router.get("/:submissionId", authMiddleware, getSubmissionById);

module.exports = router;