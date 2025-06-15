// 不喜歡0 喜歡1 （超級喜歡2?)
const db = require("../db/index.js");
const {
  likesTable,
  matchesTable,
  superLikesTable,
  profileTable,
  photosTable,
} = require("../db/schema.js");
const { eq, and, leftJoin } = require("drizzle-orm");

const createLike = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      matched: false,
      message: "未授權操作，請先登入",
    });
  }
  const { targetId, status } = req.body;
  try {
    console.log("🚨 準備插入資料:", { userId, targetId, status });

    // 查詢super like、like 是否也有按過的紀錄
    const mySuperLikesRecord = await db
      .select()
      .from(superLikesTable)
      .where(
        and(
          eq(superLikesTable.userId, userId),
          eq(superLikesTable.targetId, targetId)
        )
      );
    const myLikesRecord = await db
      .select()
      .from(likesTable)
      .where(
        and(eq(likesTable.userId, userId), eq(likesTable.targetId, targetId))
      );

    if (mySuperLikesRecord.length > 0 || myLikesRecord.length > 0) {
      return res.status(409).json({
        success: false,
        matched: false,
        message: "不可重複發送喜歡",
      });
    }

    // 確定沒重複喜歡 > 插入新紀錄
    await db
      .insert(likesTable)
      .values({
        userId,
        targetId,
        status,
      })
      .onConflictDoNothing();

    // 查詢對方是否也 喜歡:1 > 這樣就是互相like 插入matches
    const targetLikesRecord = await db
      .select()
      .from(likesTable)
      .where(
        and(
          eq(likesTable.userId, targetId),
          eq(likesTable.targetId, userId),
          eq(likesTable.status, 1)
        )
      );

    if (targetLikesRecord.length > 0) {
      await db
        .insert(matchesTable)
        .values({
          matchUserAId: Math.min(userId, targetId),
          matchUserBId: Math.max(userId, targetId),
          matchedAt: new Date(),
        })
        .onConflictDoNothing();
      console.log("✅ 雙方配對成功，回傳 matchedWith:", targetId);

      // 回傳對方照片與名字
      const targetProfileQuery = db
        .select({
          userId: profileTable.userId,
          name: profileTable.name,
          avatarUrl: photosTable.image_url,
        })
        .from(profileTable)
        .leftJoin(
          photosTable,
          and(
            eq(profileTable.userId, photosTable.userId),
            eq(photosTable.is_avatar, true)
          )
        )
        .where(eq(profileTable.userId, targetId))
        .limit(1);

      // 回傳自己照片與名字
      const myProfileQuery = db
        .select({
          userId: profileTable.userId,
          name: profileTable.name,
          avatarUrl: photosTable.image_url,
        })
        .from(profileTable)
        .leftJoin(
          photosTable,
          and(
            eq(profileTable.userId, photosTable.userId),
            eq(photosTable.is_avatar, true)
          )
        )
        .where(eq(profileTable.userId, userId))
        .limit(1);

      const [targetProfile] = await targetProfileQuery;
      const [myProfile] = await myProfileQuery;

      return res.json({
        success: true,
        matched: true,
        targetProfile,
        myProfile,
        message: "雙方配對成功！",
      });
    } else {
      return res.json({
        success: true,
        matched: false,
        message: "已送出喜歡，等待對方回應",
      });
    }
  } catch (error) {
    console.error("Create like failed:", error.message);
    res.status(500).json({ message: "伺服器錯誤，請稍後再試" });
  }
};

module.exports = { createLike };
