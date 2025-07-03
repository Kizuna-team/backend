const db = require("../db/index.js");
const { messagesTable, usersTable, friendsTable } = require("../db/schema.js");

const rooms = new Map();
const users = new Map();

function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log("新用戶連接:", socket.id);

    socket.on("joinRoom", (data) => {
      const { roomId, userId, userName } = data;

      const previousUser = users.get(socket.id);
      if (previousUser?.roomId) {
        socket.leave(previousUser.roomId.toString());
      }

      socket.join(roomId);

      users.set(socket.id, {
        userId,
        userName,
        roomId,
        joinTime: new Date(),
      });

      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId).add(socket.id);

      socket.to(roomId.toString()).emit("userJoined", {
        userId,
        userName,
        message: `${userName} 加入了聊天室`,
        timestamp: new Date().toISOString(),
      });

      socket.emit("joinedRoom", {
        roomId,
        message: `歡迎加入房間 ${roomId}`,
        userCount: rooms.get(roomId).size,
      });
    });

    socket.on("leaveRoom", (data) => {
      const { roomId } = data;
      const user = users.get(socket.id);

      if (user && user.roomId === roomId) {
        handleUserLeave(socket, user);
      }
    });

    socket.on("chatMessage", async (data) => {
      const {
        roomId,
        senderId,
        senderName,
        content,
        timestamp,
        type,
        stickerUrl,
        stickerEmoji,
      } = data;

      const user = users.get(socket.id);
      if (!user || user.roomId !== roomId) {
        socket.emit("error", { message: "您不在此房間中" });
        return;
      }

      const now = new Date();
      const messageType = type || "text";

      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        roomId,
        senderId,
        senderName,
        content,
        timestamp: timestamp || now.toISOString(),
        socketId: socket.id,
        type: type || "text",
        stickerUrl: stickerUrl || null,
        stickerEmoji: stickerEmoji || null,
      };

      try {
        await db.insert(messagesTable).values({
          room_id: roomId,
          sender_id: senderId,
          content,
          type: messageType,
          sticker_url: stickerUrl || null,
          sticker_emoji: stickerEmoji || null,
          created_at: now,
        });
        console.log(`訊息已寫入資料庫`);
      } catch (error) {
        console.error("寫入資料庫時出錯:", error);
      }

      io.to(roomId.toString()).emit("chatMessage", message);
      console.log(`訊息已廣播給房間 ${roomId} 的所有用戶`);
    });

    socket.on("disconnect", () => {
      const user = users.get(socket.id);

      if (user) {
        console.log(`用戶 ${user.userName} 斷開連接`);
        handleUserLeave(socket, user);
      } else {
        console.log(`未知用戶斷開連接: ${socket.id}`);
      }
    });

    socket.on("error", (error) => {
      console.error("Socket 錯誤:", error);
    });
  });

  function handleUserLeave(socket, user) {
    const { roomId, userId, userName } = user;

    socket.leave(roomId.toString());

    users.delete(socket.id);

    const room = rooms.get(roomId);
    if (room) {
      room.delete(socket.id);
    }

    if (room.size === 0) {
      room.delete(roomId);
    } else {
      console.log(`房間 ${roomId} 目前剩下 ${room.size} 位用戶`);
    }
  }
}

module.exports = setupSocket;
