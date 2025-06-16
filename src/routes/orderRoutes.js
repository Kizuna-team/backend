const express = require("express");
const router = express.Router();
const { createOrder, confirmOrder } = require("../controllers/orderControllers.js");

router.post("/gift-orders", createOrder);
router.get("/confirm", confirmOrder);

module.exports = router;