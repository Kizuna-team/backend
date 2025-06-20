// 取得互相喜歡的使用者profiles/photos資料API
const db = require("../db/index.js");
const { friendshipsTable } = require("../db/schema.js");
const { eq, and } = require("drizzle-orm");

const {
  getLikedMeUserIds, // 喜歡我的
  getMyLikedTargetIds, // 我喜歡的
  getMatchedUserIds, // 互相喜歡
} = require("../services/matchingService.js");

// 取得互相喜歡的使用者的資料
const getMatchedBasicData = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "未授權操作，請先登入" });
    }
    const matchedUserIds = await getMatchedUserIds(userId);

    return res.status(200).json({ matchedUserIds });
  } catch (error) {
    console.error("getMatchedUserData failed:", error);
    res.status(500).json({ message: "伺服器錯誤", error: error.message });
  }
};

const matchedBeFriend = async (req, res) => {
  const userId = req.user?.id;
  const { targetId } = req.body;

  if (!userId || !targetId) {
    return res.status(400).json({ message: "缺少必要資料" });
  }

  try {
    // 查詢是否已經存在「userId 和 targetId 之間的好友關係」
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
      return es.status(409).json({ message: "已經是好友" });
    }

    // 雙向寫入
    await db.insert(friendshipsTable).values([
      { user_id: userId, friend_id: targetId },
      { user_id: targetId, friend_id: userId },
    ]);

    return res.status(201).json({ message: "已成為好友" });
  } catch (error) {
    console.error("Create like failed:", error.message);
    res.status(500).json({ message: "伺服器錯誤，請稍後再試" });
  }
};

module.exports = {
  getMatchedBasicData,
  matchedBeFriend,
};
