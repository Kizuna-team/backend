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
  profileTable,
  photosTable,
} = require("./db/schema.js");

const { eq, and, desc } = require("drizzle-orm");
const ecpayRoutes = require("./routes/ecpay.js");
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
const matchesRoutes = require("./routes/matchesRoutes.js");
const userFilterRoutes = require("./routes/userFilterRoutes.js");

const { swaggerUi, specs } = require("./swagger.js");

const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const PORT = process.env.PORT;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

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
app.use("/order", orderRoutes);
app.use("/products", productRoutes);
app.use("/activities", activityRoutes);
app.use("/admin", adminRoutes);

app.use("/profile/me", editProfileRoutes);
app.use("/photos/me", editPhotoRoutes);
app.use("/like/", likeRoutes);
app.use("/users/profile", userProfileRoutes);
app.use("/users/photos", userPhotoRoutes);
app.use("/friends", friendsRoutes);
app.use("/chat", aiRoutes);
app.use(express.urlencoded({ extended: true }));
app.use("/api/ecpay", ecpayRoutes);
app.use("/api/subPlans", subPlansRoutes);
app.use("/paypal", paypalRoutes);
app.use("/matches", matchesRoutes);
app.use("/user-filter", userFilterRoutes);
app.use("/recommend", recommendationRoutes);
/**
 * @swagger
 * /api/me:
 *   get:
 *     summary: 取得當前使用者資料
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功取得使用者資料
 *       500:
 *         description: 取得會員資料失敗
 */
app.get("/api/me", authMiddleware, async (req, res) => {
  try {
    const [user] = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        subscription_plan: usersTable.subscription_plan,
        subscription_name: subscriptionPlansTable.name,
      })
      .from(usersTable)
      .leftJoin(
        subscriptionPlansTable,
        eq(usersTable.subscription_plan, subscriptionPlansTable.id)
      )
      .where(eq(usersTable.id, req.user.id));

    const [latestPaidOrder] = await db
      .select({
        end_date: subscriptionsTable.end_date,
      })
      .from(subscriptionsTable)
      .where(
        and(
          eq(subscriptionsTable.user_id, req.user.id),
          eq(subscriptionsTable.status, "paid")
        )
      )
      .orderBy(desc(subscriptionsTable.end_date))
      .limit(1);

    if (latestPaidOrder?.end_date) {
      const endDate = dayjs.utc(latestPaidOrder.end_date);
      const now = dayjs.utc();

      if (now.isAfter(endDate) && user.subscription_plan !== 1) {
        await db
          .update(usersTable)
          .set({ subscription_plan: 1 })
          .where(eq(usersTable.id, req.user.id));

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

        console.log("重新更新過的使用者資料:", updatedUser);
        return res.json({
          user: {
            username: user.username,
            subscription_plan: updatedUser.subscription_plan,
            subscription_name: updatedUser.subscription_name,
            end_date: latestPaidOrder.end_date,
          },
        });
      }
    }
    res.json({
      user: {
        username: user.username,
        subscription_plan: user.subscription_plan,
        subscription_name: user.subscription_name,
        end_date: latestPaidOrder?.end_date ?? null,
      },
    });
  } catch (error) {
    console.error("無法取得會員資料", error);
    res.status(500).json({ message: "取得會員資料失敗" });
  }
});

app.get("/friendLists", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    console.log("現在登入房間的使用者:", currentUserId);

    const friends = await db
      .select({
        friendId: friendshipsTable.friend_id,
        roomId: friendshipsTable.room_id,
        name: profileTable.name,
        avatarUrl: photosTable.image_url,
      })
      .from(friendshipsTable)
      .innerJoin(
        profileTable,
        eq(profileTable.userId, friendshipsTable.friend_id)
      )
      .leftJoin(
        photosTable,
        and(
          eq(photosTable.userId, friendshipsTable.friend_id),
          eq(photosTable.is_avatar, true)
        )
      )
      .where(eq(friendshipsTable.user_id, currentUserId));

    console.log(friends);

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

setupSocket(io);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Kizuna 交友平台 API 文件",
  })
);

server.listen(PORT, () =>
  console.log(` Server running on http://localhost:${PORT}`)
);
