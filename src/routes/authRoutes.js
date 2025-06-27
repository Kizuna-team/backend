const express = require("express");
const {
  register,
  login,
  refresh,
  googleAuth,
  googleLogin,
  googleCallback,
} = require("../controllers/authControllers.js");

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: 使用者註冊
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "newuser123"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: 註冊成功
 *       400:
 *         description: 使用者名稱已存在
 */
router.post("/register", register);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 使用者登入
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "user123"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: 登入成功，回傳 token 和使用者資訊
 *       401:
 *         description: 帳號密碼錯誤
 */
router.post("/login", login);
/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: 刷新 Access Token
 *     description: 需要先透過 /auth/login 取得 refreshToken
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: 成功刷新 Token
 *       401:
 *         description: Refresh Token 無效或過期
 */
router.post("/refresh", refresh);

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Google 第三方登入
 *     description: 需先透過前端 Google One Tap 或 Google Sign-in 取得 credential
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               credential:
 *                 type: string
 *                 description: Google ID Token
 *                 example: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2NzAyN..."
 *     responses:
 *       200:
 *         description: Google 登入成功，回傳 token 和使用者資訊
 *       400:
 *         description: Google 登入失敗
 */
router.post("/google", googleLogin);

module.exports = router;
