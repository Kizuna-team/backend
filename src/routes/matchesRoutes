const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.js");
const { matchedBeFriend } = require("../controllers/matchesControllers.js");

router.post("/", authMiddleware, matchedBeFriend);

module.exports = router;
