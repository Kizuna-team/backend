// 引入service資料夾要查詢使用者的 資料庫函式
const db = require("../db/index.js");

const { profileTable, photosTable } = require("../db/schema");
const { eq, not } = require("drizzle-orm"); // 引入 neq 用於不等於判斷
const { getProfileByIdFromDB } = require("../services/userProfile");
const { findSpecifiedPhotos } = require("../services/userPhoto");

// GET (多個配對對象，未加入篩選邏輯)
// 拿到除了自己之外的所有使用者資料
const getAllProfiles = async (req, res) => {
  try {
    const userId = req.user?.id;
    console.log("userId:", userId);
    if (!userId) {
      return res.status(401).json({ message: "未授權操作，請先登入" });
    }

    const profilesRecord = await db
      .select({
        userId: profileTable.userId,
        name: profileTable.name,
        bio: profileTable.bio,
        age: profileTable.age,
        zodiac: profileTable.zodiac,
        mbti: profileTable.mbti,
        job: profileTable.job,
      })
      .from(profileTable)
      .where(not(eq(profileTable.userId, userId))); // 排除自己

    console.log("typeof userId:", typeof userId);

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
    const usersWithPhotos = profilesRecord.map((user) => ({
      ...user,
      photos: photoMap[user.userId] || [], // 沒照片就給 []
    }));

    usersWithPhotos.forEach((user) => {
      console.log(`👤 使用者 ${user.userId} 的照片：`);
      user.photos.forEach((photo, index) => {
        console.log(`  📸 第 ${index + 1} 張:`, photo);
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
  getAllProfiles,
};
