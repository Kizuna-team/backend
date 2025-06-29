const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

const {
  getAllActivities,
  getMyActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  getMyJoinActivity,
  postJoinActivity,
  deleteJoinActivity,
  searchActivitiesStatus,
} = require("../controllers/activityControllers.js");

const authMiddleware = require("../middleware/auth.js");

// 公開取得所有活動
/**
 * @swagger
 * /activities:
 *   get:
 *     summary: 取得所有活動（公開）
 *     tags: [Activity]
 */
router.get("/", getAllActivities);

// 需要授權的操作 使用者創建/編輯/刪除活動

/**
 * @swagger
 * /activities/my:
 *   get:
 *     summary: 取得我建立的活動
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 */
router.get("/my", authMiddleware, getMyActivities);
/**
 * @swagger
 * /activities/me:
 *   get:
 *     summary: 取得我參加的活動
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 */
router.get("/me", authMiddleware, getMyJoinActivity);
/**
 * @swagger
 * /activities/{id}:
 *   get:
 *     summary: 查詢單一活動（編輯）
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get("/:id", getActivityById);
/**
 * @swagger
 * /activities:
 *   post:
 *     summary: 建立新活動
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", authMiddleware, upload.single("image"), createActivity);
/**
 * @swagger
 * /activities/{id}:
 *   put:
 *     summary: 更新活動
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.put("/:id", authMiddleware, upload.single("image"), updateActivity);
/**
 * @swagger
 * /activities/{id}:
 *   delete:
 *     summary: 刪除活動
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.delete("/:id", authMiddleware, deleteActivity);

//使用者(操作)加入/取消參與活動(資源)
/**
 * @swagger
 * /activities/join/{id}:
 *   post:
 *     summary: 參加活動
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.post("/join/:id", authMiddleware, postJoinActivity);
/**
 * @swagger
 * /activities/join/{id}:
 *   delete:
 *     summary: 取消參加活動
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.delete("/join/:id", authMiddleware, deleteJoinActivity);
router.post("/status", authMiddleware, searchActivitiesStatus)
module.exports = router;