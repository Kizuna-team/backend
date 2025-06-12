const paypal = require("@paypal/checkout-server-sdk");
const paypalClient = require("../config/paypal");
const db = require("../db/index.js");
const { giftOrdersTable, orderItemsTable, productsTable } = require("../db/schema.js");
const { orderGenerator } = require("../lib/order.js");
const { eq, inArray } = require("drizzle-orm");

// 創建 PayPal 訂單
async function createPayPalOrder(req, res) {
  try {
    const { sender_id, receiver_id, items } = req.body; // 移除 total_price
    
    console.log("收到的 PayPal 訂單資料:", req.body);

    // 驗證資料
    if (!sender_id || !receiver_id || !items || items.length === 0 || !Array.isArray(items)) {
      return res.status(400).json({ error: "資料格式錯誤" });
    }

    // 像 LINE Pay 一樣，從資料庫查詢商品資訊並計算金額
    const productIds = items.map((item) => item.product_id);
    const products = await db.select().from(productsTable).where(
      inArray(productsTable.id, productIds)
    );

    // 計算總金額
    let totalAmount = 0;
    items.forEach((item) => {
      const product = products.find((p) => p.id === item.product_id);
      if (product) {
        totalAmount += product.price * item.quantity;
      }
    });

    console.log("計算出的總金額:", totalAmount);

    // 建立訂單的請求物件
    const request = new paypal.orders.OrdersCreateRequest();
    
    // 設定訂單內容
    request.requestBody({
      intent: "CAPTURE", // 立即扣款
      purchase_units: [{
        amount: {
          currency_code: "TWD",
          value: totalAmount.toString(), // 使用計算出的金額
        },
        description: `Gift order - ${items.length} items`,
        // 儲存訂單資料，付款成功後會用到
        custom_id: JSON.stringify({ sender_id, receiver_id, items })
      }],
      // 設定付款流程
      application_context: {
        return_url: "http://localhost:3000/paypal/success", // 付款成功後跳轉
        cancel_url: "http://localhost:3000/paypal/cancel",  // 取消付款後跳轉
        user_action: "PAY_NOW", // 顯示 "Pay Now" 按鈕
        brand_name: "Gift Shop", // 你的商店名稱
        shipping_preference: "NO_SHIPPING" // 不需要運送地址
      }
    });

    // 向 PayPal 發送請求，建立訂單
    const order = await paypalClient.execute(request);
    
    // 找到付款連結
    const approveLink = order.result.links.find(link => link.rel === 'approve');
    
    console.log("PayPal 訂單建立成功:", order.result.id);
    console.log("付款連結:", approveLink.href);

    // 回傳訂單 ID 和付款連結給前端
    res.json({
      success: true,
      orderID: order.result.id,
      approveUrl: approveLink.href
    });

  } catch (err) {
    console.error("PayPal 訂單建立失敗:", err);
    res.status(500).json({
      success: false,
      error: "訂單建立失敗"
    });
  }
}

// 確認 PayPal 付款並創建資料庫訂單
async function capturePayPalOrder(req, res) {
  try {
    const { orderID } = req.body;
    
    console.log("開始確認 PayPal 付款:", orderID);

    // 確認付款的請求要帶訂單ID
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    
    // 向 PayPal 發送確認付款請求
    const capture = await paypalClient.execute(request);
    
    console.log("PayPal 付款狀態:", capture.result.status);

    // 檢查付款是否成功
    if (capture.result.status === "COMPLETED") {
      // 從 PayPal 訂單中取出之前存的資料
      const customData = JSON.parse(capture.result.purchase_units[0].custom_id);
      const { sender_id, receiver_id, items } = customData;
      
      console.log("要創建的訂單資料:", { sender_id, receiver_id, items });

      // 使用 transaction 確保資料一致性
      await db.transaction(async (tx) => {
        // 生成訂單編號
        const orderId = orderGenerator();
        console.log("產生的訂單編號:", orderId);

        // 創建主訂單
        const [giftOrder] = await tx
          .insert(giftOrdersTable)
          .values({
            order_id: orderId,
            sender_id,
            receiver_id,
            status: "paid", // PayPal 已付款成功
            amount: parseFloat(capture.result.purchase_units[0].amount.value),
            // 如果你的資料表有這些欄位，就取消註解
            // payment_method: "paypal",
            // paypal_order_id: capture.result.id,
            // paypal_payment_id: capture.result.purchase_units[0].payments.captures[0].id,
            // payer_id: capture.result.payer.payer_id
          })
          .returning();

        const { id: gift_order_id } = giftOrder;

        // 創建訂單項目
        const itemRows = items.map((item) => ({
          gift_order_id: gift_order_id,
          product_id: item.product_id,
          quantity: item.quantity,
        }));

        await tx.insert(orderItemsTable).values(itemRows);
        
        console.log(`PayPal 訂單創建成功: ${orderId}`);
      });

      res.json({
        success: true,
        message: "支付成功，訂單已創建",
        orderID: capture.result.id,
        status: capture.result.status
      });

    } else {
      // 付款未完成的處理
      console.log("PayPal 付款未完成:", capture.result.status);
      res.status(400).json({
        success: false,
        error: "付款未完成",
        status: capture.result.status
      });
    }

  } catch (err) {
    console.error("PayPal 支付確認失敗:", err);
    res.status(500).json({
      success: false,
      error: "支付失敗"
    });
  }
}

module.exports = {
  createPayPalOrder,
  capturePayPalOrder,
};