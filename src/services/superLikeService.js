const db = require("../db/index.js");
const { superLikesTable } = require("../db/schema.js");
const { getPlan } = require("./subscriptionsService.js");
const { eq } = require("drizzle-orm");

const checkSuperLikeAuth = async (userId) => {
  const planConfig = await getPlan(userId);
  const usedRecord = await db
    .select()
    .from(superLikesTable)
    .where(eq(superLikesTable.userId, userId));

  const usedCount = usedRecord.length;
  const limit = planConfig.superLikeLimit;
  const remainingCount = limit - usedCount;
  const isWithinLimit = remainingCount > 0;

  return {
    planName: planConfig.planName,
    limit,
    remainingCount,
    isWithinLimit,
  };
};

module.exports = {
  checkSuperLikeAuth,
};
