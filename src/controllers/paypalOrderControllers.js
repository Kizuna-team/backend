const paypal = require("@paypal/checkout-server-sdk");
const paypalClient = require("../config/paypal");

async function createPayPalOrder(req, res) {
  try {
    // 建立訂單的請求物件
    const request = new paypal.orders.OrdersCreateRequest();
    // 設定訂單內容
    request.requestBody({
      intent: "CAPTURE", // 立即扣款
      purchase_units: [
        // 購買項目
        {
          amount: {
            currency_code: "TWD",
            value: req.body.total_price, // 從前端接收的總金額
          },
        },
      ],
    });
    // 向 PayPal 發送請求，建立訂單
    const order = await paypalClient.execute(request);
    // 回傳訂單 ID 給前端
    res.json({
      orderID: order.result.id,
    });
  } catch (err) {
    res.status(500).json({
      err: "訂單建立失敗",
    });
  }
}
//確認付款
async function capturePayPalOrder(req, res) {
  try {
    //確認付款的請求要帶訂單ID
    const request = new paypal.orders.OrdersCaptureRequest(req.body.orderID);
    // 向 PayPal 發送確認付款請求
    const capture = await paypalClient.execute(request);

    res.json({
      message: "支付成功",
      orderID: capture.result.id,
    });
  } catch (err) {
    res.status(500).json({
      err: "支付失敗",
    });
  }
}

module.exports = {
  createPayPalOrder,
  capturePayPalOrder,
};
