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
} = require("../controllers/activityControllers.js");

const authMiddleware = require("../middleware/auth.js");

// 公開取得所有活動
router.get("/", getAllActivities);

// 需要授權的操作
router.get("/my", authMiddleware, getMyActivities);
router.get('/:id', authMiddleware, getActivityById);
router.post("/", authMiddleware, upload.single("image"), createActivity);
router.put("/:id", authMiddleware, upload.single("image"), updateActivity);
router.delete("/:id", authMiddleware, deleteActivity);

module.exports = router;
