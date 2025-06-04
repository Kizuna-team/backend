const express = require("express");
const { register, login, refresh, googleAuth, googleAuthCallback } = require("../controllers/authControllers.js");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
// Google 認證
router.get("", googleAuth);
router.get("/callback",googleAuthCallback);

module.exports = router;