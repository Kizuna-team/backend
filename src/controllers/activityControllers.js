const db = require("../db/index.js");
const { activities } = require("../db/schema.js");
const { eq } = require("drizzle-orm");
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
function randomFileName(originalname) {
  const ext = originalname.split(".").pop();
  return `${crypto.randomUUID()}.${ext}`;
}

// 上傳檔案到 S3 function，會回傳網址
async function uploadToS3(file) {
  const fileName = randomFileName(file.originalname);
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  });
  await s3.send(command);
  return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
}

const getAllActivities = async (req, res) => {
  try {
    const result = await db.select().from(activities);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "伺服器錯誤，稍後再試" });
  }
};

const getActivityById = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await db
      .select()
      .from(activities)
      .where(eq(activities.id, id));
    if (result.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "伺服器錯誤，稍後再試" });
  }
};

const createActivity = async (req, res) => {
  const { title, location, date, description } = req.body;
  console.log(title, location, date, description);
  const createdBy = req.user.id;
  let imageUrl = "";

  try {
    if (req.file) {
      imageUrl = await uploadToS3(req.file);
    }
    const [inserted] = await db
      .insert(activities)
      .values({ title, location, date, description, createdBy, imageUrl })
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
  const { title, location, date, description } = req.body;
  let imageUrl = req.body.imageUrl;

  try {
    if (req.file) {
      imageUrl = await uploadToS3(req.file);
    }
    const [updated] = await db
      .update(activities)
      .set({ title, location, date, description, createdBy, imageUrl })
      .where(
        and(
          eq(activities.id, id), 
          eq(activities.createdBy, userId) 
        )
      )
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "伺服器錯誤，稍後再試" });
  }
};

const deleteActivity = async (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.user.id;
  try {
    const [deleted] = await db
      .delete(activities)
      .where(
        and(
          eq(activities.id, id),
          eq(activities.createdBy, userId)
        )
      )
      .returning();

    if (!deleted) {
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
