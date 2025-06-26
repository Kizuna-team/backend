const db = require("../db/index.js");
const { superLikesTable } = require("../db/schema.js");
const { getPlan } = require("./memberService.js");
const { eq } = require("drizzle-orm");

const checkSuperLikeAuth = async (userId) => {
  const config = await getPlan(userId);
  const usedCount = await db
    .select()
    .from(superLikesTable)
    .where(eq(superLikesTable.userId, userId));

  const limit = config.superLikeLimit;
  const remainingCount = limit - usedCount;
  const isWithinLimit = remainingCount > 0; // 是否還能送出super like

  return {
    planName: config.planName,
    limit,
    remainingCount,
    isWithinLimit,
  };
};

module.exports = {
  checkSuperLikeAuth,
};
