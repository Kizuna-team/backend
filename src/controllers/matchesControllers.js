// 取得互相喜歡的使用者profiles/photos資料API
const db = require("../db/index.js");
const { eq, and } = require("drizzle-orm");
const { v4: uuidv4 } = require("uuid");
const { friendshipsTable } = require("../db/schema.js");
const { getMatchedCard } = require("../services/matchingService.js");

const matchedBeFriend = async (req, res) => {
  const userId = req.user?.id;
  const { targetId } = req.body;

  if (!userId || !targetId) {
    return res.status(400).json({ message: "缺少必要資料" });
  }

  try {
    // 查詢是否已經存在好友關係」
    const matchedRecord = await db
      .select()
      .from(friendshipsTable)
      .where(
        or(
          and(
            eq(friendshipsTable.user_id, userId),
            eq(friendshipsTable.friend_id, targetId)
          ),
          and(
            eq(friendshipsTable.user_id, targetId),
            eq(friendshipsTable.friend_id, userId)
          )
        )
      );

    if (matchedRecord.length > 0) {
      return res.status(409).json({ message: "已經是好友" });
    }

    // 建立聊天室 ID
    const roomId = uuidv4();

    // 雙向寫入
    await db.insert(friendshipsTable).values([
      { user_id: userId, friend_id: targetId, room_id: roomId },
      { user_id: targetId, friend_id: userId, room_id: roomId },
    ]);

    // 呼叫 getMatchedCard 抓出雙方資訊

    const profiles = await getMatchedCard([userId, targetId]);
    const myProfile = profiles.find((p) => p.userId === userId);
    const targetProfile = profiles.find((p) => p.userId === targetId);

    return res.status(201).json({
      message: "已成為好友",
      roomId,
      myProfile,
      targetProfile,
    });
  } catch (error) {
    console.error(" matchedBeFriend failed:", error.message);
    res.status(500).json({ message: "伺服器錯誤，請稍後再試" });
  }
};

module.exports = {
  matchedBeFriend,
};

/* 
  [
    { userId: 1, name: "Melody", avatarUrl: "https://..." },
    { userId: 2, name: "Tom", avatarUrl: "https://..." },
  ]
*/
