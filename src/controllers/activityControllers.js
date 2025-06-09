const db = require("../db/index.js");
const { activities, usersTable } = require("../db/schema.js");
const { eq, and } = require("drizzle-orm");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const crypto = require("crypto");

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
        created_by_username: usersTable.username, // ⭐ 用 join 撈出 username
      })
      .from(activities)
      .leftJoin(usersTable, eq(activities.created_by_id, usersTable.id));
    res.json(result);
  } catch (err) {
    console.error("取得所有活動錯誤：", err);
    res.status(500).json({ error: "伺服器錯誤" });
  }
};

const getActivityById = async (req, res) => {
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
      .leftJoin(usersTable, eq(activities.created_by_id, usersTable.id));
    res.json(result);
  } catch (err) {
    console.error("取得所有活動錯誤：", err);
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
      .values({ title, location, date, description, created_by_id, image_url })
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
      .where(and(eq(activities.id, id), eq(activities.createdBy, userId)))
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

module.exports = {
  getAllActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
};
