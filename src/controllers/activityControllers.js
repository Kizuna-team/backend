const db = require("../db/index.js");
const { activities, usersTable } = require("../db/schema.js");
const { eq, and } = require("drizzle-orm");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const crypto = require("crypto");
const {
  getJoinedActivitiesByUserId,
  joinActivity,
  cancelJoinActivity,
} = require("../services/activityService");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// 產生唯一檔名 function
const randomFileName = (originalname) => {
  const ext = originalname.split(".").pop();
  return `${crypto.randomUUID()}.${ext}`;
};

// 上傳檔案到 S3 function，會回傳網址
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

// 取得所有活動
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
      })
      .from(activities)
      .orderBy(activities.id)
      .leftJoin(usersTable, eq(activities.created_by_id, usersTable.id));
    res.json(result);
  } catch (err) {
    console.error("取得所有活動錯誤：", err);
    res.status(500).json({ error: "伺服器錯誤" });
  }
};

// 取得我創建的活動
const getMyActivities = async (req, res) => {
  const userId = req.user.id; // 由 token/middleware 取得
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
        created_by_username: usersTable.username,
      })
      .from(activities)
      .orderBy(activities.id)
      .leftJoin(usersTable, eq(activities.created_by_id, usersTable.id))
      .where(eq(activities.created_by_id, userId));
    console.log("資料庫查詢我的活動結果:", result);
    res.json(result);
  } catch (err) {
    console.error("取得我的活動錯誤：", err);
    res.status(500).json({ error: "伺服器錯誤" });
  }
};

// 查詢單一活動（編輯）
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
        created_by_username: usersTable.username,
      })
      .from(activities)
      .leftJoin(usersTable, eq(activities.created_by_id, usersTable.id))
      .where(eq(activities.id, id));

    if (!activity) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(activity);
  } catch (err) {
    console.error("取得活動錯誤：", err);
    res.status(500).json({ error: "伺服器錯誤" });
  }
};

const createActivity = async (req, res) => {
  const { title, location, date, description } = req.body;
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
      })
      .returning();
    res.status(201).json(inserted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "伺服器錯誤，稍後再試" });
  }
};

const updateActivity = async (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    // 查原本的活動
    const [activity] = await db
      .select()
      .from(activities)
      .where(and(eq(activities.id, id), eq(activities.created_by_id, userId)));

    if (!activity) return res.status(404).json({ error: "Not found" });

    //有新圖片就上傳，沒有就用原本的
    // 前端可選擇只更新部分欄位
    let image_url = activity.image_url;
    const { title, location, date, description } = req.body;
    if (req.file) {
      image_url = await uploadToS3(req.file);
    } else {
      image_url = image_url || activity.image_url;
    }

    const created_at = new Date();

    //合併舊值與新值（只改有傳進來的）
    const [updated] = await db
      .update(activities)
      .set({
        title: title ?? activity.title, // 沒送就用舊的
        location: location ?? activity.location,
        date: date ?? activity.date,
        description: description ?? activity.description,
        image_url,
        created_at,
      })
      .where(eq(activities.id, id))
      .returning();

    res.json(updated);
  } catch (err) {
    console.error("更新活動錯誤：", err);
    res.status(500).json({ error: "伺服器錯誤，稍後再試" });
  }
};

const deleteActivity = async (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.user.id;

  try {
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

//取得我想參加的活動(顯示)
const getMyJoinActivity = async (req, res) => {
  try {
    const userId = req.user.id;
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

    return res.status(201).json({ message: result.message });
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
};
