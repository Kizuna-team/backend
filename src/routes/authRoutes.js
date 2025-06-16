const express = require("express");
const { register, login, refresh, googleAuth, googleLogin, googleCallback } = require("../controllers/authControllers.js");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
// Google 第三方登入 使用 Google One Tap/Sign-in Button
router.post("/google", googleLogin);

module.exports = router;