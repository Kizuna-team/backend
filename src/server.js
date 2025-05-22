const express = require("express");
const cors = require("cors");
const passport = require("./config/passport.js");
const dotenv = require("dotenv");
const authMiddleware = require("./middleware/auth.js");
const authController = require("./controllers/authControllers.js");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(passport.initialize());

// API 在這設定前端打什麼 後端去執行哪個方法
app.post("/api/register", authController.register);
app.post("/api/login", authController.login);
app.post("/api/refresh", authController.refresh);
app.get("/auth/google",authController.googleAuth);
app.get("/auth/google/callback",authController.googleAuthCallback);

// 測試需要 token 的 API
app.get("/api/me", authMiddleware, (req, res) => {
  res.json({ message: "驗證成功", user: req.user });
});

app.listen(3000, () =>
  console.log("✅ Server running on http://localhost:3000")
);
