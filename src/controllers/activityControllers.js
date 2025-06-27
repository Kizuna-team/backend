const db = require("../db/index.js");
const {
  activities,
  usersTable,
  userAttendActivityTable,
} = require("../db/schema.js");
const { eq, and, sql, desc, count, inArray } = require("drizzle-orm");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const crypto = require("crypto");
const {
  getJoinedActivitiesByUserId,
  joinActivity,
  cancelJoinActivity,
} = require("../services/activityService");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);

const formatDate = (date) =>
  dayjs(date).tz("Asia/Taipei").format("YYYY-MM-DD HH:mm:ss");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const randomFileName = (originalname) => {
  const ext = originalname.split(".").pop();
  return `${crypto.randomUUID()}.${ext}`;
};

const uploadToS3 = async (file) => {
  const fileName = randomFileName(file.originalname);
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  });
  await s3.send(command);
  return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};

const getAllActivities = async (req, res) => {
  try {
    const result = await db
      .select({
        id: activities.id,
        title: activities.title,
        location: activities.location,
        date: activities.date,
        description: activities.description,
        image_url: activities.image_url,
        created_at: activities.created_at,
        created_by_id: activities.created_by_id,
        created_by_username: usersTable.username,
        max_participants: activities.max_participants,
        current_participants: sql`COUNT(${userAttendActivityTable.userId})`.as(
          "current_participants"
        ),
      })
      .from(activities)
      .leftJoin(usersTable, eq(activities.created_by_id, usersTable.id))
      .leftJoin(
        userAttendActivityTable,
        eq(activities.id, userAttendActivityTable.activityId)
      )
      .groupBy(activities.id, usersTable.username)
      .orderBy(desc(activities.created_at));

    const formatted = result.map((item) => ({
      ...item,
      date: formatDate(item.date),
      created_at: formatDate(item.created_at),
    }));
    res.json(formatted);
  } catch (err) {
    console.error("取得所有活動錯誤：", err);
    res.status(500).json({ error: "伺服器錯誤" });
  }
};

const getMyActivities = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await db
      .select({
        id: activities.id,
        title: activities.title,
        date: activities.date,
        image_url: activities.image_url,
        location: activities.location,
        description: activities.description,
        created_at: activities.created_at,
        max_participants: activities.max_participants,
        current_participants: sql`COUNT(${userAttendActivityTable.userId})`.as(
          "current_participants"
        ),
        created_by_username: usersTable.username,
      })
      .from(activities)
      .orderBy(desc(activities.created_at))
      .leftJoin(usersTable, eq(activities.created_by_id, usersTable.id))
      .leftJoin(
        userAttendActivityTable,
        eq(activities.id, userAttendActivityTable.activityId)
      )
      .where(eq(activities.created_by_id, userId))
      .groupBy(activities.id, usersTable.username);

    const formatted = result.map((item) => ({
      ...item,
      date: formatDate(item.date),
      created_at: formatDate(item.created_at),
    }));
    console.log("資料庫查詢我的活動結果:", formatted);

    res.json(formatted);
  } catch (err) {
    console.error("取得我的活動錯誤：", err);
    res.status(500).json({ error: "伺服器錯誤" });
  }
};

const getActivityById = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const [activity] = await db
      .select({
        id: activities.id,
        title: activities.title,
        location: activities.location,
        date: activities.date,
        description: activities.description,
        image_url: activities.image_url,
        created_at: activities.created_at,
        created_by_id: activities.created_by_id,
        max_participants: activities.max_participants,
        created_by_username: usersTable.username,
      })
      .from(activities)
      .leftJoin(usersTable, eq(activities.created_by_id, usersTable.id))
      .where(eq(activities.id, id));

    if (!activity) {
      return res.status(404).json({ error: "Not found" });
    }
    activity.date = formatDate(activity.date);
    activity.created_at = formatDate(activity.created_at);
    res.json(activity);
  } catch (err) {
    console.error("取得活動錯誤：", err);
    res.status(500).json({ error: "伺服器錯誤" });
  }
};

const createActivity = async (req, res) => {
  const { title, location, date, description, maxParticipants } = req.body;
  const created_by_id = req.user.id;
  let image_url = "";

  try {
    if (req.file) {
      image_url = await uploadToS3(req.file);
    }
    const [inserted] = await db
      .insert(activities)
      .values({
        title,
        location,
        date: new Date(date),
        description,
        created_by_id,
        image_url,
        created_at: new Date(),
        max_participants: maxParticipants,
      })
      .returning();

    await db.insert(userAttendActivityTable).values({
      userId: created_by_id,
      activityId: inserted.id,
    });

    res.status(201).json({
      ...inserted,
      date: formatDate(inserted.date),
      created_at: formatDate(inserted.created_at),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "伺服器錯誤，稍後再試" });
  }
};

const updateActivity = async (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    const [activity] = await db
      .select()
      .from(activities)
      .where(and(eq(activities.id, id), eq(activities.created_by_id, userId)));

    if (!activity) return res.status(404).json({ error: "Not found" });

    let image_url = activity.image_url;
    const { title, location, date, description } = req.body;
    if (req.file) {
      image_url = await uploadToS3(req.file);
    } else {
      image_url = image_url || activity.image_url;
    }
    let dateValue = req.body.date;
    if (Array.isArray(dateValue)) dateValue = dateValue[0];
    const dateForDB = dateValue ? new Date(dateValue) : activity.date;
    const created_at = new Date();

    const [updated] = await db
      .update(activities)
      .set({
        title: title ?? activity.title,
        location: location ?? activity.location,
        date: dateForDB,
        description: description ?? activity.description,
        image_url,
        created_at,
      })
      .where(eq(activities.id, id))
      .returning();

    res.json({
      ...updated,
      date: formatDate(updated.date),
      created_at: formatDate(updated.created_at),
    });
  } catch (err) {
    console.error("更新活動錯誤：", err);
    res.status(500).json({ error: "伺服器錯誤，稍後再試" });
  }
};

const deleteActivity = async (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    await db
      .delete(userAttendActivityTable)
      .where(eq(userAttendActivityTable.activityId, id));
    const [activity] = await db
      .delete(activities)
      .where(and(eq(activities.id, id), eq(activities.created_by_id, userId)))
      .returning();

    if (!activity) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "伺服器錯誤，稍後再試" });
  }
};

const getMyJoinActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(userId);
    const activities = await getJoinedActivitiesByUserId(userId);
    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "伺服器錯誤" });
  }
};

const postJoinActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const activityId = Number(req.params.id);

    const result = await joinActivity(userId, activityId);

    if (!result.success) {
      return res.status(409).json({ message: result.message });
    }

    return res.status(201).json({
      message: result.message,
      current_participants: result.current_participants,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "伺服器錯誤" });
  }
};

const deleteJoinActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const activityId = Number(req.params.id);
    await cancelJoinActivity(userId, activityId);
    res.json({ message: "已取消活動" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "伺服器錯誤" });
  }
};

const searchActivitiesStatus = async (req, res) => {
  const { userId, activityIds } = req.body;

  try {
    const joinedActivities = await db
      .select({ activityId: userAttendActivityTable.activityId })
      .from(userAttendActivityTable)
      .where(
        and(
          eq(userAttendActivityTable.userId, userId),
          inArray(userAttendActivityTable.activityId, activityIds)
        )
      );

    const joinedSet = new Set(joinedActivities.map((a) => a.activityId));

    const activitiesData = await db
      .select({
        id: activities.id,
        maxParticipants: activities.max_participants,
      })
      .from(activities)
      .where(inArray(activities.id, activityIds));

    const countResults = await db
      .select({
        activityId: userAttendActivityTable.activityId,
        count: count().as("count"),
      })
      .from(userAttendActivityTable)
      .where(inArray(userAttendActivityTable.activityId, activityIds))
      .groupBy(userAttendActivityTable.activityId);

    const countMap = new Map(
      countResults.map((row) => [row.activityId, row.count])
    );

    const statuses = activitiesData.map((activity) => {
      if (joinedSet.has(activity.id)) {
        return { activityId: activity.id, status: "ALREADY_JOINED" };
      }

      const currentCount = countMap.get(activity.id) || 0;
      if (currentCount >= activity.maxParticipants) {
        return { activityId: activity.id, status: "FULL" };
      }

      return { activityId: activity.id, status: "OPEN" };
    });

    return res.json({ statuses });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "伺服器錯誤" });
  }
};

module.exports = {
  getAllActivities,
  getMyActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  postJoinActivity,
  deleteJoinActivity,
  getMyJoinActivity,
  searchActivitiesStatus,
};
