const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.js");
const {
  getMatchPhotos,
  getAvatarPhoto,
} = require("../controllers/userPhotosControllers");

// 從別人 userId 撈出 1～3 張照片（非大頭貼
router.get("/match/:userId", authMiddleware, getMatchPhotos);
router.get("/avatar", authMiddleware, getAvatarPhoto);

module.exports = router;
