const {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  date,
  text,
  unique,
  boolean,
} = require("drizzle-orm/pg-core");

// 使用者(註冊登入)表格 和個人介面的資料分開
// 0605 修改 username 長度 因為google登入也要存資料
const usersTable = pgTable("users", {
  id: serial().primaryKey().notNull(),
  username: varchar({ length: 50 }).notNull(),
  password: varchar({ length: 255 }).notNull(),
  subscription_plan: integer().references(() => subscriptionPlansTable.id), // 預設掛免費方案（id = 1）付費是2
});

const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  date: timestamp("date").notNull(),
  description: text("description").notNull(),
  created_by_id: integer("created_by_id")
    .notNull()
    .references(() => usersTable.id),
  created_at: timestamp("created_at").defaultNow(),
  image_url: varchar("image_url", { length: 255 }),
});
//上傳照片
const photosTable = pgTable("photos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => usersTable.id)
    .notNull(),
  image_url: varchar("image_url", { length: 255 }),
  image_key: varchar("image_key", { length: 255 }),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  sequence: integer("sequence"),
  is_avatar: boolean("is_avatar").default(false), // 讓使用者指定頭像
  source: varchar("source", { length: 20 }).default("user"), // 預設隨機大頭照
});

// 使用者個人檔案
// 以 userId 當作唯一識別
const profileTable = pgTable("profiles", {
  userId: integer("user_id")
    .primaryKey()
    .notNull()
    .references(() => usersTable.id),
  name: varchar("name", { length: 15 }).notNull(),
  gender: varchar("gender", { length: 8 }).notNull(),
  orientation: integer("orientation").notNull(),
  bio: varchar({ length: 255 }),
  age: integer("age").notNull(),
  location: varchar("location", { length: 31 }).notNull(),
  zodiac: varchar("zodiac", { length: 15 }),
  mbti: varchar("mbti", { length: 5 }),
  job: varchar("job", { length: 15 }),
  interests: varchar({ length: 15 }).array().notNull(),
  last_active_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

// 網站中有販售的商品表格
const productsTable = pgTable("products", {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 100 }).notNull(),
  price: integer().notNull(),
  description: varchar({ length: 255 }).notNull(),
  image_url: varchar({ length: 255 }).notNull(),
  inventory: integer().notNull(),
  created_at: timestamp().defaultNow().notNull(),
  category: varchar("category", { length: 100 }),
  sales: integer("sales").default(0),
});

// 訂單表( 1筆 = 一次送禮行為 )
const giftOrdersTable = pgTable("gift_orders", {
  // 這邊的 id 是訂單流水編號（ 內部用 ）
  id: serial().primaryKey().notNull(),
  // 對外公告的訂單編號
  order_id: varchar("order_id", { length: 40 }).notNull().unique(),
  sender_id: integer()
    .notNull()
    .references(() => usersTable.id),
  receiver_id: integer()
    .notNull()
    .references(() => usersTable.id),
  status: varchar("status", { length: 20 }).default("pending"),
  // LINE Pay transactionId
  transaction_id: varchar("transaction_id", { length: 100 }),
  // 訂單金額
  amount: integer("amount").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// 訂單明細( 1筆 = 一個商品 + 買的數量)
const orderItemsTable = pgTable("order_items", {
  id: serial().primaryKey().notNull(),
  gift_order_id: integer()
    .notNull()
    .references(() => giftOrdersTable.id),
  product_id: integer()
    .notNull()
    .references(() => productsTable.id),
  quantity: integer().notNull(),
});

// 紀錄使用者對另一個使用者的喜歡與不喜歡狀態;
const likesTable = pgTable(
  "likes",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id),
    targetId: integer("target_id")
      .notNull()
      .references(() => usersTable.id),
    status: integer("status").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (likes) => ({
    uniqueLike: unique().on(likes.userId, likes.targetId),
  })
);

// 紀錄 Super Like的使用紀錄，限制使用次數 1次 | 付費 5次
const superLikesTable = pgTable("super_likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id),
  targetId: integer("target_id")
    .notNull()
    .references(() => usersTable.id),
  usedAt: date("used_at", { mode: "date" }).notNull(),
});

// 雙向配對成功紀錄，可以直接查表撈取雙方資料
// 在插入資料時用程式邏輯保證 matchUserAId < matchUserBId
const matchesTable = pgTable("matches", {
  id: serial("id").primaryKey(),
  matchUserAId: integer("match_user_a_id")
    .notNull()
    .references(() => usersTable.id),
  matchUserBId: integer("match_user_b_id")
    .notNull()
    .references(() => usersTable.id),
  matchedAt: timestamp("matched_at").defaultNow().notNull(),
});

// 訂閱( 訂單 )資料
const subscriptionPlansTable = pgTable("subscription_plans", {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 50 }).notNull(),
  price: integer().notNull(),
  description: varchar({ length: 255 }).default("尚未填寫描述"),
});

const subscriptionsTable = pgTable("subscriptions", {
  id: serial().primaryKey().notNull(),
  user_id: integer()
    .notNull()
    .references(() => usersTable.id),
  plan: varchar({ length: 20 }).notNull(),
  price: integer().notNull(),
  status: varchar({ length: 20 }).notNull(), // 狀態：pending, paid
  merchanttradeno: varchar({ length: 30 }).notNull(), // 綠界自訂編號（不能重複）
  trade_no: varchar({ length: 30 }), // 綠界平台回傳的交易編號
  paid_at: timestamp(),
  created_at: timestamp().defaultNow().notNull(),
  start_date: timestamp("start_date", { withTimezone: true }).notNull(),
  end_date: timestamp("end_date", { withTimezone: true }).notNull(),
});

const friendRequestsTable = pgTable("friend_requests", {
  id: serial("id").primaryKey(),
  from_id: integer("from_id").notNull(),
  to_id: integer("to_id").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

const friendshipsTable = pgTable("friendships", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  friend_id: integer("friend_id").notNull(),
  // 預計成為好友後 自動用uuid生成房間ID
  room_id: varchar("room_id", { length: 255 }),
  created_at: timestamp("created_at").defaultNow(),
});

const chatRoomsTable = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  user1_id: integer("user1_id").references(() => usersTable.id),
  user2_id: integer("user2_id").references(() => usersTable.id)
});

// 保存聊天訊息的表格
const messagesTable = pgTable("messages", {
  id: serial().primaryKey().notNull(),
  room_id: text("room_id"),
  sender_id: integer("sender_id").references(()=>usersTable.id),
  content: varchar({ length: 255 }).notNull(),
  created_at: timestamp().defaultNow(),
});

module.exports = {
  usersTable,
  messagesTable,
  activities,
  photosTable,
  profileTable,
  productsTable,
  giftOrdersTable,
  orderItemsTable,
  likesTable,
  superLikesTable,
  matchesTable,
  subscriptionPlansTable,
  friendRequestsTable,
  subscriptionsTable,
  friendshipsTable,
  chatRoomsTable,
};
