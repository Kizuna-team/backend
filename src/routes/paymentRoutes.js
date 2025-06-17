const express = require("express");
const router = express.Router();
const paypalOrderControllers = require("../controllers/paypalOrderControllers");

router.post("/create-order", paypalOrderControllers.createPayPalOrder);
router.post("/capture-order", paypalOrderControllers.capturePayPalOrder);
router.get("/success", paypalOrderControllers.paypalSuccess);
router.get("/cancel", paypalOrderControllers.paypalCancel);

module.exports = router;