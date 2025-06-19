const express = require("express");
const { register, login, refresh, googleAuth, googleLogin, googleCallback } = require("../controllers/authControllers.js");

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: 使用者註冊
 *     tags: [Authentication]
 */
router.post("/register", register);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 使用者登入
 *     tags: [Authentication]
 */
router.post("/login", login);
/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: 刷新 Token
 *     tags: [Authentication]
 */
router.post("/refresh", refresh);
// Google 第三方登入 使用 Google One Tap/Sign-in Button

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Google 第三方登入
 *     tags: [Authentication]
 */
router.post("/google", googleLogin);

module.exports = router;