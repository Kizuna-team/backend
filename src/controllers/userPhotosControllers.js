const { findSpecifiedPhotos } = require("../services/userPhoto.js");

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

const getMatchPhotos = async (req, res) => {
  const userId = Number(req.params.userId);
  if (!userId) return res.status(400).json({ message: "缺少 userId" });

  try {
    const photos = await findSpecifiedPhotos(userId, { sequenceIn: [1, 2, 3] });

    const randomPhotos = photos.sort(() => 0.5 - Math.random());

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
