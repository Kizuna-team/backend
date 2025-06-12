const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const {
  uploadImage,
  getPhotos,
  deletePhoto,
} = require("../controllers/editPhotosControllers.js");

router.post("/", upload.single("image"), uploadImage);
router.get("/", getPhotos);
router.delete("/:key", deletePhoto);

module.exports = router;

// 改
// router.post("/me/photos", authMiddleware, upload.single("image"), uploadImage); // 上傳
// router.delete("/me/photos/:key", authMiddleware, deletePhoto); // 刪除
