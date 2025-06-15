const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.js");
const {
  getMatchPhotos,
  getAvatarPhoto,
} = require("../controllers/userPhotosControllers");

router.get("/match", authMiddleware, getMatchPhotos);
router.get("/avatar", authMiddleware, getAvatarPhoto);

module.exports = router;
