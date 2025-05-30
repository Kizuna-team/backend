const {
  pgTable,
  serial,
  varchar,
  char,
  integer,
  text,
  foreignKey,
  timestamp,
  date,
  pgEnum
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
  image_url: varchar("image_url", { length: 255 }),
  image_key: varchar("image_key", { length: 255 }),
  uploaded_at: timestamp("uploaded_at").defaultNow(),
});

// 使用者個人檔案
// 以 userId 當作唯一識別
const orientationEnum = pgEnum('orientation_enum', ['異性戀', '同性戀', '雙性戀']);
// 使用者個人簡介(地區、興趣)
const profileTable = pgTable("profiles", {
  userId: integer("user_id")
    .primaryKey()
    .notNull()
    .references(() => usersTable.id),
  name: varchar("name", { length: 15 }).notNull(),
  gender: varchar("gender", { length: 8 }).notNull(),
  orientation: orientationEnum("orientation").notNull(),
  bio: varchar({ length: 255 }),
  age: integer("age").notNull(),
  location: varchar("location", { length: 31 }).notNull(),
  zodiac: varchar("zodiac", { length: 15 }),
  mbti: varchar("mbti", { length: 5 }),
  job: varchar("job", { length: 15 }),
  interests: varchar("interests", { length: 50 }).array().notNull(),
  last_active_at: timestamp({withTimezone: true}).defaultNow().notNull(),
});

module.exports = {
  usersTable,
  messagesTable,
  activities,
  photosTable,
  profileTable,
  orientationEnum
};

  