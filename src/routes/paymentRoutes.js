const express = require("express");
const router = express.Router();
const paypalOrderControllers = require("../controllers/paypalOrderControllers");

router.post("/paypal/create-order", paypalOrderControllers.createPayPalOrder);
router.post("/paypal/capture-order", paypalOrderControllers.capturePayPalOrder);

module.exports = router;
