const express = require("express");
const { getRecommendations } = require("../controllers/recommendControllers");

const router = express.Router();

/**
 * @swagger
 * /recommendations/{userId}:
 *   get:
 *     summary: 取得配對推薦
 *     tags: [Recommendation]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 */
router.get("/:userId", getRecommendations);

module.exports = router;