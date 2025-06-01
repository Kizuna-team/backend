const db = require("../db/index.js");
const { giftOrdersTable, OrderItemsTable } = require("../db/schema.js");

async function createOrder(req, res) {
  const { sender_id, receiver_id, items } = req.body;
  // items = [{ product_id: 1, quantity: 2 }, { product_id: 3, quantity: 1 }]

  // 驗證前端送來的訂單資料
  if (
    !sender_id ||
    !receiver_id ||
    items.length === 0 ||
    !Array.isArray(items)
  ) {
    return res.status(400).json({ error: "資料格式錯誤" });
  }

  try {
    // 用 transaction 保持一致性
    await db.transaction(async (tx) => {
      // 建立訂單 gift_order 有訂單編號了
      // 特別說明 returning() 回傳的是一個 array 而我只想要剛剛insert的那筆 所以 解構
      const [giftOrder] = await tx
        .insert(giftOrdersTable)
        .values({
          sender_id,
          receiver_id,
        })
        .returning();

      const { id } = giftOrder;

      // 準備要插入的多筆 items
      // 把前端打過來的 items array => 轉成可以插入OrderItemsTable的格式
      const itemRows = items.map((item) => ({
        gift_order_id: id,
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      console.log(itemRows);

      // 插入多筆 items
      await tx.insert(OrderItemsTable).values(itemRows);

      res.json({ success: true, gift_order_id: id });
    });
  } catch (err) {
    console.error("送禮失敗 ( 還原送禮前的狀態 ):", err);
    res.status(500).json({ error: "送禮失敗" });
  }
}

module.exports = {
  createOrder,
};
