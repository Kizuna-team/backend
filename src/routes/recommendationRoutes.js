// src/routes/recommendationRoutes.js
const express = require("express");
const { getRecommendations } = require("../controllers/recommendControllers");

const router = express.Router();

router.get("/", getRecommendations);

module.exports = router;
