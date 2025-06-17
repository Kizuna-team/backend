const db = require("../db/index.js");
const { superLikesTable } = require("../db/schema.js");
const { isValidMember } = require("./memberService.js");
const { eq, and } = require("drizzle-orm");

// 使用者已經用了幾次 Super Like
const getSuperLikeCounts = async (userId) => {
  const today = new Date();
  const counts = await db
    .select()
    .from(superLikesTable)
    .where(
      and(eq(superLikesTable.userId, userId), eq(superLikesTable.usedAt, today))
    );

  return counts.length;
};

// （會員上限 5，非會員上限 1）判斷 Super Like 剩多少使用次數能用？ 是不是會員？
const checkSuperLikeAuth = async (userId) => {
  const isMember = await isValidMember(userId); // 顯示是否為會員
  const usedCount = await getSuperLikeCounts(userId); // 知道今天已用幾次

  // 用會員狀態決定使用上限、計算剩下幾次使用次數
  const limit = isMember ? 5 : 1;
  const remainingCount = limit - usedCount; // 還能用幾次;
  const isWithinLimit = remainingCount > 0; // 是否還能送出super like

  return {
    isMember,
    limit,
    remainingCount,
    isWithinLimit,
  };
};

module.exports = {
  getSuperLikeCounts,
  checkSuperLikeAuth,
};
