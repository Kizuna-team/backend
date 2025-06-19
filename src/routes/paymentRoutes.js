const express = require("express");
const router = express.Router();
const paypalOrderControllers = require("../controllers/paypalOrderControllers");

/**
 * @swagger
 * /paypal/create-order:
 *   post:
 *     summary: 建立 PayPal 訂單
 *     tags: [PayPal Payment]
 */
router.post("/create-order", paypalOrderControllers.createPayPalOrder);
/**
 * @swagger
 * /paypal/capture-order:
 *   post:
 *     summary: 確認 PayPal 付款
 *     tags: [PayPal Payment]
 */
router.post("/capture-order", paypalOrderControllers.capturePayPalOrder);
/**
 * @swagger
 * /paypal/success:
 *   get:
 *     summary: PayPal 付款成功回調
 *     tags: [PayPal Payment]
 */
router.get("/success", paypalOrderControllers.paypalSuccess);
/**
 * @swagger
 * /paypal/cancel:
 *   get:
 *     summary: PayPal 付款取消
 *     tags: [PayPal Payment]
 */
router.get("/cancel", paypalOrderControllers.paypalCancel);

module.exports = router;