const { uploadFileToS3 } = require("../services/s3Service.js");
const db = require("../db/index.js");
const { productsTable } = require("../db/schema.js");
const { eq } = require("drizzle-orm");

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
    // 因為 postgresql 預設查詢結果 不保證順序性 但我要商品依照 id 排序 
    // 所以加上 orderBy
    const products = await db.select().from(productsTable).orderBy(productsTable.id);
    res.json(products);
  } catch (err) {
    console.error("讀取商品失敗", err);
    res.status(500).json({ error: "讀取商品失敗" });
  }
}

// 0613 黃馨
async function updateProductsInventory(req, res) {
  const productId = parseInt(req.params.id);
  const { inventory } = req.body;

  if (isNaN(productId) || typeof inventory !== "number") {
    return res.status(400).json({ error: "參數錯誤" });
  }
  
  try {
    await db.update(productsTable).set({ inventory }).where(eq(productsTable.id, productId));

    res.json({ success: true, message: "庫存已更新" });
  } catch (err) {
    console.err("庫存更新失敗原因：", err);
    req.status(500).json({ error: "庫存更新失敗" });
  }
}

module.exports = { uploadProductImage, createProduct, getAllProducts, updateProductsInventory };
