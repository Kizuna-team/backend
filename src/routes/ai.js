const express = require("express");
const router = express.Router();
const { handleChat, handleSuggestion } = require("../controllers/aiChatController");
const authMiddleware = require("../middleware/auth");

router.post("/", authMiddleware, handleChat);
router.post("/ai-suggestion", authMiddleware, handleSuggestion);

module.exports = router;
