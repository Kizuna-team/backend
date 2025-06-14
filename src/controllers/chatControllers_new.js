// controllers/chatControllers.js

// 存儲房間和用戶資訊
const rooms = new Map();
const users = new Map();

function setupSocket(io) {
  console.log("🚀 Socket.io 聊天室已啟動");

  io.on('connection', (socket) => {
    console.log('新用戶連接:', socket.id);

    // 處理加入房間
    socket.on('joinRoom', (data) => {
      const { roomId, userId, userName } = data;
      
      console.log(`用戶 ${userName} (${userId}) 嘗試加入房間 ${roomId}`);
      
      // 離開之前的房間
      const previousUser = users.get(socket.id);
      if (previousUser?.roomId) {
        socket.leave(previousUser.roomId.toString());
        console.log(`用戶離開之前的房間: ${previousUser.roomId}`);
      }
      
      // 加入新房間
      socket.join(roomId.toString());
      
      // 儲存用戶資訊
      users.set(socket.id, {
        userId,
        userName,
        roomId,
        joinTime: new Date()
      });
      
      // 更新房間資訊
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId).add(socket.id);
      
      console.log(`✅ 用戶 ${userName} 成功加入房間 ${roomId}`);
      console.log(`房間 ${roomId} 目前有 ${rooms.get(roomId).size} 位用戶`);
      
      // 通知房間內其他用戶有新用戶加入
      socket.to(roomId.toString()).emit('userJoined', {
        userId,
        userName,
        message: `${userName} 加入了聊天室`,
        timestamp: new Date().toISOString()
      });
      
      // 發送加入成功確認給當前用戶
      socket.emit('joinedRoom', {
        roomId,
        message: `歡迎加入房間 ${roomId}`,
        userCount: rooms.get(roomId).size
      });
    });

    // 處理聊天訊息
    socket.on('chatMessage', (data) => {
      const { roomId, senderId, senderName, content, timestamp } = data;
      
      console.log(`📨 房間 ${roomId} 收到來自 ${senderName} 的訊息: ${content}`);
      
      // 驗證用戶是否在房間中
      const user = users.get(socket.id);
      if (!user || user.roomId !== roomId) {
        console.log(`❌ 用戶 ${senderId} 不在房間 ${roomId} 中`);
        socket.emit('error', { message: '您不在此房間中' });
        return;
      }
      
      // 建立完整的訊息物件
      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        roomId,
        senderId,
        senderName,
        content,
        timestamp: timestamp || new Date().toISOString(),
        socketId: socket.id
      };
      
      console.log(`📤 廣播訊息到房間 ${roomId}:`, message);
      
      // 發送給房間內的所有用戶（包括發送者）
      io.to(roomId.toString()).emit('chatMessage', message);
      
      // 這裡可以將訊息存儲到資料庫
      // await saveMessageToDatabase(message);
      console.log(`✅ 訊息已廣播給房間 ${roomId} 的所有用戶`);
    });

    // 處理離開房間
    socket.on('leaveRoom', (data) => {
      const { roomId, userId } = data;
      const user = users.get(socket.id);
      
      if (user && user.roomId === roomId) {
        console.log(`👋 用戶 ${user.userName} 主動離開房間 ${roomId}`);
        
        handleUserLeave(socket, user);
      }
    });

    // 處理斷開連接
    socket.on('disconnect', () => {
      const user = users.get(socket.id);
      
      if (user) {
        console.log(`🔌 用戶 ${user.userName} 斷開連接`);
        handleUserLeave(socket, user);
      } else {
        console.log(`🔌 未知用戶斷開連接: ${socket.id}`);
      }
    });

    // 處理錯誤
    socket.on('error', (error) => {
      console.error('Socket 錯誤:', error);
    });
  });

  // 輔助函數：處理用戶離開
  function handleUserLeave(socket, user) {
    const { roomId, userId, userName } = user;
    
    // 從房間中移除用戶
    socket.leave(roomId.toString());
    
    // 更新房間資訊
    if (rooms.has(roomId)) {
      rooms.get(roomId).delete(socket.id);
      
      // 如果房間沒有用戶了，刪除房間
      if (rooms.get(roomId).size === 0) {
        rooms.delete(roomId);
        console.log(`🗑️ 房間 ${roomId} 已清空並刪除`);
      }
    }
    
    // 刪除用戶資訊
    users.delete(socket.id);
    
    // 通知房間內其他用戶
    socket.to(roomId.toString()).emit('userLeft', {
      userId,
      userName,
      message: `${userName} 離開了聊天室`,
      timestamp: new Date().toISOString()
    });
    
    console.log(`✅ 用戶 ${userName} 已離開房間 ${roomId}`);
    if (rooms.has(roomId)) {
      console.log(`房間 ${roomId} 目前有 ${rooms.get(roomId).size} 位用戶`);
    }
  }

  // 定期清理無效連接（可選）
  setInterval(() => {
    console.log(`📊 狀態報告 - 總連接數: ${users.size}, 總房間數: ${rooms.size}`);
  }, 30000); // 每30秒輸出一次狀態
}

module.exports = setupSocket;