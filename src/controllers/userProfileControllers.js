const db = require("../db/index.js");

const { profileTable, photosTable } = require("../db/schema");
const { eq, not } = require("drizzle-orm");

const { getProfileByIdFromDB } = require("../services/userProfile");

const { findSpecifiedPhotos } = require("../services/userPhoto");
const { getRecommendedUsers } = require("../services/recommendationService");

// GET 篩選邏輯的配對對象 「推薦排序 + 個人資料 + 照片」
const getSortedProfiles = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "未授權操作，請先登入" });
    }
    res.status(200).json({
      message: "取得配對對象成功",
      users: recommendedUsers,
    });
  } catch (error) {
    console.error("getSortedProfiles failed:", error);
    res.status(500).json({ message: "伺服器錯誤", error: error.message });
  }
};

const getProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getProfileByIdFromDB(id);
    if (!user) return res.status(404).json({ message: "找不到使用者" });

    res.status(200).json(user);
  } catch (error) {
    console.error("getProfileById failed:", error.message);
    res.status(500).json({ message: "伺服器錯誤", error: error.message });
  }
};

module.exports = {
  getProfileById,
  getSortedProfiles,
};
