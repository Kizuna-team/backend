const db = require("../db/index.js");
const { eq, and } = require("drizzle-orm");
const {
  activities,
  userAttendActivityTable,
} = require("../db/schema.js");

const getActivityById = async (activityId) => {
  return await db
    .select()
    .from(activities)
    .where(eq(activities.id, activityId))
    .limit(1); // 限制只返回一筆資料
};

const getJoinedActivitiesByUserId = async (userId) => {
  return await db
    .select({
      activityId: activities.id,
      title: activities.title,
      description: activities.description,
    })
    .from(userAttendActivityTable)
    .innerJoin(activities, eq(userAttendActivityTable.activityId, activities.id))
    .where(eq(userAttendActivityTable.userId, userId));
};

const joinActivity = async (userId, activityId) => {
  return await db.insert(userAttendActivityTable).values({
    userId: userId, 
    activityId: activityId, 
  });
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
  getJoinedActivitiesByUserId
};