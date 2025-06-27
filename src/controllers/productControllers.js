const { uploadFileToS3 } = require("../services/s3Service.js");
const db = require("../db/index.js");
const { productsTable } = require("../db/schema.js");
const { eq } = require("drizzle-orm");

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

async function createProduct(req, res) {
  try {
    const products = req.body;

    if (!Array.isArray(products)) {
      return res.status(400).json({ error: "請提供一個商品陣列" });
    }

    const insertedProducts = await db
      .insert(productsTable)
      .values(products)
      .returning();

    res.json(insertedProducts);
  } catch (err) {
    console.error("新增商品失敗", err);
    res.status(500).json({ error: "新增商品失敗" });
  }
}

async function getAllProducts(req, res) {
  try {
    const products = await db
      .select()
      .from(productsTable)
      .orderBy(productsTable.id);
    res.json(products);
  } catch (err) {
    console.error("讀取商品失敗", err);
    res.status(500).json({ error: "讀取商品失敗" });
  }
}

async function updateProductsInventory(req, res) {
  const productId = parseInt(req.params.id);
  const { inventory } = req.body;

  if (isNaN(productId) || typeof inventory !== "number") {
    return res.status(400).json({ error: "參數錯誤" });
  }

  try {
    await db
      .update(productsTable)
      .set({ inventory })
      .where(eq(productsTable.id, productId));

    res.json({ success: true, message: "庫存已更新" });
  } catch (err) {
    console.err("庫存更新失敗原因：", err);
    req.status(500).json({ error: "庫存更新失敗" });
  }
}

module.exports = {
  uploadProductImage,
  createProduct,
  getAllProducts,
  updateProductsInventory,
};
