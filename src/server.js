const express = require("express");
const cors = require("cors");
// const passport = require("./config/passport.js");
const dotenv = require("dotenv");
const dayjs = require("dayjs");
const authRoutes = require("./routes/authRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoutes");
const activityRoutes = require("./routes/activityRoutes");
const authMiddleware = require("./middleware/auth.js");
const db = require("./db/index.js");
const { usersTable, subscriptionsTable, subscriptionPlansTable } = require("./db/schema.js");
const { eq, and, desc } = require("drizzle-orm");
const ecpayRoutes = require("./routes/ecpay");
const subPlansRoutes = require("./routes/subPlans");
const editPhotoRoutes = require("./routes/editPhotoRoutes.js");
const editProfileRoutes = require("./routes/editProfileRoutes");
const friendsRoutes = require("./routes/friends");


// 以下為即時聊天室新增模組
// const http = require("http");
// const { Server } = require("socket.io");
// const setupSocket = require("./controllers/chatControllers.js");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// 掛載 API router
app.use("/auth", authRoutes);
app.use("/recommendations", recommendationRoutes);
app.use("/order", orderRoutes);
app.use("/products", productRoutes);
app.use("/activities", activityRoutes);

// 掛載子路由群組 REST API建議 以資源為單位
app.use("/profile", editProfileRoutes);
app.use("/photos", editPhotoRoutes);
app.use("/api/friends", friendsRoutes);

app.use(express.urlencoded({ extended: true })); //  處理ecpay /notify 回傳(x-www-form-urlencoded)
app.use("/api/ecpay", ecpayRoutes);
app.use("/api/subPlans", subPlansRoutes);

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
    // 判斷是否過期（測試用 1 分鐘）
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
    console.error("❌ 無法取得會員資料", error);
    res.status(500).json({ message: "取得會員資料失敗" });
  }
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
