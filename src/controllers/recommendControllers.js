const {
  getRecommendationsLogic,
} = require("../services/recommendationService");
const db = require("../db/index.js");

async function getRecommendations(req, res) {
  // TODO: 安全性：這裡目前從 req.body 拿 userId，未來正式版應改用 token 驗證
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "使用者資料不存在" });
  }

  try {
    const matches = await getRecommendationsLogic(userId);
    res.status(200).json(matches);
  } catch (error) {
    console.error("Error getting recommendations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { getRecommendations };
