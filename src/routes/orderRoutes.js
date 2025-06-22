const express = require("express");
const router = express.Router();
const { createOrder, confirmOrder, getMyOrders } = require("../controllers/orderControllers.js");

router.post("/gift-orders", createOrder);
router.get("/confirm", confirmOrder);
router.get("/my-orders", getMyOrders);

module.exports = router;