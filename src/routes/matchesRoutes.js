const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.js");
const {
  getMatchedBasicData,
  matchedBeFriend,
} = require("../controllers/matchesControllers.js");

router.get("/", authMiddleware, getMatchedBasicData);
router.post("/", authMiddleware, matchedBeFriend);

module.exports = router;
