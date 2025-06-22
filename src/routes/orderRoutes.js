const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.js");
const { createOrder, confirmOrder,getReceivedGifts, } = require("../controllers/orderControllers.js");


router.post("/gift-orders", createOrder);
router.get("/confirm", confirmOrder);
router.get("/received", authMiddleware, getReceivedGifts);

module.exports = router;