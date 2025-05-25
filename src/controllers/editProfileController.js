const pool = require("../config/db.js");

// 取得使用者個人資料
const getProfile = async (req, res) => {
  console.log(" 進入 getProfile handler");
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "未授權操作" });
    }

    // const result = await pool.query(
    //   `SELECT name, age, bio FROM users WHERE id = $1`,
    //   [userId]
    // );

    const result = await pool.query(
      `SELECT id, name, gender, orientation, bio, age, location, zodiac, mbti, job FROM profiles WHERE user_id = $1`,
      [userId]
    );

    const userProfile = result.rows[0];
    if (!userProfile) {
      return res.status(404).json({ message: "使用者資料不存在" });
    }

    res.json({ message: "使用者資料取得成功", user: userProfile });
  } catch (error) {
    console.error("Get profile failed:", error.message);
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

    // // 更新後再查詢完整資料回傳（保險一點）
    // const result = await pool.query(
    //   "SELECT * FROM profiles WHERE user_id = $1",
    //   [userId]
    // );
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

module.exports = { getProfile, updateProfile };
