const express = require("express");
const cors = require("cors");
const passport = require("./config/passport.js");
const dotenv = require("dotenv");
const authMiddleware = require("./middleware/auth.js");
const authController = require("./controllers/authControllers.js")
const activityRoutes=require("./routes/activityRoutes.js")

// 以下為即時聊天室新增模組
const http = require("http");
const { Server } = require("socket.io");
const setupSocket = require("./controllers/chatControllers.js");

dotenv.config();

const app = express();

// 讓 express 和 socket.io 共用一個 server
const server = http.createServer(app);
const io = new Server(server, {cors:{origin:"*"}});
// console.log(io);

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// API 在這設定前端打什麼 後端去執行哪個方法
app.post("/auth/register", authController.register);
app.post("/auth/login", authController.login);
app.post("/refresh", authController.refresh);
app.get("/auth/google", authController.googleAuth);
app.get("/auth/google/callback", authController.googleAuthCallback);
app.use('/activities', activityRoutes)

// 測試需要 token 的 API
app.get("/api/me", authMiddleware, (req, res) => {
  res.json({ message: "驗證成功", user: req.user });
});

// 啟用 socket.io 聊天室邏輯
setupSocket(io);

server.listen(3000, () =>
  console.log("✅ Server with Socket.io running on http://localhost:3000")
);
