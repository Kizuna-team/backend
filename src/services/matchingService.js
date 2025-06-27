const db = require("../db/index.js");
const { and, eq, inArray, or } = require("drizzle-orm");
const { v4: uuidv4 } = require("uuid");
const {
  likesTable,
  superLikesTable,
  photosTable,
  profileTable,
  friendshipsTable,
} = require("../db/schema.js");

const createFriendship = async (userId, targetId) => {
  const friendshipRecord = await db
    .select()
    .from(friendshipsTable)
    .where(
      or(
        and(
          eq(friendshipsTable.user_id, userId),
          eq(friendshipsTable.friend_id, targetId)
        ),
        and(
          eq(friendshipsTable.user_id, targetId),
          eq(friendshipsTable.friend_id, userId)
        )
      )
    );

  if (friendshipRecord.length > 0) {
    return friendshipRecord[0].room_id;
  }

  const roomId = uuidv4();

  await db.insert(friendshipsTable).values([
    { user_id: userId, friend_id: targetId, room_id: roomId },
    { user_id: targetId, friend_id: userId, room_id: roomId },
  ]);

  return roomId;
};

const getLikedMeUserIds = async (userId) => {
  const likesRecord = await db
    .select({ userId: likesTable.userId })
    .from(likesTable)
    .where(and(eq(likesTable.targetId, userId), eq(likesTable.status, 1)));

  const superLikesRecord = await db
    .select({ userId: superLikesTable.userId })
    .from(superLikesTable)
    .where(eq(superLikesTable.targetId, userId));

  const likesUserIds = likesRecord.map((like) => like.userId);
  const superLikesIds = superLikesRecord.map((superLike) => superLike.userId);
  const combinedUserIds = [...likesUserIds, ...superLikesIds];

  const filteredUserIds = Array.from(new Set(combinedUserIds));

  if (filteredUserIds.length === 0) return [];

  return filteredUserIds;
};

const getMyLikedTargetIds = async (userId) => {
  const likesRecord = await db
    .select({ targetId: likesTable.targetId })
    .from(likesTable)
    .where(and(eq(likesTable.userId, userId), eq(likesTable.status, 1)));
  const superLikesRecord = await db
    .select({ targetId: superLikesTable.targetId })
    .from(superLikesTable)
    .where(and(eq(superLikesTable.userId, userId)));

  const likesTargetIds = likesRecord.map((like) => like.targetId);
  const superLikesTargetIds = superLikesRecord.map(
    (superLike) => superLike.targetId
  );
  const combinedTargetIds = [...likesTargetIds, ...superLikesTargetIds];
  const filteredTargetIds = Array.from(new Set(combinedTargetIds));
  return filteredTargetIds;
};

const getMatchedUserIds = async (userId) => {
  const likedMe = await getLikedMeUserIds(userId);
  const iLiked = await getMyLikedTargetIds(userId);

  if (likedMe.length === 0 || iLiked.length === 0) return [];

  const iLikedSet = new Set(iLiked);
  const matchedUserIds = likedMe.filter((id) => iLikedSet.has(id));

  return matchedUserIds;
};

const getMatchedName = async (userIds) => {
  if (userIds.length === 0) return [];

  return await db
    .select({
      userId: profileTable.userId,
      name: profileTable.name,
    })
    .from(profileTable)
    .where(inArray(profileTable.userId, userIds));
};

const getMatchedCard = async (userIds) => {
  if (userIds.length === 0) return [];

  return await db
    .select({
      userId: profileTable.userId,
      name: profileTable.name,
      avatarUrl: photosTable.image_url,
    })
    .from(profileTable)
    .leftJoin(
      photosTable,
      and(
        eq(profileTable.userId, photosTable.userId),
        eq(photosTable.is_avatar, true)
      )
    )
    .where(inArray(profileTable.userId, userIds));
};

module.exports = {
  getLikedMeUserIds,
  getMyLikedTargetIds,
  getMatchedUserIds,
  getMatchedName,
  getMatchedCard,
  createFriendship,
};
