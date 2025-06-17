const express = require("express");
const { updateProductsInventory } = require("../controllers/productControllers.js");

const router = express.Router();

router.put("/products/:id/inventory", updateProductsInventory);

module.exports = router;