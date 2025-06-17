// 取得互相喜歡的使用者profiles/photos資料API
const db = require("../db/index.js");
const { profileTable, photosTable } = require("../db/schema");
const { eq, and, inArray } = require("drizzle-orm");

const {
  getLikedMeUserIds, // 喜歡我的
  getMyLikedTargetIds, // 我喜歡的
  getMatchedUserIds, // 互相喜歡
} = require("../services/matchingService");

// 取得互相喜歡的使用者的資料
const getMatchedUserData = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "未授權操作，請先登入" });
    }
    const matchedUserIds = await getMatchedUserIds(userId);

    return res.status(200).json({ matchedUserIds });
  } catch (error) {
    console.error("getMatchedUserData failed:", error);
    res.status(500).json({ message: "伺服器錯誤", error: error.message });
  }
};

module.exports = {
  getMatchedUserData,
};
