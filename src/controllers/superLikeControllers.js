const db = require("../db/index.js");
const { superLikesTable, matchesTable } = require("../db/schema");
const { checkSuperLikeAuth } = require("../services/superLikeService.js");
const {
  createFriendship,
  getMatchedCard,
} = require("../services/matchingService.js");
const { eq, and } = require("drizzle-orm");

const createSuperLike = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { targetId } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "未授權操作，請先登入",
      });
    }

    const { limit, remainingCount, isWithinLimit } = await checkSuperLikeAuth(
      userId
    );

    if (!isWithinLimit) {
      return res.status(403).json({
        message: `今日使用次數已達${limit}次上限`,
      });
    }

    const mySuperLike = await db
      .select()
      .from(superLikesTable)
      .where(
        and(
          eq(superLikesTable.userId, userId),
          eq(superLikesTable.targetId, targetId)
        )
      )
      .limit(1);

    if (mySuperLike.length > 0) {
      return res.status(409).json({
        message: "已經Super Like 過",
      });
    }

    await db.insert(superLikesTable).values({
      userId,
      targetId,
      usedAt: new Date(),
    });

    const sortedIds = [userId, targetId].sort((a, b) => a - b);

    await db
      .insert(matchesTable)
      .values({
        matchUserAId: sortedIds[0],
        matchUserBId: sortedIds[1],
        matchedAt: new Date(),
      })
      .onConflictDoNothing();

    const roomId = await createFriendship(userId, targetId);

    const profiles = await getMatchedCard([userId, targetId]);
    const myProfile = profiles.find((p) => p.userId === userId);
    const targetProfile = profiles.find((p) => p.userId === targetId);

    return res.status(201).json({
      matched: true,
      forcedMatched: true,
      remainingCount: remainingCount - 1,
      message: "已成功發送 Super Like 且 配對成功！",
      targetProfile,
      myProfile,
      roomId,
    });
  } catch (error) {
    console.error("createSuperLike failed:", error.message);
    res.status(500).json({ message: "伺服器錯誤", error: error.message });
  }
};

const superLikeAuthHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const result = await checkSuperLikeAuth(userId);
    res.status(200).json(result);
  } catch (err) {
    console.error("super like 使用權限失敗：", err);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};

module.exports = {
  createSuperLike,
  superLikeAuthHandler,
};
