// 引入service資料夾撈取使用者指定照片
const db = require("../db/index.js");
const {
  getPublicPhotosBySequences,
  getMyPhotoBySequence,
} = require("../services/userPhoto.js");

// 查自己的某張照片 (需登入)
// GET /photos/me/photo?photoSequence=1
const getMyPhoto = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "未授權操作，請先登入" });
    }

    const myPhoto = await getMyPhotoBySequence(userId, sequence);
    if (!myPhoto) return res.status(404).json({ message: "找不到這張照片" });

    return res.status(200).json(myPhoto);
  } catch (error) {
    console.error("GetPhoto failed:", error);
    res.status(500).json({ message: "伺服器錯誤", error: error.message });
  }
};

// 取得公開多張指定照片
// GET /photos/:userId/photos?photoSequences=1,2,3
const getPublicPhotos = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "未授權操作，請先登入" });
    }

    const rawSequences = req.query.photoSequences;
    if (!rawSequences) {
      return res.status(400).json({ message: "缺少指定的照片序號" });
    }

    const stringArray = rawSequences.split(",");
    const numberArray = stringArray.map((str) => Number(str.trim())); // 去除空白再轉數字
    const validSequences = numberArray.filter((n) => !isNaN(n)); // 移除非數字

    if (validSequences.length === 0) {
      return res.status(400).json({ message: "參數必須為有效數字" });
    }
    const publicPhotos = await getPublicPhotosBySequences(
      userId,
      validSequences
    );

    return res.status(200).json(publicPhotos);
  } catch (error) {
    console.error("GetPhoto failed:", error);
    res.status(500).json({ message: "伺服器錯誤", error: error.message });
  }
};
module.exports = {
  getMyPhoto,
  getPublicPhotos,
};
