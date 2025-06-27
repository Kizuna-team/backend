const db = require("../db");
const { photosTable } = require("../db/schema");
const { eq, and, not, inArray, gte, lte } = require("drizzle-orm");
const { getRandomAvatar } = require("../lib/defaultAvatars.js");

const findSpecifiedPhotos = async (userId, options = {}) => {
  const conditions = [eq(photosTable.userId, userId)];

  if (options.isAvatarOnly) {
    conditions.push(eq(photosTable.is_avatar, true));
  }

  if (Array.isArray(options.sequenceIn)) {
    conditions.push(inArray(photosTable.sequence, options.sequenceIn));
  }

  if (
    Array.isArray(options.sequenceRange) &&
    options.sequenceRange.length === 2
  ) {
    const [min, max] = options.sequenceRange;
    conditions.push(
      and(gte(photosTable.sequence, min), lte(photosTable.sequence, max))
    );
  }

  return await db
    .select()
    .from(photosTable)
    .where(and(...conditions));
};

const setAvatar = async (userId, key) => {
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

  await db
    .update(photosTable)
    .set({ is_avatar: true, sequence: -1 })
    .where(and(eq(photosTable.userId, userId), eq(photosTable.image_key, key)));
};

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
  findSpecifiedPhotos,
  setAvatar,
  assignAvatar,
};
