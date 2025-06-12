const { eq, inArray } = require("drizzle-orm");
const { photosTable } = require("../db/schema");
const db = require("../db");

// 用id 指定撈取自己的某張照片（要登入 自己看自己的）
const getMyPhotoBySequence = async (userId, sequence) => {
  const [photo] = await db
    .select()
    .from(photosTable)
    .where(
      and(eq(photosTable.userId, userId), eq(photosTable.sequence, sequence))
    )
    .limit(1);
  return photo || null;
};

// 用Sequence 撈取指定的排序照片 （不用登入）
const getPublicPhotosBySequences = async (targetId, sequences) => {
  return await db
    .select()
    .from(photosTable)
    .where(
      and(
        eq(photosTable.userId, targetId),
        inArray(photosTable.sequence, sequences)
      )
    );
};

module.exports = {
  getMyPhotoBySequence,
  getPublicPhotosBySequences,
};
