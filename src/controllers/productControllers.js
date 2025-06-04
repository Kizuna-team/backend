const { uploadFileToS3 } = require("../services/s3Service.js");
const db = require("../db/index.js");
const { productsTable } = require("../db/schema.js");

// 上傳圖片
async function uploadProductImage(req, res) {
  try {
    const file = req.file;
    const imageUrl = await uploadFileToS3(file);
    res.json({ imageUrl });
  } catch (err) {
    console.error("圖片上傳失敗", err);
    res.status(500).json({ error: "圖片上傳失敗" });
  }
}

// 新增商品
async function createProduct(req, res) {
  try {
    // 前端傳陣列過來
    const products = req.body;

    // 檢查是否為陣列
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: "請提供一個商品陣列" });
    }

    const insertedProducts = await db.insert(productsTable).values(products).returning();

    res.json(insertedProducts);
  } catch (err) {
    console.error("新增商品失敗", err);
    res.status(500).json({ error: "新增商品失敗" });
  }
}

// 取得所有商品
async function getAllProducts(req, res) {
  try {
    const products = await db.select().from(productsTable);
    res.json(products);
  } catch (err) {
    console.error("讀取商品失敗", err);
    res.status(500).json({ error: "讀取商品失敗" });
  }
}

module.exports = { uploadProductImage, createProduct, getAllProducts };
