const express = require("express");
const { getRecommendations } = require("../controllers/recommendControllers");
const authMiddleware = require("../middleware/auth.js");

const router = express.Router();

/**
 * @swagger
 * /recommendations/me:
 *   get:
 *     summary: 取得目前登入者的配對推薦
 *     tags: [Recommendation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功取得推薦對象
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 relaxed:
 *                   type: boolean
 *                   description: 是否放寬條件
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       age:
 *                         type: integer
 *                       gender:
 *                         type: string
 *       401:
 *         description: 未授權，請先登入
 *       500:
 *         description: 伺服器錯誤
 */
router.get("/me", authMiddleware, getRecommendations);

module.exports = router;
