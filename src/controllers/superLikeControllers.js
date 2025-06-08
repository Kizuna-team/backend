// 前端點擊super like按鈕後的處理邏輯
const db = require("../db/index.js");
const { superLikesTable, likesTable } = require("../db/schema");
const { checkSuperLikeAuth } = require("../services/superLikeService");

const sendSuperLike = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { targetId } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "未授權操作",
      });
    }

    // 解構 取得使用者 會員狀態與剩餘次數
    const { isMember, limit, remainingCount, isWithinLimit } =
      await checkSuperLikeAuth(userId);

    // 次數用盡，沒權限繼續使用此操作
    if (!isWithinLimit) {
      return res.status(403).json({
        message: `今日使用次數已達${limit}次上限`,
      });
    }

    // 是某已對對方使用like
    const likeRecord = await db.query.likesTable.findFirst({
      where: {
        userId,
        targetId,
      },
    });

    if (likeRecord) {
      return res.status(409).json({
        message: "已對此對象送出過like",
      });
    }

    // 是某已對對方使用過super like
    const superLikeRecord = await db.query.superLikesTable.findFirst({
      where: {
        userId,
        targetId,
      },
    });

    if (superLikeRecord) {
      return res.status(409).json({
        message: "已對此對象送出過super like",
      });
    }

    // 新增super like 紀錄，限制是「一天只能用幾次」
    await db.insert(superLikesTable).values({
      userId,
      targetId,
      usedAt: new Date(),
    });

    return res.status(200).json({
      message: "成功發送 Super Like",
      data: `剩下 ${remainingCount - 1} 次`,
    });
  } catch (error) {
    console.error("sendSuperLike failed:", error);
    res.status(500).json({ message: "伺服器錯誤", error: error.message });
  }
};

module.exports = {
  sendSuperLike,
};
