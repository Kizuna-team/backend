const db = require("../db/index.js"); 
const { messagesTable, usersTable, friendsTable } = require("../db/schema.js");

// 存儲房間和用戶資訊
const rooms = new Map();
const users = new Map();

function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log("新用戶連接:", socket.id);

    // 處理加入房間
    socket.on("joinRoom", (data) => {
      const { roomId, userId, userName } = data;

      // 離開之前的房間
      const previousUser = users.get(socket.id);
      if (previousUser?.roomId) {
        socket.leave(previousUser.roomId.toString());
      }

      // 加入新房間
      socket.join(roomId);

      // 儲存用戶資訊
      users.set(socket.id, {
        userId,
        userName,
        roomId,
        joinTime: new Date(),
      });

      // 更新房間資訊
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId).add(socket.id);

      // 通知房間內其他用戶有新用戶加入
      socket.to(roomId.toString()).emit("userJoined", {
        userId,
        userName,
        message: `${userName} 加入了聊天室`,
        timestamp: new Date().toISOString(),
      });

      // 發送加入成功確認給當前用戶
      socket.emit("joinedRoom", {
        roomId,
        message: `歡迎加入房間 ${roomId}`,
        userCount: rooms.get(roomId).size,
      });
    });

    // 處理離開房間
    socket.on("leaveRoom", (data) => {
      const { roomId } = data;
      const user = users.get(socket.id);

      if (user && user.roomId === roomId) {
        handleUserLeave(socket, user);
      }
    });

    socket.on("chatMessage", async (data) => {
      const { roomId, senderId, senderName, content, timestamp } = data;

      // 驗證用戶是否在房間中
      const user = users.get(socket.id);
      if (!user || user.roomId !== roomId) {
        console.log(`用戶 ${senderId} 不在房間 ${roomId} 中`);
        socket.emit("error", { message: "您不在此房間中" });
        return;
      }

      const now = new Date();

      // 建立完整的訊息物件（前端顯示用）
      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        roomId,
        senderId,
        senderName,
        content,
        timestamp: timestamp || now.toISOString(),
        socketId: socket.id,
      };

      // 寫入資料庫
      try {
        await db.insert(messagesTable).values({
          room_id: roomId,
          sender_id: senderId,
          content,
          created_at: now, // Drizzle timestamp 欄位
        });
        console.log(`訊息已寫入資料庫`);
      } catch (error) {
        console.error("寫入資料庫時出錯:", error);
      }

      // 廣播給房間內所有人
      io.to(roomId.toString()).emit("chatMessage", message);
      console.log(`訊息已廣播給房間 ${roomId} 的所有用戶`);
    });

    // 處理斷開連接
    socket.on("disconnect", () => {
      const user = users.get(socket.id);

      if (user) {
        console.log(`用戶 ${user.userName} 斷開連接`);
        handleUserLeave(socket, user);
      } else {
        console.log(`未知用戶斷開連接: ${socket.id}`);
      }
    });

    // 處理錯誤
    socket.on("error", (error) => {
      console.error("Socket 錯誤:", error);
    });
  });

  // 處理用戶離開 避免消耗不必要的記憶體空間
  function handleUserLeave(socket, user) {
    const { roomId, userId, userName } = user;

    // 從房間中移除用戶
    socket.leave(roomId.toString());

    // 刪除用戶資訊
    users.delete(socket.id);

    // 從房間 Map 移除這位 socket.id
    const room = rooms.get(roomId);
    if(room){
      room.delete(socket.id);
    }
      // 如果房間沒人了 就移除房間
      if(room.size === 0){
        room.delete(roomId);
      }else{
        console.log(`房間 ${roomId} 目前剩下 ${room.size} 位用戶`)
      }
    
  }
}

module.exports = setupSocket;
