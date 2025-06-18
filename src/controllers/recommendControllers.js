const { getRecommendedUsers } = require("../services/recommendationService.js");

async function getRecommendations(req, res) {
  const userId = Number(req.params.userId);

  if (!userId) {
    return res.status(400).json({ error: "使用者資料不存在" });
  }

  try {
    const matches = await getRecommendedUsers(userId);
    // console.log(matches.length);
    res.status(200).json(matches);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { getRecommendations };
