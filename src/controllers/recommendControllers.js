const {
  getAdvancedRecommendedProfiles,
} = require("../services/recommendationService");
const db = require("../db/index.js");
const { profileTable } = require("../db/schema");
const { eq } = require("drizzle-orm");

async function getRecommendations(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    // console.log(userId)
    const [userProfile] = await db
      .select()
      .from(profileTable)
      .where(eq(profileTable.userId, userId))
      .limit(1);

    if (!userProfile) {
      return res.status(404).json({ error: "使用者資料不存在" });
    }

    const {
      orientation,
      preferredGender,
      ageMin,
      ageMax,
      location,
      interests,
    } = userProfile;
    // console.log("interests 型別是：", typeof interests);

    const limit = parseInt(req.query.limit) || 5; //這裡
    const offset = parseInt(req.query.offset) || 0;
    console.log("req.query:", req.query);

    const myInterests = interests ? interests.split(",") : [];

    const recommendations = await getAdvancedRecommendedProfiles({
      userOrientation: orientation,
      preferredGender: preferredGender,
      ageRange: [parseInt(ageMin), parseInt(ageMax)],
      location: location,
      myInterests: myInterests,
      limit: parseInt(limit) || 5,
      offset: parseInt(offset) || 0,
    });

    console.log(`推薦的人選共有${recommendations.length}個`);

    // 符合的人選
    console.log("✅ 符合推薦的人選：");
    recommendations.forEach((profile, index) => {
      console.log(
        `#${index + 1}: user_id=${profile.userId}, age=${
          profile.age
        }, interests=${profile.interests}, score=${profile.finalScore}`
      );
    });

    res.json({ data: recommendations });
  } catch (err) {
    console.error("回傳getRecommendations發生錯誤的原因:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { getRecommendations };
