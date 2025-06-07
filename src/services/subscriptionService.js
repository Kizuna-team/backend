const { subscriptionsTable } = require("../db/schema");
const { and, eq, lte, gt } = require("drizzle-orm");
const db = require("../db/index");

// 查詢當下使用者是否為會員
const isValidMember = async (userId) => {
  const present = new Date();
  const memberRecord = await db
    .select()
    .from(subscriptionsTable)
    .where(
      and(
        eq(subscriptionsTable.userId, userId),
        lte(subscriptionsTable.startDate, present), // 當前時間 >= 訂閱日時間
        gt(subscriptionsTable.endDate, present) // 當前時間 < 訂閱日時間
      )
    );
  return memberRecord.length > 0;
};

module.exports = {
  isValidMember,
};
