const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const dayjs = require("dayjs");
const authRoutes = require("./routes/authRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoutes");
const activityRoutes = require("./routes/activityRoutes");
const authMiddleware = require("./middleware/auth.js");
const db = require("./db/index.js");
const {
  usersTable,
  subscriptionsTable,
  subscriptionPlansTable,
  friendshipsTable,
  messagesTable,
} = require("./db/schema.js");
const { eq, and, desc } = require("drizzle-orm");
const ecpayRoutes = require("./routes/ecpay");
const subPlansRoutes = require("./routes/subPlans");
const editPhotoRoutes = require("./routes/editPhotoRoutes.js");
const editProfileRoutes = require("./routes/editProfileRoutes");
const likeRoutes = require("./routes/likeRoutes.js");
const userProfileRoutes = require("./routes/userProfileRoutes.js");
const userPhotoRoutes = require("./routes/userPhotoRoutes.js");
const friendsRoutes = require("./routes/friends");
const adminRoutes = require("./routes/adminRoutes.js");
const paypalRoutes = require("./routes/paymentRoutes");
const setupSocket = require("./controllers/chatControllers_new.js");
const aiRoutes = require("./routes/ai");
const { getRoomMessages } = require("./lib/getRoomMessages.js");

// 以下為即時聊天室新增模組
const http = require("http");
const { Server } = require("socket.io");
// const setupSocket = require("./controllers/chatControllers.js");

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// 聊天室
const server = http.createServer(app);
// 設定 Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Socket.IO 連接邏輯
io.on("connection", (socket) => {
  const username = socket.user?.username || `User-${socket.id}`;
  console.log("User connected:", username);

  socket.username = username;

  socket.on("connect_error", (err) => {
    console.error("連線失敗", err.message);
  });
});

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/recommendations", recommendationRoutes);
app.use("/order", orderRoutes);
app.use("/products", productRoutes);
app.use("/activities", activityRoutes);
app.use("/admin", adminRoutes);

// 掛載子路由群組 REST API建議 以資源為單位
app.use("/profile/me", editProfileRoutes);
app.use("/photos/me", editPhotoRoutes);
app.use("/like/", likeRoutes);
app.use("/users/profile", userProfileRoutes);
app.use("/users/photos", userPhotoRoutes);
app.use("/friends", friendsRoutes);
app.use("/chat", aiRoutes);
app.use(express.urlencoded({ extended: true })); //  處理ecpay /notify 回傳(x-www-form-urlencoded)
app.use("/api/ecpay", ecpayRoutes);
app.use("/api/subPlans", subPlansRoutes);
app.use("/paypal", paypalRoutes);

app.get("/api/me", authMiddleware, async (req, res) => {
  try {
    //把使用者資料抓出來（基本資訊 + 訂閱方案名稱）
    const [user] = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        subscription_plan: usersTable.subscription_plan,
        subscription_name: subscriptionPlansTable.name,
      })
      // 拿著現在登入者的id 去找到 usersTable 對應的id (找到那位使用者)
      // 然後 usersTable 有存放該使用者目前的 訂閱等級 把該訂閱等級對應的方案名稱取出
      .from(usersTable)
      .leftJoin(
        subscriptionPlansTable,
        eq(usersTable.subscription_plan, subscriptionPlansTable.id)
      )
      .where(eq(usersTable.id, req.user.id));

    // 查訂單，抓最新一筆 paid
    const [latestPaidOrder] = await db
      .select({
        paid_at: subscriptionsTable.paid_at,
      })
      .from(subscriptionsTable)
      .where(
        and(
          eq(subscriptionsTable.user_id, req.user.id),
          eq(subscriptionsTable.status, "paid")
        )
      )
      .orderBy(desc(subscriptionsTable.paid_at))
      .limit(1);

    // 判斷會員資格是否過期
    // 判斷是否過期（測試用 2 分鐘）
    if (latestPaidOrder?.paid_at) {
      const paidAt = dayjs(latestPaidOrder.paid_at).tz("Asia/Taipei");
      const now = dayjs().tz("Asia/Taipei");

      console.log("paidAt:", paidAt.format("YYYY-MM-DD HH:mm:ss"));
      console.log("now:", now.format("YYYY-MM-DD HH:mm:ss"));

      const diffInMinutes = now.diff(paidAt, "minute");

      console.log("已過分鐘數:", diffInMinutes);

      // 測試用：如果已超過 2 分鐘 → 更新回免費方案
      if (diffInMinutes >= 2 && user.subscription_plan !== 1) {
        console.log("超過 2 分鐘，更新回免費方案");

        await db
          .update(usersTable)
          .set({
            subscription_plan: 1, // 免費方案 id = 1
          })
          .where(eq(usersTable.id, req.user.id));

        // 重新查一次最新的 subscription_plan
        const [updatedUser] = await db
          .select({
            subscription_plan: usersTable.subscription_plan,
            subscription_name: subscriptionPlansTable.name,
          })
          .from(usersTable)
          .leftJoin(
            subscriptionPlansTable,
            eq(usersTable.subscription_plan, subscriptionPlansTable.id)
          )
          .where(eq(usersTable.id, req.user.id));

        // 回傳更新後的 user
        return res.json({
          user: {
            username: user.username,
            subscription_plan: updatedUser.subscription_plan,
            subscription_name: updatedUser.subscription_name,
            paid_at: latestPaidOrder.paid_at,
          },
        });
      }
    }
    // 正常回傳 user（沒過期）
    res.json({
      user: {
        username: user.username,
        subscription_plan: user.subscription_plan,
        subscription_name: user.subscription_name,
        paid_at: latestPaidOrder?.paid_at ?? null,
      },
    });
  } catch (error) {
    console.error("無法取得會員資料", error);
    res.status(500).json({ message: "取得會員資料失敗" });
  }
});

app.get("/friendLists", authMiddleware, async (req, res) => {
  try {
    // 取得目前登入使用者的 ID
    const currentUserId = req.user.id;
    // console.log("現在登入房間的使用者:",currentUserId);
    // 查詢好友列表（好友名稱 + 聊天室 roomId）
    const friends = await db
      .select({
        friendId: friendshipsTable.friend_id,
        friendName: usersTable.username,
        roomId: friendshipsTable.room_id,
      })
      .from(friendshipsTable)
      .innerJoin(usersTable, eq(usersTable.id, friendshipsTable.friend_id))
      .where(eq(friendshipsTable.user_id, currentUserId));

    res.json({ friends });
  } catch (error) {
    console.error("無法取得好友列表", error);
    res.status(500).json({ message: "取得好友列表失敗" });
  }
});

app.get("/messages/:roomId", authMiddleware, async (req, res) => {
  const { roomId } = req.params;

  try {
    const messages = await getRoomMessages(roomId);
    res.json({ messages });
  } catch (error) {
    console.error("取得聊天室訊息失敗:", error);
    res.status(500).json({ message: "取得聊天室訊息失敗" });
  }
});

// 啟用 socket.io 聊天室邏輯
setupSocket(io);

server.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
