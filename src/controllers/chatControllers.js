const db = require("../db/index.js");
const { messagesTable } = require("../db/schema.js");
const { eq } = require("drizzle-orm");


function setupSocket(io){
    io.on("connect", (socket)=>{
        console.log("新用戶連線");

        socket.on("joinRoom",(roomId)=>{
            // console.log(`使用者成功加入room ${roomId}`);
            socket.join(roomId);
        });

        socket.on("chatMessage",async ({roomId, senderId, content})=>{
            try{
                const result = await db.insert(messagesTable).values({
                    room_id: roomId,
                    sender_id: senderId,
                    content: content,
                }).returning();
                
                // debug
                console.log(result);
                io.to(roomId).emit("chatMessage",result[0]);
                console.log("寫入資料庫後的回傳值",result[0]);
            }catch(err){
                console.error("訊息發送失敗，原因:", err);
            }
        })
    })
}

module.exports = setupSocket;

