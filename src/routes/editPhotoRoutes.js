const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.js");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const {
  uploadImage,
  getPhotos,
  deletePhoto,
  getMyAvatarPhoto,
} = require("../controllers/editPhotosControllers.js");

router.get("/", authMiddleware, getPhotos);
router.get("/avatar", authMiddleware, getMyAvatarPhoto);
router.post("/", authMiddleware, upload.single("image"), uploadImage);
router.delete("/:key", authMiddleware, deletePhoto);

module.exports = router;
