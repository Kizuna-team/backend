// const pool = require("../config/db.js");
const db = require("../db/index.js");
const { profileTable } = require("../db/schema");
const { eq } = require("drizzle-orm");

// Get取得使用者個人資料
const getProfile = async (req, res) => {
  console.log(" 進入 getProfile handler");
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "未授權操作" });
    }

    const result = await db
      .select({
        id: profileTable.id,
        name: profileTable.name,
        gender: profileTable.gender,
        orientation: profileTable.orientation,
        bio: profileTable.bio,
        age: profileTable.age,
        location: profileTable.location,
        zodiac: profileTable.zodiac,
        mbti: profileTable.mbti,
        job: profileTable.job,
        interests: profileTable.interests,
      })
      .from(profileTable)
      .where(eq(profileTable.userId, userId));

    const userProfile = result[0];

    if (!userProfile) {
      // 先給一份預設空值
      return res.json({
        message: "使用者尚未建立個人資料",
        user: {
          id: null,
          name: "",
          gender: "",
          orientation: "",
          bio: "",
          age: null,
          location: "",
          zodiac: "",
          mbti: "",
          job: "",
          interests: [],
        },
      });
    }

    res.json({ message: "使用者資料取得成功", user: userProfile });
  } catch (error) {
    console.error("Get profile failed:", error);
    res.status(500).json({ message: "伺服器錯誤", error: error.message });
  }
};

// Post建立使用者個人資料

const createProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    console.log("後端收到的 req.body:", req.body);
    if (!userId) {
      return res.status(401).json({ message: "未授權，請先登入" });
    }

    const {
      name,
      gender,
      bio,
      age,
      location,
      zodiac,
      mbti,
      job,
      orientation,
      interests,
    } = req.body || {};

    // 新增完直接導向到「編輯畫面」
    const newData = await db
      .insert(profileTable)
      .values({
        user_id: userId,
        name: name || "",
        gender: gender || "U", // U 表示 unknown
        bio: bio || "",
        age: age || 0,
        location: location || "",
        zodiac: zodiac || "",
        mbti: mbti || "",
        job: job || "",
        orientation: orientation || "unknown",
        interests: interests || [],
        // interests: JSON.stringify(interests || []), // 將 interest 轉為 JSON 字串存入 DB
      })
      .returning(); // 回傳新增的資料

    const createdProfile = newData[0];

    res.json({ message: "個人資料新增成功", user: createdProfile });
  } catch (error) {
    console.error("Create profile failed:", error.message);
    res.status(500).json({ message: "伺服器錯誤，請稍後再試" });
  }
};

// 修改使用者個人資料
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
      "location",
      "zodiac",
      "mbti",
      "job",
      "interests",
    ];

    // 待更新的欄位
    const updateData = {};

    // 只更新有送的欄位
    // interests 如果是空陣列也要保留更新
    fields.forEach((field) => {
      // 只更新有被送出的欄位 等同於 req.body[field] !== undefined
      if (Object.hasOwn(req.body, field)) {
        if (field === "interests") {
          updateData[field] = Array.isArray(req.body[field])
            ? req.body[field]
            : [];
        } else {
          updateData[field] = req.body[field];
        }
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "未提供任何更新資料" });
    }

    // 執行資料庫更新
    const updateResult = await db
      .update(profileTable)
      .set(updateData)
      .where(eq(profileTable.user_id, userId))
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
