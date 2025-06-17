// 引入service資料夾撈取使用者指定照片
const { findCertainPhotos } = require("../services/userPhoto.js");

// 撈取某user的大頭照
const getAvatarPhoto = async (req, res) => {
  const userId = Number(req.params.userId);
  if (!userId) return res.status(400).json({ message: "缺少 userId" });

  try {
    const [photo] = await findCertainPhotos(userId, { isAvatarOnly: true });
    res.json(photo || {});
  } catch (err) {
    console.error("取得大頭貼失敗", err);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};

// 設定配對池的三張照片
const getMatchPhotos = async (req, res) => {
  const userId = Number(req.params.userId);
  if (!userId) return res.status(400).json({ message: "缺少 userId" });

  try {
    const photos = await findCertainPhotos(userId, { sequenceIn: [1, 2, 3] });
    res.json(photos);
  } catch (err) {
    console.error("取得配對照片失敗", err);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};

module.exports = {
  getAvatarPhoto,
  getMatchPhotos,
};
