const db = require("../db/index.js");
const {
  userPreferencesTable,
  userInterestsTable,
  profileTable,
} = require("../db/schema.js");
const { eq, ne } = require("drizzle-orm");
const { findSpecifiedPhotos } = require("./userPhoto.js");

const getUserInterests = async (userId) => {
  const rows = await db
    .select()
    .from(userInterestsTable)
    .where(eq(userInterestsTable.userId, userId));
  return rows.map((row) => row.interestId);
};

// 性別欄位值轉換 0:female 1:male
const genderToNum = (gender) => {
  if (gender === "female") return 0;
  if (gender === "male") return 1;
  else return -1; // 表示 未知未填寫
};

// 性向比對邏輯: 0同性 1異性 2都可
const matchOrientation = (orientation, userGender, targetGender) => {
  if (orientation === 2) return true;
  if (orientation === 0) return userGender === targetGender;
  if (orientation === 1) return userGender !== targetGender;
  return false;
};

// 完成名單過濾與排序
const getRecommendedUsers = async (userId) => {
  const currentUserPrefResult = await db
    .select()
    .from(userPreferencesTable)
    .where(eq(userPreferencesTable.userId, userId));

  const userPref = currentUserPrefResult[0];
  if (!userPref) {
    throw new Error(`找不到使用者 ${userId} 偏好資料`);
  }

  const targetPrefResult = await db
    .select()
    .from(userPreferencesTable)
    .where(ne(userPreferencesTable.userId, userId));

  const allProfiles = await db.select().from(profileTable);
  const profileMap = new Map();
  allProfiles.forEach((profile) => {
    profileMap.set(profile.userId, profile);
  });

  const userProfile = profileMap.get(userId);
  const userGender = genderToNum(userProfile?.gender);
  const userOrientation = userProfile?.orientation;
  const userInterests = await getUserInterests(userId);

  // 放寬條件 +- 5歲
  const filterAndScore = async (relaxAge = false) => {
    const ageMin = relaxAge ? userPref.ageMin - 5 : userPref.ageMin;
    const ageMax = relaxAge ? userPref.ageMax + 5 : userPref.ageMax;

    // 開始比對推薦對象
    const recommendations = await Promise.all(
      targetPrefResult.map(async (targetPref) => {
        const targetUserId = targetPref.userId;
        const targetProfile = profileMap.get(targetUserId);
        if (!targetProfile) return null;

        const targetGender = genderToNum(targetProfile.gender);
        const targetOrientation = targetProfile.orientation;
        const targetAge = targetProfile.age;

        // 雙向性向條件檢查 彼此接受
        const isMatch =
          matchOrientation(userOrientation, userGender, targetGender) &&
          matchOrientation(targetOrientation, targetGender, userGender);

        // 年齡、性向不符跳過
        if (!isMatch || targetAge < ageMin || targetAge > ageMax) return null;

        // 補檢查照片: 至少一張有效照片
        const targetPhotos = await findSpecifiedPhotos(targetUserId, {
          sequenceRange: [1, 6],
        });
        if (!targetPhotos || targetPhotos.length < 1) return null;

        // 年齡通過篩選 +分
        let score = 0;
        if (targetAge >= ageMin && targetAge <= ageMax) {
          score++;
        }

        if (targetPref.musicMatch === userPref.musicMatch) score++;
        if (targetPref.introvertOrExtrovert === userPref.introvertOrExtrovert)
          score++;
        if (targetPref.pet === userPref.pet) score++;
        if (targetPref.wakeUpTime === userPref.wakeUpTime) score++;

        const targetInterests = await getUserInterests(targetUserId);
        const sharedInterests = targetInterests.filter((i) =>
          userInterests.includes(i)
        );
        score += sharedInterests.length;

        return {
          userId: targetUserId,
          photos: targetPhotos,
          score,
          name: targetProfile?.name || "",
          age: targetProfile?.age || null,
          city: targetProfile?.city || "",
          mbti: targetProfile?.mbti || "",
          zodiac: targetProfile?.zodiac || "",
          job: targetProfile?.job || "",
          bio: targetProfile?.bio || "",
          ...targetPref,
        };
      })
    );
    return recommendations
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10) // 改這邊
      .map(({ score, ...rest }) => rest); // 拿掉 score 再傳給前端
  };
  const data = await filterAndScore(false);

  // 加上 relaxed 標記
  return {
    relaxed: false,
    data,
  };
};

// 多圖整理 + 資料回傳
const sortedProfileWithPhotos = async (userId) => {
  const { data: finalRecommendations, relaxed } = await getRecommendedUsers(
    userId
  );

  const targetUserIds = finalRecommendations.map((u) => u.userId);
  console.log("推薦對象筆數：", finalRecommendations.length);
  console.log(
    "推薦清單：",
    finalRecommendations.map((u) => u.userId)
  );

  const photoRecords = await Promise.all(
    targetUserIds.map(async (targetId) => {
      const lifePhotos = await findSpecifiedPhotos(targetId, {
        sequenceRange: [1, 6],
      });
      // 最多取前 3 張生活照（依據sequence）不足取現有的
      const top3Photos = lifePhotos
        .filter((p) => p.sequence !== null)
        .sort((a, b) => a.sequence - b.sequence)
        .slice(0, 3) // 設幾張都能穩定處理
        .map((p) => ({
          image_url: p.image_url,
          sequence: p.sequence,
        }));

      return { userId: targetId, photos: top3Photos };
    })
  );

  const photoMap = new Map();
  photoRecords.forEach((r) => photoMap.set(r.userId, r.photos));

  const result = finalRecommendations
    .map((u) => {
      const photos = photoMap.get(u.userId) || [];
      if (photos.length === 0) return null;
      return { ...u, photos };
    })
    .filter(Boolean);

  return { relaxed, data: result };
};

module.exports = { getRecommendedUsers, sortedProfileWithPhotos };
