const express = require("express");
const router = express.Router();

const {getProblemById, } = require("../controllers/problemController");

router.get("/:problemId", getProblemById);

module.exports = router;