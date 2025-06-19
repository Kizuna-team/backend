const express = require("express");
const { updateProductsInventory } = require("../controllers/productControllers.js");

const router = express.Router();
/**
 * @swagger
 * /admin/products/{id}/inventory:
 *   put:
 *     summary: 更新商品庫存
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.put("/products/:id/inventory", updateProductsInventory);

module.exports = router;