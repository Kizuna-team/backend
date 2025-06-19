const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.js");
const {
  getMatchPhotos,
  getAvatarPhoto,
} = require("../controllers/userPhotosControllers");

/**
 * @swagger
 * /users/photos/match/{userId}:
 *   get:
 *     summary: 取得指定使用者的配對照片
 *     tags: [User Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 */
// 從別人 userId 撈出 1～3 張照片（非大頭貼
router.get("/match/:userId", authMiddleware, getMatchPhotos);
/**
 * @swagger
 * /users/photos/avatar:
 *   get:
 *     summary: 取得大頭貼照片
 *     tags: [User Photos]
 *     security:
 *       - bearerAuth: []
 */
router.get("/avatar", authMiddleware, getAvatarPhoto);

module.exports = router;
