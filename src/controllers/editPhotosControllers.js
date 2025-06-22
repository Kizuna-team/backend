const fs = require("fs");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { s3 } = require("../db/s3");
const db = require("../db");
const { photosTable } = require("../db/schema");
const { eq, and } = require("drizzle-orm");
const { findSpecifiedPhotos, setAvatar } = require("../services/userPhoto.js");

const getMyAvatarPhoto = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "未授權操作，請先登入" });

  try {
    const [photo] = await findSpecifiedPhotos(userId, { isAvatarOnly: true });
    res.json(photo || {});
  } catch (err) {
    console.error("取得本人大頭貼失敗", err);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};

// 大頭照要額外用 isAvatar = true 告訴後端「這不用 sequence」
const uploadImage = async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: "沒有圖片" });
  }

  const userId = req.user?.id;
  const fileKey = `${Date.now()}-${file.originalname}`;
  const fileStream = fs.createReadStream(file.path);

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileKey,
        Body: fileStream,
        ContentType: file.mimetype,
      })
    );

    fs.unlinkSync(file.path);

    const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    let sequence = null;
    const isAvatar = req.body.isAvatar === "true";

    if (!isAvatar && "sequence" in req.body) {
      sequence = Number(req.body.sequence);
      if (!Number.isInteger(sequence) || sequence < 1) {
        return res.status(400).json({ message: "sequence 無效" });
      }
    }

    const [newPhoto] = await db
      .insert(photosTable)
      .values({
        image_url: imageUrl,
        image_key: fileKey,
        userId,
        sequence, // 有給就儲存，沒給就 null
        is_avatar: isAvatar, // 用傳來的判斷值
      })
      .returning();

    res.status(201).json({
      message: "上傳成功",
      url: imageUrl,
      key: fileKey,
      sequence: newPhoto.sequence,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).send("上傳失敗");
  }
};

const getPhotos = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "未授權操作，請先登入" });

  try {
    const photos = await findSpecifiedPhotos(userId);
    res.json(photos);
  } catch (err) {
    console.error("取得照片失敗", err);
    res.status(500).json({ message: "伺服器錯誤", error: err.message });
  }
};

const deletePhoto = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "未授權操作，請先登入" });

  const { key } = req.params;

  try {
    const [photo] = await db
      .select()
      .from(photosTable)
      .where(
        and(eq(photosTable.image_key, key), eq(photosTable.userId, userId))
      );

    if (!photo) {
      return res.status(403).json({ message: "你無權刪除此圖片" });
    }

    // 刪 S3
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
      })
    );

    // 刪資料庫
    await db.delete(photosTable).where(eq(photosTable.image_key, key));

    res.json({ message: `已刪除：${key}` });
  } catch (err) {
    console.error("刪除失敗", err);
    res.status(500).json({ message: "伺服器錯誤", error: err.message });
  }
};

const changeAvatar = async (req, res) => {
  const userId = req.user?.id;
  const { key } = req.body;
  if (!userId) return res.status(401).json({ message: "未授權操作，請先登入" });

  if (!key || typeof key !== "string") {
    return res.status(400).json({ message: "無效或空的圖片 key" });
  }

  try {
    const result = await setAvatar(userId, key); // 執行設定大頭貼

    res.json({ message: "大頭貼已更新", result });
  } catch (err) {
    console.error("更新大頭貼失敗", err);
    res.status(500).json({ message: "伺服器錯誤", error: err.message });
  }
};

module.exports = {
  uploadImage,
  getPhotos,
  deletePhoto,
  getMyAvatarPhoto,
  changeAvatar,
};
