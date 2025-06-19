const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.js");
const { createLike } = require("../controllers/likesControllers.js");
const {
  createSuperLike,
  superLikeAuthHandler,
} = require("../controllers/superLikeControllers.js");


/**
 * @swagger
 * /like:
 *   post:
 *     summary: 一般喜歡功能
 *     tags: [Like]
 *     security:
 *       - bearerAuth: []
 */

// 處理誰喜歡誰，並在雙方喜歡時自動配對
router.post("/", authMiddleware, createLike);
/**
 * @swagger
 * /like/super-like:
 *   post:
 *     summary: Super like 功能
 *     tags: [Like]
 *     security:
 *       - bearerAuth: []
 */
router.post("/super-like", authMiddleware, createSuperLike);
/**
 * @swagger
 * /like/super-like/status:
 *   get:
 *     summary: 檢查 Super like 權限狀態
 *     tags: [Like]
 *     security:
 *       - bearerAuth: []
 */
// 針對Super like 按鈕的API權限確認
router.get("/super-like/status", authMiddleware, superLikeAuthHandler);

module.exports = router;
