const express = require("express");
const router = express.Router();
const { createOrder } = require("../controllers/orderControllers.js");

router.post("/gift-orders", createOrder);

module.exports = router;