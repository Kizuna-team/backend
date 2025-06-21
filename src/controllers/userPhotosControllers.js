// 引入service資料夾撈取使用者指定照片
const { findSpecifiedPhotos } = require("../services/userPhoto.js");

// 撈取某user的大頭照
const getAvatarPhoto = async (req, res) => {
  const userId = Number(req.params.userId);
  if (!userId) return res.status(400).json({ message: "缺少 userId" });

  try {
    const [photo] = await findSpecifiedPhotos(userId, { isAvatarOnly: true });
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
    const photos = await findSpecifiedPhotos(userId, { sequenceIn: [1, 2, 3] });
    const randomPhotos = allPhotos.sort(() => 0.5 - Math.random());

    // 取前3張（如果不足3張，就取有的）
    const selected = randomPhotos.slice(0, 3);

    res.json(selected);
  } catch (err) {
    console.error("取得配對照片失敗", err);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};

module.exports = {
  getAvatarPhoto,
  getMatchPhotos,
};
