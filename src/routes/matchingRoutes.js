const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.js");
const { createLike } = require("../controllers/likesControllers.js");
const { createSuperLike } = require("../controllers/superLikeControllers.js");

// 處理誰喜歡誰，並在雙方喜歡時自動配對
router.post("/like", authMiddleware, createLike);
router.post("/super-like", authMiddleware, createSuperLike);

module.exports = router;
