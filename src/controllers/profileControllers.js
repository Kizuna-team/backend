//  GET /profile/:userId
const db = require("../db/index.js");
const { profileTable } = require("../db/schema");
const { eq } = require("drizzle-orm");

async function getProfileByUserId(req, res) {
  try {
    // console.log(req.params)
    const userId = parseInt(req.params.userId);

    // 查 profileTable
    const profileRow = await db
      .select()
      .from(profileTable)
      .where(eq(profileTable.user_id, userId))
      .limit(1);

    if (profileRow.length === 0) {
      return res.status(404).json({ error: "該使用者尚未建立 profile" });
    }

    res.json(profileRow[0]);
  } catch (err) {
    console.error("getProfileByUsername 發生錯誤:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { getProfileByUserId };
