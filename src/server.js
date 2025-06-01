const express = require("express");
const cors = require("cors");
const passport = require("./config/passport.js");
const dotenv = require("dotenv");
const authMiddleware = require("./middleware/auth.js");
const authController = require("./controllers/authControllers.js");
const activityRoutes = require("./routes/activityRoutes.js");
const editProfileRoutes = require("./routes/editProfileRoutes.js");
const photoRoutes = require("./routes/upload.js");

// 以下為即時聊天室新增模組
const http = require("http");
const { Server } = require("socket.io");
const setupSocket = require("./controllers/chatControllers.js");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());
app.use("/api", photoRoutes);

// API 在這設定前端打什麼 後端去執行哪個方法
app.post("/auth/register", authController.register);
app.post("/auth/login", authController.login);
app.post("/auth/refresh", authController.refresh);
app.get("/auth/google", authController.googleAuth);
app.get("/auth/google/callback", authController.googleAuthCallback);
app.use("/activities", activityRoutes);

// 測試需要 token 的 API
app.get("/api/me", authMiddleware, (req, res) => {
  res.json({ message: "驗證成功", user: req.user });
});

// 掛載子路由群組 REST API建議 以資源為單位
app.use("/api/profile", editProfileRoutes);
app.use("/api/photos", photoRoutes);
// 錯誤處理中間件（建議加入）
app.use((err, req, res, next) => {
  console.error("伺服器錯誤:", err.stack);
  res.status(500).json({ message: "伺服器錯誤，請稍後再試" });
});

app.listen(3000, () =>
  console.log("✅ Server running on http://localhost:3000")
);
