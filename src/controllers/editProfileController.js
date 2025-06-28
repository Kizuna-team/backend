const db = require("../db/index.js");
const { profileTable } = require("../db/schema");
const { eq } = require("drizzle-orm");

const getProfile = async (req, res) => {
  console.log("getProfile req.user:", req.user);
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "未授權操作，請先登入" });
    }

    const result = await db
      .select({
        userId: profileTable.userId,
        name: profileTable.name,
        gender: profileTable.gender,
        orientation: profileTable.orientation,
        bio: profileTable.bio,
        age: profileTable.age,
        city: profileTable.city,
        zodiac: profileTable.zodiac,
        mbti: profileTable.mbti,
        job: profileTable.job,
      })
      .from(profileTable)
      .where(eq(profileTable.userId, userId));

    const userProfile = result[0];

    if (!userProfile) {
      return res.json({
        message: "使用者尚未建立個人資料",
        user: {
          id: null,
          name: "",
          gender: "",
          orientation: "",
          bio: "",
          age: null,
          city: "",
          zodiac: "",
          mbti: "",
          job: "",
        },
      });
    }

    res.json({ message: "使用者資料取得成功", user: userProfile });
  } catch (error) {
    console.error("Get profile failed:", error);
    res.status(500).json({ message: "伺服器錯誤", error: error.message });
  }
};

const createProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    console.log("後端收到的 req.body:", req.body);
    if (!userId) {
      return res.status(401).json({ message: "未授權，請先登入" });
    }
    const existingProfile = await db
      .select()
      .from(profileTable)
      .where(eq(profileTable.userId, userId))
      .limit(1);

    if (existingProfile.length > 0) {
      return res.status(409).json({ message: "使用者資料已存在" });
    }

    const { name, gender, bio, age, city, zodiac, mbti, job, orientation } =
      req.body || {};

    const newData = await db
      .insert(profileTable)
      .values({
        userId: userId,
        name: name || "",
        gender: gender || "U",
        bio: bio || "",
        age: age || 0,
        city: city || "",
        zodiac: zodiac || "",
        mbti: mbti || "",
        job: job || "",
        orientation: orientation || 2,
      })
      .returning();

    const createdProfile = newData[0];

    res.json({ message: "個人資料新增成功", user: createdProfile });
  } catch (error) {
    console.error("Create profile failed:", error.message);
    res.status(500).json({ message: "伺服器錯誤，請稍後再試" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "未授權操作" });
    }

    const fields = [
      "name",
      "gender",
      "orientation",
      "bio",
      "age",
      "city",
      "zodiac",
      "mbti",
      "job",
    ];

    const updateData = {};

    fields.forEach((field) => {
      if (Object.hasOwn(req.body, field)) {
        updateData[field] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "未提供任何更新資料" });
    }

    const updateResult = await db
      .update(profileTable)
      .set(updateData)
      .where(eq(profileTable.userId, userId))
      .returning();

    if (updateResult.length === 0) {
      return res.status(404).json({ message: "使用者資料不存在" });
    }

    res.json({ message: "更新成功", user: updateResult[0] });
  } catch (error) {
    console.error("Update profile failed:", error);
    res.status(500).json({ message: "伺服器錯誤，請稍後再試" });
  }
};

module.exports = { getProfile, updateProfile, createProfile };
