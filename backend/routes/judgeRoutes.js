const express = require("express");
const { participantAuthMiddleware: authMiddleware } = require("../middleware/participantAuthMiddleware");
const { testBatch } = require("../controllers/judgeController");

const router = express.Router();

router.post("/test-batch", authMiddleware, testBatch);

module.exports = router;