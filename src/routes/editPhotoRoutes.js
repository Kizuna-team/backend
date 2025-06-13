const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.js");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const {
  uploadImage,
  getPhotos,
  deletePhoto,
} = require("../controllers/editPhotosControllers.js");

router.post("/", authMiddleware, upload.single("image"), uploadImage);
router.get("/", authMiddleware, getPhotos);
router.delete("/:key", authMiddleware, deletePhoto);

module.exports = router;
