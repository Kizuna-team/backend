const express = require("express");
const router = express.Router();
const { handleChat } = require("../controllers/aiChatController");
const authMiddleware = require("../middleware/auth");

router.post("/", authMiddleware, handleChat);

module.exports = router;
