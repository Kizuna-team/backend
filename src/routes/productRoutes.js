const express = require("express");
const multer = require("multer");
const { uploadProductImage, createProduct, getAllProducts } = require("../controllers/productControllers.js");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("image"), uploadProductImage);

router.post("/", createProduct);

router.get("/", getAllProducts);

module.exports = router;