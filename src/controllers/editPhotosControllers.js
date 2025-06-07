const fs = require("fs");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { s3 } = require("../db/s3");
const db = require("../db");
const { photosTable } = require("../db/schema");
const { eq } = require("drizzle-orm");

const uploadImage = async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("沒有圖片");

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

    await db.insert(photosTable).values({
      image_url: imageUrl,
      image_key: fileKey,
    });

    res.status(201).json({
      message: "上傳成功",
      url: imageUrl,
      key: fileKey,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).send("上傳失敗");
  }
};

const getPhotos = async (req, res) => {
  try {
    const photos = await db.select().from(photosTable);
    res.json(photos);
  } catch (err) {
    console.error("取得照片失敗", err);
    res.status(500).send("無法取得照片");
  }
};

const deletePhoto = async (req, res) => {
  const { key } = req.params;

  try {
    // 1. 刪 S3
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
      })
    );

    // 2. 刪資料庫
    await db.delete(photosTable).where(eq(photosTable.image_key, key));

    res.json({ message: `已刪除：${key}` });
  } catch (err) {
    console.error("刪除失敗", err);
    res.status(500).send("刪除圖片失敗");
  }
};

module.exports = {
  uploadImage,
  getPhotos,
  deletePhoto,
};
