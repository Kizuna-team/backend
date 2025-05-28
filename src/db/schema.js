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
} = require("drizzle-orm/pg-core");

// 使用者(註冊登入)表格 和個人介面的資料分開
const usersTable = pgTable("users", {
  id: serial().primaryKey().notNull(),
  username: varchar({ length: 100 }).notNull(),
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

module.exports = {
  usersTable,
  messagesTable,
  activities,
  photosTable,
};
