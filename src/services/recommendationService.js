const db = require("../db/index.js");
const {
  userPreferencesTable,
  userInterestsTable,
  profileTable,
} = require("../db/schema.js");
const { eq, ne } = require("drizzle-orm");
const { findSpecifiedPhotos } = require("./userPhoto.js");

async function getUserInterests(userId) {
  const rows = await db
    .select()
    .from(userInterestsTable)
    .where(eq(userInterestsTable.userId, userId));

  return rows.map((row) => row.interestId);
}

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

async function getRecommendedUsers(userId) {
  const currentUserPrefResult = await db
    .select()
    .from(userPreferencesTable)
    .where(eq(userPreferencesTable.userId, userId));

  const userPref = currentUserPrefResult[0];
  if (!userPref) {
    throw new Error(`無法找到使用者 ${userId}`);
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

  const filterAndScore = async (relaxAge = false) => {
    const ageMin = relaxAge ? userPref.ageMin - 5 : userPref.ageMin;
    const ageMax = relaxAge ? userPref.ageMax + 5 : userPref.ageMax;

    console.log(`🎯 比對條件：ageMin=${ageMin}, ageMax=${ageMax}`);

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

        if (!isMatch) return null;

        // 年齡不符跳過
        if (targetAge < ageMin || targetAge > ageMax) {
          console.log(`🚫 排除年齡不符：${targetProfile.name} (${targetAge})`);
          return null;
        }
        // 補檢查照片數量 過濾條件
        const targetPhotos = await findSpecifiedPhotos(targetUserId, {
          sequenceRange: [1, 6],
        });
        if (!targetPhotos || targetPhotos.length < 1) {
          return null;
        }

        let score = 0;
        score++; // 年齡已通過篩選
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

    const sorted = recommendations
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);

    const finalRecommendations = sorted
      .slice(0, 5) // 改這邊
      .map(({ score, ...rest }) => rest); // 拿掉 score 再傳給前端

    console.log("這是sorted出來的值:", sorted);

    return finalRecommendations;
  };
  // 嘗試先用 原本年齡區間
  let hardSortedResult = await filterAndScore(false);
  let relaxed = false;

  const minResult = 20;

  // 如果找不到 放寬條件
  if (hardSortedResult.length < minResult) {
    const relaxedSortedResult = await filterAndScore(true);
    if (relaxedSortedResult.length > hardSortedResult.length) {
      hardSortedResult = relaxedSortedResult;
      relaxed = true;
    }
  }

  const sorted = hardSortedResult
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  const finalRecommendations = sorted
    .slice(0, 10)
    .map(({ score, ...rest }) => rest);

  console.log(" 篩選後的對象：", finalRecommendations.length, "人");
  console.log(" 回傳結果：", {
    relaxed,
    finalRecommendations,
  });
  return {
    relaxed,
    data: finalRecommendations,
  };
}
module.exports = { getRecommendedUsers };
