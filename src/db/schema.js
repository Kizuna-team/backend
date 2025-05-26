const {
  pgTable,
  serial,
  varchar,
  char,
  integer,
  text,
  foreignKey,
  timestamp,
} = require("drizzle-orm/pg-core");

// 使用者表格
const usersTable = pgTable("users", {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 100 }).notNull(),
  password: varchar({ length: 255 }).notNull(),
  raw_password: varchar({ length: 20 }).notNull(),
  //   gender: char({ length: 1 }),
  //   age: integer(),
  //   description: text()
});

// 保存訊息的表格
const messagesTable = pgTable("messages", {
  id: serial().primaryKey().notNull(),
  room_id: integer.notNull(),
  sender_id: integer.notNull(),
  content: varchar({ length: 255 }).notNull(),
  created_at: timestamp().defaultNow().notNull(),
});
