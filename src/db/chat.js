const {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
} = require("drizzle-orm/pg-core");

// 使用者表
const users = pgTable("users", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull().unique(),
  username: varchar("username", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }),
  avatarUrl: varchar("avatar_url", { length: 255 }),
  lastSeen: timestamp("last_seen"),
  isOnline: boolean("is_online").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// 聊天室表
const chatRooms = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  roomId: varchar("room_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdBy: varchar("created_by", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// 訊息表
const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  roomId: varchar("room_id", { length: 50 }).notNull(),
  senderId: varchar("sender_id", { length: 50 }).notNull(),
  senderName: varchar("sender_name", { length: 100 }).notNull(),
  content: text("content").notNull(),
  messageType: varchar("message_type", { length: 20 }).default("text"),
  isDeleted: boolean("is_deleted").default(false),
  timestamp: timestamp("timestamp").defaultNow(),
});

// 房間成員表
const roomMembers = pgTable("room_members", {
  id: serial("id").primaryKey(),
  roomId: varchar("room_id", { length: 50 }).notNull(),
  userId: varchar("user_id", { length: 50 }).notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
  lastReadAt: timestamp("last_read_at"),
});

module.exports = {
  users,
  chatRooms,
  messages,
  roomMembers,
  messages, // 新增：訊息表
  chatRooms, // 新增：聊天室表
  roomMembers, // 新增：房間成員表
  users, // 新增：聊天室用戶表（如果跟 usersTable 不同）
};
