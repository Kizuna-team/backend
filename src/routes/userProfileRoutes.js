const express = require("express");
const router = express.Router();
const { getProfileById } = require("../controllers/userProfileControllers");

router.get("/profile/:userId", getProfileById);

module.exports = router;
