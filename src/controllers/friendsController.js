const db = require("../db"); // 你有可能是 ../config/db 看實際路徑
const { profileTable } = require("../db/schema");

async function getFriends(req, res) {
  try {
    // 從資料庫撈所有 profile
    const profiles = await db.select().from(profileTable);

    // 組成只包含 name 的陣列
    const result = profiles.map((profile) => ({
      name: profile.name,
    }));

    res.json(result); // 傳回給前端
  } catch (error) {
    console.error("撈取好友資料失敗", error);
    res.status(500).json({ error: "伺服器錯誤" });
  }
}

module.exports = { getFriends };
