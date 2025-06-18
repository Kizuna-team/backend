import { db } from "./index.js";
import { messagesTable } from "./schema.js";

export async function insertMessage(roomId, senderId, content) {
  const inserted = await db.insert(messagesTable).values({
    room_id: roomId,
    sender_id: senderId,
    content,
  }).returning();

  return inserted[0];
}
