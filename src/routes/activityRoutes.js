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
} = require("../controllers/activityControllers.js");

const authMiddleware = require("../middleware/auth.js");

// 公開取得所有活動
router.get("/", getAllActivities);

// 需要授權的操作 使用者創建/編輯/刪除活動
router.get("/my", authMiddleware, getMyActivities);
router.get("/me", authMiddleware, getMyJoinActivity);
router.get("/:id", authMiddleware, getActivityById);
router.post("/", authMiddleware, upload.single("image"), createActivity);
router.put("/:id", authMiddleware, upload.single("image"), updateActivity);
router.delete("/:id", authMiddleware, deleteActivity);

//使用者(操作)加入/取消參與活動(資源)
router.post("/join/:id", authMiddleware, postJoinActivity);
router.delete("/join/:id", authMiddleware, deleteJoinActivity);
module.exports = router;
