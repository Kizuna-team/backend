const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.js");
const {
  getMatchPhotos,
  getAvatarPhoto,
} = require("../controllers/userProfileControllers");

router.get("/match", authMiddleware, getMatchPhotos);
router.patch("/avatar", authMiddleware, getAvatarPhoto);

module.exports = router;
