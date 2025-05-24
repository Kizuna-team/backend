const pool = require("../config/db.js");

function setupSocket(io){
    io.on("connect", (socket)=>{
        console.log("新用戶連線");

        socket.on("joinRoom",(roomId)=>{
            console.log(`使用者成功加入room ${roomId}`);
            socket.join(roomId);
        });

        socket.on("chatMessage",async ({roomId, senderId, content})=>{
            try{
                const result = await pool.query(
                    "INSERT INTO messages (room_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *",
                    [roomId, senderId, content]
                );
                // debug
                // console.log(result);
                io.to(roomId).emit("chatMessage",result.rows[0]);
                console.log("廣播訊息至room",roomId,result.rows[0]);
            }catch(err){
                console.error("訊息發送失敗，原因:", err);
            }
        })
    })
}

module.exports = setupSocket;

