const db = require("../db/index.js");
const { giftOrdersTable, OrderItemsTable, productsTable } = require("../db/schema.js");
const { orderGenerator } = require("../lib/order.js");
const { requestOnlineAPI } = require("../lib/linepay.js");
const { eq, inArray } = require("drizzle-orm");


async function createOrder(req, res) {
  const { sender_id, receiver_id, items } = req.body;
  
  console.log("收到的訂單資料:", req.body);

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
      // 前端傳的 items 資訊有 商品id 跟 使用者購買的數量
      // 我只要商品id 來查詢商品資訊
      const productIds = items.map((item) => item.product_id);
      // SELECT * FROM products WHERE id IN (productIds)
      const products = await tx.select().from(productsTable).where(
        inArray(productsTable.id, productIds)
      );

      // 組成 LINE PAY 格式 ＋ 計算金額 
      const linepayItems = items.map((item) => {
        // 找到對應的商品資訊
        const product = products.find((p) => p.id === item.product_id);
        return {
          id: product.id.toString(),
          name: product.name,
          quantity: item.quantity,
          price: product.price,
        };
      });

      // 計算總金額
      const totalAmount = linepayItems.reduce((sum,item)=>{
        return sum += item.price * item.quantity;
      }, 0);
      
      // 產生訂單編號
      const orderId = orderGenerator();
      console.log("產生的訂單編號:", orderId);

 
      // 特別說明 returning() 回傳的是一個 array 而我只想要剛剛insert的那筆 所以 解構
      const [giftOrder] = await tx
        .insert(giftOrdersTable)
        .values({
          order_id: orderId,
          sender_id,
          receiver_id,
          status: "pending",
          amount: totalAmount
        })
        .returning();

      const { id: gift_order_id } = giftOrder;

      // 準備要插入的多筆 items
      // 把前端打過來的 items array => 轉成可以插入OrderItemsTable的格式
      const itemRows = items.map((item) => ({
        // 該筆禮物是對應到哪筆訂單
        gift_order_id: gift_order_id,
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      console.log(itemRows);

      // 插入多筆 items
      await tx.insert(OrderItemsTable).values(itemRows);

      // 呼叫 LINE Pay API 來建立付款連結
      const data = {
        amount: totalAmount,
        currency: "TWD",
        orderId: orderId,
        packages: [
          {
            amount: totalAmount,
            products: linepayItems
          }
        ],
        redirectUrls: {
          confirmUrl: "http://localhost:3888/order/confirm",
          cancelUrl: "http://localhost:3888/order/cancel"
        }
      };

      const response = await requestOnlineAPI({
        method: "POST",
        apiPath: "/v3/payments/request",
        data
      });

      if (response.returnCode === "0000") {
        const paymentURL = response.info.paymentUrl.web;

        // 回傳 LINE Pay 付款網址讓前端跳轉
        res.json({
          success: true,
          paymentUrl: paymentURL,
          gift_order_id,
          order_id: orderId
        });
      } else {
        // 如果 LINE Pay 呼叫失敗 把訂單標為 failed
        await tx.update(giftOrdersTable)
          .set({
            status: "failed"
          })
          .where(eq(giftOrdersTable.id, gift_order_id));

        res.status(500).json({
          success: false,
          message: "LINE Pay 錯誤",
          details: response
        });
      }
      console.log(response);
    });
  } catch (err) {
    console.error("送禮失敗 ( 還原送禮前的狀態 ):", err);
    res.status(500).json({ error: "送禮失敗" });
  }
}

module.exports = {
  createOrder,
};
