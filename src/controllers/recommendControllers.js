const { getRecommendedUsers } = require("../services/recommendationService.js");

async function getRecommendations(req, res) {
  const userId = Number(req.params.userId);

  if (!userId) {
    return res.status(404).json({ error: "使用者資料不存在" });
  }

  try {
    const matches = await getRecommendedUsers(userId);
    res.status(200).json(matches);
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "內部伺服器錯誤" });
  }
}

module.exports = { getRecommendations };
