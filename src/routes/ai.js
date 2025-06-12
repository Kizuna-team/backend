const express = require("express");
const router = express.Router();
const { handleChat } = require("../controllers/aiChatController");

router.post("/", handleChat);

module.exports = router;
