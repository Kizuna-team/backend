const express = require("express");
const router = express.Router();
const { getProfileByUserId } = require("../controllers/profileControllers.js");

router.get("/:userId", getProfileByUserId);

module.exports = router;