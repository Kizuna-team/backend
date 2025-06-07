const db = require("../db/index.js");
const { superLikesTable } = require("../db/schema.js");
const { isValidMember } = require("../services/subscriptionService");
const { eq, and } = require("drizzle-orm");

// 已經用了幾次 Super Like
const getSuperLikeCounts = async (userId) => {
  const today = new Date().toISOString().slice(0, 10);
  const counts = await db
    .select()
    .from(superLikesTable)
    .where(
      and(eq(superLikesTable.userId, userId), eq(superLikesTable.usedAt, today))
    );
  // 這個使用者今天用幾次 Super like
  return counts.length;
};

// （會員上限 5，非會員上限 1）判斷 Super Like 剩多少使用次數能用？ 是不是會員？
const checkSuperLikeAuth = async (userId) => {
  const isMember = await isValidMember(userId);
  const usedCount = await getSuperLikeCounts(userId);

  // 用會員狀態決定使用上限、以使用次數小於限制判斷還能繼續使用
  const limit = isMember ? 5 : 1;
  const isWithinLimit = usedCount < limit;

  return { isWithinLimit, isValidMember: isMember };
};

module.exports = {
  getSuperLikeCounts,
  checkSuperLikeAuth,
};
