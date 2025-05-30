// src/services/recommendationService.js
const db = require("../db/index.js");
const { profileTable } = require("../db/schema.js");
const { eq, and, between, gte } = require("drizzle-orm");

// 計算興趣交集分數
function computeInterestScore(myInterests, targetInterests) {
  const set1 = new Set(myInterests);
  const set2 = new Set(targetInterests);

  let intersectionCount = 0;
  set2.forEach((interest) => {
    if (set1.has(interest)) {
      intersectionCount++;
    }
  });

  return intersectionCount;
}

// 推薦邏輯 以後這些資料應該要從前端的網址中拿
async function getAdvancedRecommendedProfiles({
  userOrientation,
  preferredGender,
  ageRange = [20, 35],
  location,
  activeWithinDays = 7,
  myInterests = [],
  limit = 20,
  offset = 0,
}) {
  const activeSince = new Date();
  activeSince.setDate(activeSince.getDate() - activeWithinDays);

  // 撈出符合條件的 profile
  const rawProfiles = await db
    .select()
    .from(profileTable)
    .where(
      and(
        eq(profileTable.gender, preferredGender),
        between(profileTable.age, ageRange[0], ageRange[1]),
        eq(profileTable.location, location),
        gte(profileTable.last_active_at, activeSince)
      )
    )
    .limit(30) // 撈 30 筆做排序
    .offset(offset);

  // 排序邏輯
  const scoredProfiles = rawProfiles.map((profile) => {
    const interestScore = computeInterestScore(myInterests, profile.interests);
    // 距離今天有多久沒登入了
    const daysSinceActive =
      // (現在時間 - 對方最後登入時間) / 一天的毫秒數 1000 * 60 * 60 * 24
      (Date.now() - new Date(profile.last_active_at).getTime()) /
      (86400000);
    // 今天有登入 0 天 => 分數 7 分
    const recentActiveScore = Math.max(0, 7 - daysSinceActive);

    const finalScore = interestScore * 3 + recentActiveScore * 2;

    return {
      ...profile,
      interestScore,
      recentActiveScore,
      finalScore,
    };
  });

  // 依 finalScore 排序
  const sortedProfiles = scoredProfiles
    // 這樣 會依 finalScore 由大到小排序  
    .sort((a, b) => b.finalScore - a.finalScore)
    // 我們從中取 30 筆
    .slice(0, limit);

  return sortedProfiles;
}

module.exports = {
  getAdvancedRecommendedProfiles,
};

