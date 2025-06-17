const express = require("express");
const router = express.Router();
const { getProfileByUserId } = require("../controllers/profileControllers.js");

// router.get("/:userId", getProfileByUserId); 0613 測試 註解掉 by蕭

module.exports = router;
