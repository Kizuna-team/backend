const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.js");

const {
  getProfileById,
  getAllProfiles,
} = require("../controllers/userProfileControllers");

// 查看所有人的檔案資
router.get("/", authMiddleware, getAllProfiles);

// 查看指定某人的檔案資訊
router.get("/:userId", authMiddleware, getProfileById);

module.exports = router;
