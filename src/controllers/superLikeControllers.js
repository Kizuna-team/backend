// 前端點擊super like按鈕後的處理邏輯
// 先確定沒送過、沒超過限制，再寫入 superLikesTable
// 最後判斷是否配對成功
const db = require("../db/index.js");
const { superLikesTable, matchesTable } = require("../db/schema");
const { checkSuperLikeAuth } = require("../services/superLikeService");

const sendSuperLike = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { targetId } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "未授權操作，請先登入",
      });
    }

    // 解構 取得使用者 會員狀態與剩餘次數
    const { limit, remainingCount, isWithinLimit } = await checkSuperLikeAuth(
      userId
    );

    // 次數用盡，沒權限繼續使用此操作
    if (!isWithinLimit) {
      return res.status(403).json({
        message: `今日使用次數已達${limit}次上限`,
      });
    }

    // 已對對方使用like
    const userLike = await db.query.likesTable.findFirst({
      where: {
        userId,
        targetId,
      },
    });
    if (userLike) {
      return res.status(409).json({
        message: "已對此對象送出過like",
      });
    }

    // 已對對方使用過super like
    const userSuperLike = await db.query.superLikesTable.findFirst({
      where: {
        userId,
        targetId,
      },
    });
    if (userSuperLike) {
      return res.status(409).json({
        message: "已對此對象送出過super like",
      });
    }

    // 正式新增 super like 紀錄
    await db.insert(superLikesTable).values({
      userId,
      targetId,
      usedAt: new Date(),
    });

    // 接著判斷是否配對成功，插入 matchesTable
    // 查詢 對方（targetId）Like 你（userId）的紀錄
    const targetUserLike = await db.query.likesTable.findFirst({
      where: {
        userId: targetId,
        targetId: userId,
      },
    });

    // 查詢 對方（targetId）superLike 你（userId）的紀錄
    const targetUserSuperLike = await db.query.superLikesTable.findFirst({
      where: {
        userId: targetId,
        targetId: userId,
      },
    });

    // 任一方有 Like 或 SuperLike，且對方也有才算配對成功
    const userLikedRecord = userLike || userSuperLike;
    const targetUserLikedRecord = targetUserLike || targetUserSuperLike;

    // 確保較小的 ID 在前面，配對資料庫要避免重複配對 (1, 2) 和 (2, 1)
    if (userLikedRecord && targetUserLikedRecord) {
      const ids = [userId, targetId];
      const sortedIds = ids.sort((a, b) => a - b);
      const idA = sortedIds[0];
      const idB = sortedIds[1];

      await db
        .insert(matchesTable)
        .values({
          matchUserAId: idA,
          matchUserBId: idB,
          matchedAt: new Date(),
        })
        .onConflictDoNothing(); // 防止重複配對紀錄
    }

    return res.status(200).json({
      message: "成功發送 Super Like",
      matched: true,
      remainingCount: remainingCount - 1,
    });
  } catch (error) {
    console.error("sendSuperLike failed:", error);
    res.status(500).json({ message: "伺服器錯誤", error: error.message });
  }
};

module.exports = {
  sendSuperLike,
};
