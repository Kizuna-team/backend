// 取得互相喜歡的使用者profiles/photos資料API
const db = require("../db/index.js");
const {
  createFriendship,
  getMatchedCard,
} = require("../services/matchingService.js");

const matchedBeFriend = async (req, res) => {
  const userId = req.user?.id;
  const { targetId } = req.body;

  if (!userId || !targetId) {
    return res.status(400).json({ message: "缺少必要資料" });
  }

  try {
    const roomId = await createFriendship(userId, targetId);

    // 呼叫 getMatchedCard 抓出雙方資訊
    const profiles = await getMatchedCard([userId, targetId]);
    const myProfile = profiles.find((p) => p.userId === userId);
    const targetProfile = profiles.find((p) => p.userId === targetId);

    return res.status(201).json({
      message: "已成為好友",
      roomId,
      myProfile,
      targetProfile,
    });
  } catch (error) {
    console.error(" matchedBeFriend failed:", error);
    res.status(500).json({ message: "伺服器錯誤，請稍後再試" });
  }
};

module.exports = {
  matchedBeFriend,
};

/* 
  [
    { userId: 1, name: "Melody", avatarUrl: "https://..." },
    { userId: 2, name: "Tom", avatarUrl: "https://..." },
  ]
*/
