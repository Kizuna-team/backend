const db = require("../db/index.js");
const { and, eq, inArray } = require("drizzle-orm");
const { getUserFirstPhoto } = require("../services/userAvatar.js");

const {
  likesTable,
  superLikesTable,
  photosTable,
  profileTable,
} = require("../db/schema.js");

// 查出所有喜歡我的人ID
const getLikedMeUserIds = async (userId) => {
  // 查詢喜歡表 status = 1 對我按「Like」的使用者 ID
  const likesRecord = await db
    .select({ userId: likesTable.userId })
    .from(likesTable)
    .where(and(eq(likesTable.targetId, userId), eq(likesTable.status, 1)));

  // 查詢超級喜歡表 對我按「Super Like」的使用者 ID
  const superLikesRecord = await db
    .select({ userId: superLikesTable.userId })
    .from(superLikesTable)
    .where(eq(superLikesTable.targetId, userId));

  // 合併兩張表取出的陣列 變成一個喜歡我的 userIds陣列
  const likesUserIds = likesRecord.map((like) => like.userId);
  const superLikesIds = superLikesRecord.map((superLike) => superLike.userId);
  const combinedUserIds = [...likesUserIds, ...superLikesIds];
  // 去除陣列重複元素，前端或合併多來源時用 Set 去重，轉回陣列
  const filteredUserIds = Array.from(new Set(combinedUserIds));

  // 找不到有人按過我喜歡 > 提早結束
  if (filteredUserIds.length === 0) return [];

  //拿到所有對你有「喜歡」或「超級喜歡」紀錄的使用者 ID
  return filteredUserIds;
};

// 查出所有我喜歡的人ID
const getMyLikedTargetIds = async (userId) => {
  const likesRecord = await db
    .select({ targetId: likesTable.targetId })
    .from(likesTable)
    .where(and(eq(likesTable.userId, userId), eq(likesTable.status, 1)));
  const superLikesRecord = await db
    .select({ targetId: superLikesTable.targetId })
    .from(superLikesTable)
    .where(and(eq(superLikesTable.userId, userId)));

  // 合併兩張表取出的陣列 變成一個我喜歡的 targetIds陣列 去除重複元素
  const likesTargetIds = likesRecord.map((like) => like.targetId);
  const superLikesTargetIds = superLikesRecord.map(
    (superLike) => superLike.targetId
  );
  const combinedTargetIds = [...likesTargetIds, ...superLikesTargetIds];
  const filteredTargetIds = Array.from(new Set(combinedTargetIds));
  return filteredTargetIds;
};

// 找出互相喜歡的 userId 清單
// 找人名單（配對ID清單），查出雙方互相有興趣的人ID
const getMatchedUserIds = async (userId) => {
  const likedMe = await getLikedMeUserIds(userId);
  const iLiked = await getMyLikedTargetIds(userId);

  if (likedMe.length === 0 || iLiked.length === 0) return [];

  // 找雙方互相喜歡的交集，用 Set 做交集比對
  // 從 likedMe 中找出 ID 也在 iLikedSet 裡面的
  // 篩出「那些對我有好感的人中，我也喜歡他們的人」
  const iLikedSet = new Set(iLiked);
  const matchedUserIds = likedMe.filter((id) => iLikedSet.has(id));

  return matchedUserIds;
};

// 根據 userId 撈取基本資料 根據名單去找人資料
const getMatchedName = async (userIds) => {
  if (userIds.length === 0) return [];

  // 撈出所有配對使用者的資料和照片（可能多筆）
  return await db
    .select({
      userId: profileTable.userId,
      name: profileTable.name,
    })
    .from(profileTable)
    .where(inArray(profileTable.userId, userIds));
};

// 直接抓出名字跟照片 所有配對對象的名稱與大頭貼
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

// 封裝頁面直接調用
const fetchMatchedUsers = async (userId) => {};

module.exports = {
  getLikedMeUserIds, // 喜歡我的
  getMyLikedTargetIds, // 我喜歡的
  getMatchedUserIds, // 互相喜歡的
  getMatchedName, // 取得互相喜歡的使用者的個人檔案資料
  getMatchedCard, // 所有配對對象的名稱與大頭貼
};
