const db = require("../db/index.js");
const { eq, and, sql } = require("drizzle-orm");
const {
  activities,
  userAttendActivityTable,
  usersTable,
} = require("../db/schema.js");

const getActivityById = async (activityId) => {
  return await db
    .select()
    .from(activities)
    .where(eq(activities.id, activityId))
    .limit(1);
};

const getJoinedActivitiesByUserId = async (userId) => {
  const res = await db
    .select({
      id: activities.id,
      title: activities.title,
      location: activities.location,
      date: activities.date,
      description: activities.description,
      image_url: activities.image_url,
    })
    .from(userAttendActivityTable)
    .innerJoin(
      activities,
      eq(userAttendActivityTable.activityId, activities.id)
    )
    .where(eq(userAttendActivityTable.userId, userId));
  return res;
};

const joinActivity = async (userId, activityId) => {
  const existing = await db
    .select()
    .from(userAttendActivityTable)
    .where(
      and(
        eq(userAttendActivityTable.userId, userId),
        eq(userAttendActivityTable.activityId, activityId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return { success: false, message: "你已經加入過此活動" };
  }

  const activity = await db
    .select({ max: activities.max_participants })
    .from(activities)
    .where(eq(activities.id, activityId))
    .limit(1);

  if (activity.length === 0) {
    return { success: false, message: "找不到該活動" };
  }

  const maxParticipants = activity[0].max;
  const countResult = await db
    .select({ count: sql`COUNT(${userAttendActivityTable.activityId})` })
    .from(userAttendActivityTable)
    .where(eq(userAttendActivityTable.activityId, activityId));

  const currentCount = Number(countResult[0]?.count) || 0;

  if (currentCount >= maxParticipants) {
    return { success: false, message: "人數已滿，無法再報名" };
  }

  await db.insert(userAttendActivityTable).values({
    userId,
    activityId,
  });

  return {
    success: true,
    message: "成功加入活動",
    current_participants: currentCount,
  };
};

const cancelJoinActivity = async (userId, activityId) => {
  return await db
    .delete(userAttendActivityTable)
    .where(
      and(
        eq(userAttendActivityTable.userId, userId),
        eq(userAttendActivityTable.activityId, activityId)
      )
    );
};

module.exports = {
  getActivityById,
  joinActivity,
  cancelJoinActivity,
  getJoinedActivitiesByUserId,
};
