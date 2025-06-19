const db = require("../db");
const { photosTable } = require("../db/schema");
const { eq, and, not, inArray } = require("drizzle-orm");
const { getRandomAvatar } = require("../lib/defaultAvatars.js");

// 特定照片查找工具
const findCertainPhotos = async (userId, options = {}) => {
  const conditions = [eq(photosTable.userId, userId)];

  // 只會查詢被標記為頭像的照片
  if (options.isAvatarOnly) {
    conditions.push(eq(photosTable.is_avatar, true));
  }

  // 只會查詢 sequence 欄位的值在這個陣列中的照片
  if (Array.isArray(options.sequenceIn)) {
    conditions.push(inArray(photosTable.sequence, options.sequenceIn));
  }

  // 只有同時滿足所有指定條件才返回
  return await db
    .select()
    .from(photosTable)
    .where(and(...conditions));
};

// 設定大頭照 注意key是字串型別
const setAvatar = async (userId, key) => {
  // 清除原本大頭貼
  const oldAvatar = await db
    .select()
    .from(photosTable)
    .where(
      and(
        eq(photosTable.userId, userId),
        eq(photosTable.is_avatar, true),
        not(eq(photosTable.image_key, key))
      )
    );

  if (oldAvatar.length > 0) {
    const oldIds = oldAvatar.map((item) => item.id);
    await db.delete(photosTable).where(inArray(photosTable.id, oldIds));
  }

  // 設定新大頭貼
  await db
    .update(photosTable)
    .set({ is_avatar: true, sequence: null })
    .where(and(eq(photosTable.userId, userId), eq(photosTable.image_key, key)));
};

// 註冊預設隨機大頭照
const assignAvatar = async (userId) => {
  const avatar = getRandomAvatar();
  await db.insert(photosTable).values({
    userId,
    image_url: avatar.url,
    image_key: avatar.key,
    is_avatar: true,
    source: "default",
    sequence: null,
  });
};

module.exports = {
  findCertainPhotos,
  setAvatar,
  assignAvatar,
};
