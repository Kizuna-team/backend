// 引入service資料夾要查詢使用者的 資料庫函式
const db = require("../db/index.js");
const { getProfileByIdFromDB } = require("../services/userProfile");

// Get (查看某使用者資料) /profile/:userId
// id 是字串，但 DB 欄位是數字，型態不匹配
export const getProfileById = async (req, res) => {
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
};
