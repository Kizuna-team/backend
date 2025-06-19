const express = require("express");
const multer = require("multer");
const { uploadProductImage, createProduct, getAllProducts } = require("../controllers/productControllers.js");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /products/upload:
 *   post:
 *     summary: 上傳商品圖片
 *     tags: [Product]
 */
router.post("/upload", upload.single("image"), uploadProductImage);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: 建立商品
 *     tags: [Product]
 */
router.post("/", createProduct);

/**
 * @swagger
 * /products:
 *   get:
 *     summary: 取得所有商品
 *     tags: [Product]
 */
router.get("/", getAllProducts);

module.exports = router;