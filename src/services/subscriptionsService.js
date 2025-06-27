const { subscriptionsTable, usersTable } = require("../db/schema");
const { and, eq, lte, gte } = require("drizzle-orm");
const db = require("../db/index");

const plansConfig = {
  1: {
    planName: "普通會員",
    TargetUserLimit: 20,
    superLikeLimit: 1,
  },
  2: {
    planName: "高級會員",
    TargetUserLimit: 50,
    superLikeLimit: 5,
  },
};

const getPlan = async (userId) => {
  const [user] = await db
    .select({ subscription_plan: usersTable.subscription_plan })
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  const planId = user?.subscription_plan || 1;
  return plansConfig[planId] || plansConfig[1];
};

const isValidMember = async (userId) => {
  const present = new Date();
  const memberRecord = await db
    .select()
    .from(subscriptionsTable)
    .where(
      and(
        eq(subscriptionsTable.user_id, userId),
        lte(subscriptionsTable.start_date, present),
        gte(subscriptionsTable.end_date, present)
      )
    );
  return memberRecord.length > 0;
};

module.exports = {
  getPlan,
  isValidMember,
};
