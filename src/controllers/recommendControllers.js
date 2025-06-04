const { getAdvancedRecommendedProfiles } = require("../services/recommendationService");

async function getRecommendations(req, res) {
  try {
    const {
      orientation,
      preferredGender,
      ageMin,
      ageMax,
      location,
      interests,
      limit,
      offset,
    } = req.query;

    const myInterests = interests ? interests.split(",") : [];

    const recommendations = await getAdvancedRecommendedProfiles({
      userOrientation: orientation,
      preferredGender: preferredGender,
      ageRange: [parseInt(ageMin), parseInt(ageMax)],
      location: location,
      myInterests: myInterests,
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0,
    });

    console.log(`推薦的人選共有${recommendations.length}個`)

    // 符合的人選
    console.log("✅ 符合推薦的人選：");
    recommendations.forEach((profile, index) => {
      console.log(
        `#${index + 1}: user_id=${profile.user_id}, age=${profile.age}, interests=${profile.interests}, score=${profile.finalScore}`
      );
    });

    res.json({ data: recommendations });
  } catch (err) {
    console.error("回傳getRecommendations發生錯誤的原因:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { getRecommendations };
