// 不喜歡0 喜歡1 超級喜歡2
const db = require("../db/index.js");
const { likesTable } = require("../db/schema.js");
const { eq, and } = require("drizzle-orm");

const createLike = async (req, res) => {
  const fromId = req.user?.id;
  if (!fromId) {
    return res.status(401).json({ message: "未授權操作" });
  }
  const { toId, status } = req.body;
  try {
    await db
      .insert(likesTable)
      .values({ fromId, toId, status })
      // 不用先查有沒有這筆資料，不存在用insert，已存在用update
      // 當有人再次對同一人按喜歡/不喜歡時，會衝突 > update
      .onConflictDoUpdate({
        target: ["from_id", "to_id"],
        set: { status },
      });

    // 查詢對方是否也 喜歡:1
    const likesRecord = await db
      .select()
      .from(likesTable)
      .where(
        and(
          eq(likesTable.fromId, toId),
          eq(likesTable.toId, fromId),
          eq(likesTable.status, 1)
        )
      );
    const isMatched = likesRecord.length > 0;
    if (isMatched) {
      return res.json({
        matched: true,
      });
    } else {
      return res.json({
        matched: false,
      });
    }
  } catch (error) {
    console.error("Create like failed:", error.message);
    res.status(500).json({ message: "伺服器錯誤，請稍後再試" });
  }
};

module.exports = { createLike };
