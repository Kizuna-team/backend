const express = require("express");
const router = express.Router();
const { handleChat,handleAISuggestion } = require("../controllers/aiChatController");
const authMiddleware = require("../middleware/auth");

router.post("/", authMiddleware, handleChat);
router.post("/suggest", authMiddleware, handleAISuggestion);
module.exports = router;
