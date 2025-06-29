const { getRecommendedUsers } = require("../services/recommendationService.js");

async function getRecommendations(req, res) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "未授權操作，請先登入" });
  }
  try {
    const matches = await getRecommendedUsers(userId);
    res.status(200).json(matches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "內部伺服器錯誤" });
  }
}

module.exports = { getRecommendations };
