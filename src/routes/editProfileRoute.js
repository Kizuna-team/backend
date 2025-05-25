// 定義 API 路由如何對應到 controller
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.js");
const {
  getProfile,
  updateProfile,
} = require("../controllers/editProfileController.js");

// 後端 API 是否有驗證 token，這些路由都需要先通過身份驗證才會執行
router.get("/", authMiddleware, getProfile);
router.put("/", authMiddleware, updateProfile);
module.exports = router;
