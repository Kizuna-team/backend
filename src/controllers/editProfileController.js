const pool = require("../config/db.js");

// Get取得使用者個人資料
const getProfile = async (req, res) => {
  console.log(" 進入 getProfile handler");
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "未授權操作" });
    }

    const result = await pool.query(
      `SELECT id, name, gender, orientation, bio, age, location, zodiac, mbti, job, interest FROM profiles WHERE user_id = $1`,
      [userId]
    );

    const userProfile = result.rows[0];

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
          interest: [],
        },
      });
    }
    res.json({ message: "使用者資料取得成功", user: userProfile });
  } catch (error) {
    console.error("Get profile failed FULL ERROR:", error);
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
      interest,
    } = req.body || {};

    console.log("interest 送入 DB 的格式:", JSON.stringify(interest || []));
    console.log("參數陣列:", [
      userId,
      name || null,
      gender || null,
      bio || null,
      age || null,
      location || null,
      zodiac || null,
      mbti || null,
      job || null,
      orientation || null,
      JSON.stringify(interest || []),
    ]);

    // 新增完直接導向到「編輯畫面」
    const result = await pool.query(
      `
      INSERT INTO profiles
        (user_id, name, gender, bio, age, location, zodiac, mbti, job, orientation, interest)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `,
      [
        userId,
        name || null,
        gender || null,
        bio || null,
        age || null,
        location || null,
        zodiac || null,
        mbti || null,
        job || null,
        orientation || null,
        JSON.stringify(interest || []),
      ]
    );

    const createdProfile = result.rows[0];

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
      "interest",
    ];
    const updates = [];
    const values = [];
    let paramIndex = 1;

    // 空字串 ""、空陣列 [] 也能成功更新
    // 只有當欄位是 interest 且值是陣列時，要做 JSON.stringify
    fields.forEach((field) => {
      // 使用者只更新自己選的欄位;
      if (Object.hasOwn(req.body, field)) {
        updates.push(`${field} = $${paramIndex}`);

        // interest 陣列，把 JS 陣列轉成 JSON 字串 （適用 jsonb 欄位）
        if (field === "interest" && Array.isArray(req.body[field])) {
          values.push(JSON.stringify(req.body[field]));
        } else {
          values.push(req.body[field]);
        }
        paramIndex++;
      }
    });
    if (updates.length === 0) {
      return res.status(400).json({ message: "未提供任何更新資料" });
    }

    // 執行資料庫更新
    values.push(userId); // 最後一個參數 userId

    const query = `
      UPDATE profiles
      SET ${updates.join(", ")}
      WHERE user_id = $${paramIndex}
      RETURNING *`;

    // 執行更新
    const updateResult = await pool.query(query, values);
    const updatedProfile = updateResult.rows[0];

    if (!updatedProfile) {
      return res.status(404).json({ message: "使用者資料不存在" });
    }

    res.json({ message: "更新成功", user: updatedProfile });
  } catch (error) {
    console.error("Update profile failed:", error);
    res.status(500).json({ message: "伺服器錯誤，請稍後再試" });
  }
};

module.exports = { getProfile, updateProfile, createProfile };
