const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.js");
const {
  getMyPhoto,
  getPublicPhotos,
} = require("../controllers/userPhotosControllers");

router.get("/me", authMiddleware, getMyPhoto); // 撈自己的某張
router.get("/:userId", getPublicPhotos); // 撈多張別人照片

module.exports = router;
