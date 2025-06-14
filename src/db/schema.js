const { boolean } = require("drizzle-orm/gel-core");
const {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  date,
  text,
  unique,
} = require("drizzle-orm/pg-core");

// 使用者(註冊登入)表格 和個人介面的資料分開
const usersTable = pgTable("users", {
  id: serial().primaryKey().notNull(),
  username: varchar({ length: 20 }).notNull(),
  password: varchar({ length: 255 }).notNull(),
  raw_password: varchar({ length: 20 }).notNull(),
});

// 保存訊息的表格
const messagesTable = pgTable("messages", {
  id: serial().primaryKey().notNull(),
  room_id: integer().notNull(),
  sender_id: integer().notNull(),
  content: varchar({ length: 255 }).notNull(),
  created_at: timestamp().defaultNow().notNull(),
});

const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  date: date("date").notNull(),
  description: text("description"),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow(),
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
});

// 使用者個人檔案
// 以 userId 當作唯一識別
// const orientationEnum = pgEnum("orientation_enum", [
//   "異性戀",
//   "同性戀",
//   "雙性戀",
// ]);
// 使用者個人簡介(地區、興趣)
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
  // 這邊的 id 是訂單流水編號
  id: serial().primaryKey().notNull(),
  sender_id: integer()
    .notNull()
    .references(() => usersTable.id),
  receiver_id: integer()
    .notNull()
    .references(() => usersTable.id),
  // status:
  created_at: timestamp().defaultNow(),
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
  userId: integer("user_id").notNull(),
  targetId: integer("target_id").notNull(),
  usedAt: date("used_at", { mode: "date" }).notNull(),
});

// 使用者成為訂閱會員紀錄
const membersTable = pgTable("members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }) // 成為會員的日期+時間 = 訂單時間？
    .defaultNow()
    .notNull(),
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

// 避免重複配對
// const uniqueMatch = unique("matches_unique").on(
//   matchesTable.matchUserAId,
//   matchesTable.matchUserBId
// );
// 排序訊息、最新配對在最上面
// const matchedAtIdx = index("matched_at_index").on(matchesTable.matchedAt);

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
  membersTable,
  matchesTable,
};
