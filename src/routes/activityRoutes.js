const express = require("express");
const router = express.Router();
// 0604 黃馨: 文瑜~~我幫你用解構取方法 比較簡潔
const {getAllActivities,getActivityById,createActivity,updateActivity,deleteActivity} = require("../controllers/activityControllers.js");
const authMiddleware = require("../middleware/auth.js");

// 公開取得所有活動
router.get("/", getAllActivities);

// 需要授權的操作
router.get("/:id", authMiddleware, getActivityById);
router.post("/", authMiddleware, createActivity);
router.put("/:id", authMiddleware, updateActivity);
router.delete("/:id", authMiddleware, deleteActivity);

module.exports = router;
