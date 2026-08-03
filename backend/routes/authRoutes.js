const express = require("express");
const { participantAuthMiddleware } = require("../middleware/participantAuthMiddleware");
const { login, getCurrentUser, logout } = require("../controllers/authController");

const router = express.Router();

router.post("/login", login);
router.get("/me", participantAuthMiddleware, getCurrentUser);
router.post("/logout", participantAuthMiddleware, logout);

module.exports = router;