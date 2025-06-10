// 前端點擊super like按鈕後的處理邏輯
// 先確定沒送過、沒超過限制，再寫入 superLikesTable
// 最後判斷是否配對成功
const db = require("../db/index.js");
const { likesTable, superLikesTable, matchesTable } = require("../db/schema");
const { checkSuperLikeAuth } = require("../services/superLikeService");
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
    const myLike = await db
      .select()
      .from(likesTable)
      .where(
        and(eq(likesTable.userId, userId), eq(likesTable.targetId, targetId))
      )
      .limit(1);

    if (myLike.length > 0) {
      return res.status(409).json({
        message: "不可重複送出 Like",
      });
    }

    // 已對對方使用過super like
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

    // 新增 super like 紀錄
    await db.insert(superLikesTable).values({
      userId,
      targetId,
      usedAt: new Date(),
    });

    // 接著判斷是否配對成功，插入 matchesTable
    // 先查詢 對方（targetId）Like 你（userId）的紀錄
    const targetUserLike = await db
      .select()
      .from(likesTable)
      .where(
        and(
          eq(likesTable.userId, targetId),
          eq(likesTable.targetId, userId),
          eq(likesTable.status, 1)
        )
      )
      .limit(1);

    // 查詢 對方（targetId）superLike 你（userId）的紀錄
    const targetUserSuperLike = await db
      .select()
      .from(superLikesTable)
      .where(
        and(
          eq(superLikesTable.userId, targetId),
          eq(superLikesTable.targetId, userId)
        )
      )
      .limit(1);

    // 查找是否任一方有 Like 或 SuperLike
    const userLikedRecord = myLike[0] || mySuperLike[0];
    const targetUserLikedRecord = targetUserLike[0] || targetUserSuperLike[0];

    // 所以 只要雙方有互相就算配對成功(!!轉布林值)
    const matched = !!(userLikedRecord && targetUserLikedRecord);

    // 確保較小的 ID 在前面，配對資料庫要避免重複配對 (1, 2) 和 (2, 1)
    if (matched) {
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

    const message = matched
      ? "已成功發送 Super Like 且 配對成功！"
      : "已成功發送 Super Like";

    return res.status(200).json({
      message,
      matched,
      remainingCount: remainingCount - 1,
    });
  } catch (error) {
    console.error("createSuperLike failed:", error.message);
    res.status(500).json({ message: "伺服器錯誤", error: error.message });
  }
};

module.exports = {
  createSuperLike,
};
