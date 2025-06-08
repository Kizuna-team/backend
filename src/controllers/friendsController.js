const db = require("../db");
const { friendRequestsTable, friendsTable, profileTable}= require("../db/schema");
const { eq, or } = require("drizzle-orm");

// 1. 發送交友邀請
async function sendFriendRequest(req, res) {
  const { from_id, to_id } = req.body;

  if (from_id === to_id) return res.status(400).json({ error: "不能加自己好友" });

  try {
    await db.insert(friendRequestsTable).values({ from_id, to_id });
    res.json({ message: "已發送好友邀請" });
  } catch (err) {
    console.error("送出邀請失敗", err);
    res.status(500).json({ error: "伺服器錯誤" });
  }
}

// 2. 查詢某用戶收到的邀請
async function getReceivedRequests(req, res) {
  const { userId } = req.query;

  try {
    const result = await db
      .select()
      .from(friendRequestsTable)
      .where(eq(friendRequestsTable.to_id, Number(userId)));

    res.json(result);
  } catch (err) {
    console.error("查詢邀請失敗", err);
    res.status(500).json({ error: "伺服器錯誤" });
  }
}

// 3. 同意好友邀請
async function acceptFriendRequest(req, res) {
  const { requestId } = req.body;

  try {
    // 先找出邀請資料
    const [request] = await db
      .select()
      .from(friendRequestsTable)
      .where(eq(friendRequestsTable.id, requestId));

    if (!request) return res.status(404).json({ error: "邀請不存在" });

    // 寫入雙方好友紀錄
    await db.insert(friendsTable).values([
      { user_id: request.from_id, friend_id: request.to_id },
      { user_id: request.to_id, friend_id: request.from_id },
    ]);

    // 刪除該筆邀請
    await db.delete(friendRequestsTable).where(eq(friendRequestsTable.id, requestId));

    res.json({ message: "已成為好友" });
  } catch (err) {
    console.error("接受邀請失敗", err);
    res.status(500).json({ error: "伺服器錯誤" });
  }
}

// 4. 好友列表

async function getFriendsList(req, res) {
  const userId = Number(req.query.userId);
  console.log(" userId =", userId);

  if (!userId) {
    return res.status(400).json({ error: "請提供有效的 userId" });
  }

  try {
    const rawFriends = await db
      .select({
        friend_id: friendsTable.friend_id,
        friend_name: profileTable.name,
      })
      .from(friendsTable)
      .innerJoin(
        profileTable,
        eq(friendsTable.friend_id, profileTable.userId)
      )
      .where(eq(friendsTable.user_id, userId));

    console.log("成功", rawFriends);

    res.json(rawFriends);
  } catch (err) {
    console.error("失敗", err);
    res.status(500).json({ error: "伺服器錯誤" });
  }
}


module.exports = {
  sendFriendRequest,
  getReceivedRequests,
  acceptFriendRequest,
  getFriendsList,
};
