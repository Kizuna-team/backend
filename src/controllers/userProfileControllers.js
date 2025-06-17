// 引入service資料夾要查詢使用者的 資料庫函式
const db = require("../db/index.js");

const { profileTable, photosTable } = require("../db/schema");
const { eq, not, and, inArray } = require("drizzle-orm"); // 引入 neq 用於不等於判斷
const { getProfileByIdFromDB } = require("../services/userProfile");
const { findCertainPhotos } = require("../services/userPhoto");

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
        interests: profileTable.interests,
        // location: profileTable.location,
        // gender: profileTable.gender,
        // orientation: profileTable.orientation,
      })
      .from(profileTable)
      .where(not(eq(profileTable.userId, userId)));

    console.log("typeof userId:", typeof userId);
    // 再把所有使用者 id 抓出來
    const targetUserIds = profilesRecord.map((user) => user.userId);

    // 撈出這些人的前三張照片
    const photoRecords = await Promise.all(
      targetUserIds.map((uid) =>
        findCertainPhotos(uid, { sequenceIn: [1, 2, 3] }).then((photos) => ({
          userId: uid,
          photos: photos.map((p) => ({
            image_url: p.image_url,
            sequence: p.sequence,
          })),
        }))
      )
    );

    // 把照片按 userId 分組 { userId: [...photos] }
    const photoMap = {};
    for (const photo of photoRecords) {
      photoMap[photo.userId] = photo.photos;
    }

    // 組合每個使用者 + 照片
    const usersWithPhotos = profilesRecord.map((user) => ({
      ...user,
      photos: photoMap[user.userId] || [], // 沒照片就給 []
    }));

    console.log("都撈到什麼？", usersWithPhotos);
    console.log("都撈到什麼？", usersWithPhotos);

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
