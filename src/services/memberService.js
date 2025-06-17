const { subscriptionsTable } = require("../db/schema");
const { and, eq, lte, gte } = require("drizzle-orm");
const db = require("../db/index");

// 查詢當下使用者是否為會員
const isValidMember = async (userId) => {
  const present = new Date();
  const memberRecord = await db
    .select()
    .from(subscriptionsTable)
    .where(
      and(
        eq(subscriptionsTable.user_id, userId),
        lte(subscriptionsTable.start_date, present), // 當前時間 <= 訂閱日時間 訂閱已生效
        gte(subscriptionsTable.end_date, present) // 當前時間 >= 包含訂閱日結束時間 訂閱尚未過期
      )
    );
  return memberRecord.length > 0;
};

module.exports = {
  isValidMember,
};
