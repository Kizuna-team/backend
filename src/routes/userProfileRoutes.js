const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.js");

const {
  getProfileById,
  getSortedProfiles,
} = require("../controllers/userProfileControllers");

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: 取得所有使用者檔案
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 */
// 查看所有人的檔案資
router.get("/", authMiddleware, getSortedProfiles);

/**
 * @swagger
 * /users/profile/{userId}:
 *   get:
 *     summary: 取得指定使用者檔案
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 */
// 查看指定某人的檔案資訊
router.get("/:userId", authMiddleware, getProfileById);

module.exports = router;
