const express = require("express");
const { participantAuthMiddleware: authMiddleware } = require("../middleware/participantAuthMiddleware");

const {createSubmission, getSubmissionById, getSubmissionsForProblem} = require("../controllers/submissionController");

const router = express.Router();

router.post("/", authMiddleware, createSubmission);
router.get("/", authMiddleware, getSubmissionsForProblem);
router.get("/:submissionId", authMiddleware, getSubmissionById);

module.exports = router;