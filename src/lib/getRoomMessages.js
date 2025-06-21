const db = require("../db/index.js");
const { messagesTable } = require("../db/schema.js");
const { eq } = require("drizzle-orm");

async function getRoomMessages(roomId) {
  return await db
    .select({
      id: messagesTable.id,
      room_id: messagesTable.room_id,
      sender_id: messagesTable.sender_id,
      content: messagesTable.content,
      created_at: messagesTable.created_at,
    })
    .from(messagesTable)
    .where(eq(messagesTable.room_id, roomId))
    .orderBy(messagesTable.created_at);
}

module.exports = { getRoomMessages };
