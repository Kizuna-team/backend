const express = require("express");
const router = express.Router();
const { createOrder, confirmOrder, getMyOrders } = require("../controllers/orderControllers.js");

/**
 * @swagger
 * /order/gift-orders:
 *   post:
 *     summary: 建立禮物訂單
 *     tags: [Order]
 */
router.post("/gift-orders", createOrder);
/**
 * @swagger
 * /order/confirm:
 *   get:
 *     summary: 確認訂單
 *     tags: [Order]
 */
router.get("/confirm", confirmOrder);
router.get("/my-orders", getMyOrders);

module.exports = router;