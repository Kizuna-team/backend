const express = require("express");
const cors = require("cors");
const passport = require("./config/passport.js");
const dotenv = require("dotenv");
const authMiddleware = require("./middleware/auth.js");
const authController = require("./controllers/authControllers.js");
const activityRoutes = require("./routes/activityRoutes.js");
const editProfileRoutes = require("./routes/editProfileRoutes.js");
const photoRoutes = require("./routes/upload.js");
const authRoutes = require("./routes/authRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");

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

// 掛載 API router
app.use("/auth", authRoutes);
app.use("/recommendations", recommendationRoutes);

// 掛載子路由群組 REST API建議 以資源為單位
app.use("/api/profile", editProfileRoutes);
app.use("/api/photos", photoRoutes);
// 錯誤處理中間件（建議加入）
app.use((err, req, res, next) => {
  console.error("伺服器錯誤:", err.stack);
  res.status(500).json({ message: "伺服器錯誤，請稍後再試" });
});

// 啟用 socket.io 聊天室邏輯
// setupSocket(io);

// 錯誤處理中間件（建議加入）
app.use((err, req, res, next) => {
  console.error("伺服器錯誤:", err.stack);
  res.status(500).json({ message: "伺服器錯誤，請稍後再試" });
});

app.listen(3000, () =>
  console.log("✅ Server running on http://localhost:3000")
);
