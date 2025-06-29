const db = require("../db");

const { userInterestsTable, userPreferencesTable } = require("../db/schema");
const { eq } = require("drizzle-orm");

const saveUserInterests = async (req, res) => {
  const userId = req.user?.id;
  const { interestIds } = req.body;

  if (!Array.isArray(interestIds) || interestIds.length === 0) {
    return res.status(400).json({ message: "請挑選至少一個你感興趣的選項" });
  }

  try {
    await db
      .delete(userInterestsTable)
      .where(eq(userInterestsTable.userId, userId));

    const newInterests = interestIds.map((id) => ({
      userId,
      interestId: id,
    }));
    await db.insert(userInterestsTable).values(newInterests);

    res.json({ message: "興趣成功儲存 userInterests" });
  } catch (err) {
    console.error("興趣儲存失敗", err);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};

const saveUserPreference = async (req, res) => {
  const userId = req.user?.id;
  const { musicMatch, introvertOrExtrovert, pet, wakeUpTime, ageMin, ageMax } =
    req.body;

  if (
    !userId ||
    !musicMatch ||
    !introvertOrExtrovert ||
    !pet ||
    !wakeUpTime ||
    !ageMin ||
    !ageMax
  ) {
    return res.status(400).json({ message: "缺少必要欄位" });
  }
  try {
    await db
      .delete(userPreferencesTable)
      .where(eq(userPreferencesTable.userId, userId));

    await db.insert(userPreferencesTable).values({
      userId,
      musicMatch,
      introvertOrExtrovert,
      pet,
      wakeUpTime,
      ageMin,
      ageMax,
    });

    res.json({ success: true, message: "使用者偏好已儲存" });
  } catch (err) {
    console.error("偏好儲存失敗", err);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};

module.exports = { saveUserInterests, saveUserPreference };
