const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { testBatch } = require("../controllers/judgeController");

const router = express.Router();

router.post("/test-batch", authMiddleware, testBatch);

module.exports = router;