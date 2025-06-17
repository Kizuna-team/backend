const express = require("express");
const { getRecommendations } = require("../controllers/recommendControllers");

const router = express.Router();

router.get("/:userId", getRecommendations);

module.exports = router;
