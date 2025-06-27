// 引入service資料夾要查詢使用者的 資料庫函式
const db = require("../db/index.js");

const { profileTable, photosTable } = require("../db/schema");
const { eq, not } = require("drizzle-orm"); // 引入 neq 用於不等於判斷
const { getProfileByIdFromDB } = require("../services/userProfile");
const { findSpecifiedPhotos } = require("../services/userPhoto");
const { getRecommendedUsers } = require("../services/recommendationService");

// GET 加入篩選邏輯的配對對象
// 拿到除了自己之外的所有使用者資料
const getSortedProfiles = async (req, res) => {
  try {
    const userId = req.user?.id;
    console.log("userId:", userId);
    if (!userId) {
      return res.status(401).json({ message: "未授權操作，請先登入" });
    }

    // 取得推薦排序清單
    const recommendedUsers = await getRecommendedUsers(userId);
    console.log("推薦對象筆數：", recommendedUsers.length);
    console.log(
      "推薦清單：",
      recommendedUsers.map((u) => u.userId)
    );

    const profilesRecord = await db
      .select({
        userId: profileTable.userId,
        name: profileTable.name,
        bio: profileTable.bio,
        age: profileTable.age,
        zodiac: profileTable.zodiac,
        mbti: profileTable.mbti,
        job: profileTable.job,
        city: profileTable.city,
      })
      .from(profileTable)
      .where(not(eq(profileTable.userId, userId))); // 排除自己

    console.log("typeof userId:", typeof userId);
    const profileMap = new Map();
    profilesRecord.forEach((p) => profileMap.set(p.userId, p));

    // 根據推薦順序排列
    const sortedProfiles = recommendedUsers
      .map((u) => profileMap.get(u.userId))
      .filter(Boolean); // 避免找不到 profile 時出錯

    // 撈照片（用排序後的 userId）
    const targetSortedIds = sortedProfiles.map((user) => user.userId);

    // 抓出所有 id 抓出來
    const targetUserIds = profilesRecord.map((target) => target.userId);

    // 從 sequence 1~6 中挑出最前面3張
    const photoRecords = await Promise.all(
      targetUserIds.map(async (targetId) => {
        const lifePhotos = await findSpecifiedPhotos(targetId, {
          sequenceRange: [1, 6],
        });

        // 只挑最小的三張（1~6）中的前3張
        const top3Photos = lifePhotos
          .filter((p) => p.sequence !== null) // 防止 sequence 是 null
          .sort((a, b) => a.sequence - b.sequence)
          .slice(0, 3)
          .map((p) => ({
            image_url: p.image_url,
            sequence: p.sequence,
          }));

        return {
          userId: targetId,
          photos: top3Photos,
        };
      })
    );

    // 把照片按 userId 分組 { userId: [...photos] }
    const photoMap = {};
    for (const record of photoRecords) {
      photoMap[record.userId] = record.photos;
    }

    // 組合每個使用者 + 照片
    const usersWithPhotos = sortedProfiles.map((user) => ({
      ...user,
      photos: photoMap[user.userId] || [],
    }));

    usersWithPhotos.forEach((user) => {
      console.log(` 使用者 ${user.userId} 的照片：`);
      user.photos.forEach((photo, index) => {
        console.log(`   第 ${index + 1} 張:`, photo);
      });
    });

    res.status(200).json({
      message: "取得配對對象成功",
      users: usersWithPhotos,
    });
  } catch (error) {
    console.error("getAllProfiles failed:", error.message);
    res.status(500).json({ message: "伺服器錯誤", error: error.message });
  }
};

// GET (查看單一使用者資料) /profile/:userId
// id 是字串，但 DB 欄位是數字
const getProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getProfileByIdFromDB(id);
    if (!user) return res.status(404).json({ message: "找不到使用者" });

    res.status(200).json(user);
  } catch (error) {
    console.error("getProfileById failed:", error.message);
    res.status(500).json({ message: "伺服器錯誤", error: error.message });
  }
};

module.exports = {
  getProfileById,
  getSortedProfiles,
};
