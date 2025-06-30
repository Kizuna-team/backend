const { subscriptionsTable, usersTable } = require("../db/schema");
const { and, eq, lte, gte } = require("drizzle-orm");
const db = require("../db/index");

const plansConfig = {
  1: {
    planName: "普通會員",
    TargetUserLimit: 10,
    superLikeLimit: 1,
    // showLikeRecords: false,
  },
  2: {
    planName: "高級會員",
    TargetUserLimit: 20,
    superLikeLimit: 5,
    // showLikeRecords: true,
  },
};

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
  return memberRecord.length > 0; // 有紀錄 > 效訂閱會員
};

// 自動取得該使用者的方案設定
const getPlan = async (userId) => {
  const [user] = await db
    .select({ subscription_plan: usersTable.subscription_plan })
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  const planId = user?.subscription_plan || 1; // 預設為普通會員
  const isActive = await isValidMember(userId);
  const verifiedPlanId = isActive ? planId : 1;
  return plansConfig[verifiedPlanId] || plansConfig[1];
};

module.exports = {
  getPlan,
};
