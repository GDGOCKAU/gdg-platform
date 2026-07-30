const express = require("express");
const { participantAuthMiddleware } = require("../middleware/participantAuthMiddleware");
const { login, getCurrentUser } = require("../controllers/authController");

const router = express.Router();

router.post("/login", login);
router.get("/me", participantAuthMiddleware, getCurrentUser);

module.exports = router;