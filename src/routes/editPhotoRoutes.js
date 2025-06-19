const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.js");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const {
  uploadImage,
  getPhotos,
  deletePhoto,
  getMyAvatarPhoto,
  changeAvatar,
} = require("../controllers/editPhotosControllers.js");

/**
 * @swagger
 * /photos/me:
 *   get:
 *     summary: 取得我的照片列表
 *     tags: [Photo Management]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", authMiddleware, getPhotos);
/**
 * @swagger
 * /photos/me/avatar:
 *   get:
 *     summary: 取得我的大頭貼
 *     tags: [Photo Management]
 *     security:
 *       - bearerAuth: []
 */
router.get("/avatar", authMiddleware, getMyAvatarPhoto);
/**
 * @swagger
 * /photos/me/avatar:
 *   patch:
 *     summary: 更換大頭貼
 *     tags: [Photo Management]
 *     security:
 *       - bearerAuth: []
 */
router.patch("/avatar", authMiddleware, changeAvatar);
/**
 * @swagger
 * /photos/me:
 *   post:
 *     summary: 上傳照片
 *     tags: [Photo Management]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", authMiddleware, upload.single("image"), uploadImage);
/**
 * @swagger
 * /photos/me/{key}:
 *   delete:
 *     summary: 刪除照片
 *     tags: [Photo Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 */
router.delete("/:key", authMiddleware, deletePhoto);

module.exports = router; 
