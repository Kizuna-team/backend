const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const {
  uploadImage,
  getPhotos,
  deletePhoto,
} = require("../controllers/uploadController");

router.post("/", upload.single("image"), uploadImage);
router.get("/", getPhotos);
router.delete("/:key", deletePhoto);

module.exports = router;
