const express = require("express");
const router = express.Router();
const { createOrder, confirmOrder } = require("../controllers/orderControllers.js");

router.post("/gift-orders", createOrder);
// 新增一個確認付款的api
router.get("/confirm", confirmOrder);

module.exports = router;