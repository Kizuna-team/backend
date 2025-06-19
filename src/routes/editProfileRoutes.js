const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.js");
const {
  getProfile,
  updateProfile,
  createProfile,
} = require("../controllers/editProfileController.js");
/**
 * @swagger
 * /profile/me:
 *   get:
 *     summary: 取得自己的個人資料
 *     tags: [Profile Management]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", authMiddleware, getProfile);
/**
 * @swagger
 * /profile/me:
 *   post:
 *     summary: 建立個人資料
 *     tags: [Profile Management]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", authMiddleware, createProfile);
/**
 * @swagger
 * /profile/me:
 *   patch:
 *     summary: 更新個人資料
 *     tags: [Profile Management]
 *     security:
 *       - bearerAuth: []
 */
router.patch("/", authMiddleware, updateProfile);

module.exports = router;
