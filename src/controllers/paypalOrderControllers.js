const paypal = require("@paypal/checkout-server-sdk");
const paypalClient = require("../config/paypal");
const db = require("../db/index.js");
const {
  giftOrdersTable,
  orderItemsTable,
  productsTable,
} = require("../db/schema.js");
const { orderGenerator } = require("../lib/order.js");
const { inArray } = require("drizzle-orm");
const BACKEND_URL = process.env.BACKEND_URL;
const FRONTEND_URL = process.env.FRONTEND_URL;

async function createPayPalOrder(req, res) {
  try {
    const { sender_id, receiver_id, items } = req.body;

    if (
      !sender_id ||
      !receiver_id ||
      !items ||
      items.length === 0 ||
      !Array.isArray(items)
    ) {
      return res.status(400).json({ error: "資料格式錯誤" });
    }

    const productIds = items.map((item) => item.product_id);
    const products = await db
      .select()
      .from(productsTable)
      .where(inArray(productsTable.id, productIds));

    let totalAmount = 0;
    items.forEach((item) => {
      const product = products.find((p) => p.id === item.product_id);
      if (product) {
        totalAmount += product.price * item.quantity;
      }
    });

    const request = new paypal.orders.OrdersCreateRequest();

    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "TWD",
            value: totalAmount.toString(),
          },
          description: `Gift order - ${items.length} items`,
          custom_id: JSON.stringify({ sender_id, receiver_id, items }),
        },
      ],
      application_context: {
        return_url: `${BACKEND_URL}/paypal/success`,
        cancel_url: `${BACKEND_URL}/paypal/cancel`,
        user_action: "PAY_NOW",
        brand_name: "Gift Shop",
        shipping_preference: "NO_SHIPPING",
      },
    });

    const order = await paypalClient.execute(request);

    const approveLink = order.result.links.find(
      (link) => link.rel === "approve"
    );

    res.json({
      success: true,
      orderID: order.result.id,
      approveUrl: approveLink.href,
    });
  } catch (err) {
    console.error("PayPal 訂單建立失敗:", err);
    res.status(500).json({
      success: false,
      error: "訂單建立失敗",
    });
  }
}

async function capturePayPalOrder(req, res) {
  try {
    const { orderID } = req.body;

    const request = new paypal.orders.OrdersCaptureRequest(orderID);

    const capture = await paypalClient.execute(request);

    if (capture.result.status === "COMPLETED") {
      const customId =
        capture.result.purchase_units[0].payments.captures[0].custom_id;

      if (!customId) {
        console.error("PayPal 回調缺少 custom_id");
        return res.status(400).json({
          success: false,
          error: "PayPal 回調資料不完整",
        });
      }

      let sender_id, receiver_id, items;
      try {
        const customData = JSON.parse(customId);
        sender_id = customData.sender_id;
        receiver_id = customData.receiver_id;
        items = customData.items;

        if (!sender_id || !receiver_id || !items || !Array.isArray(items)) {
          throw new Error("PayPal 自訂資料格式錯誤");
        }

        console.log("成功解析 PayPal 資料:", { sender_id, receiver_id, items });
      } catch (err) {
        console.error("PayPal 資料解析失敗:", err);
        return res.status(400).json({
          success: false,
          error: "PayPal 回調資料解析失敗",
        });
      }

      await db.transaction(async (tx) => {
        const orderId = orderGenerator();
        console.log("產生的訂單編號:", orderId);

        const [giftOrder] = await tx
          .insert(giftOrdersTable)
          .values({
            order_id: orderId,
            sender_id,
            receiver_id,
            status: "paid",
            amount: parseFloat(
              capture.result.purchase_units[0].payments.captures[0].amount.value
            ),
          })
          .returning();

        const { id: gift_order_id } = giftOrder;

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
        status: capture.result.status,
      });
    } else {
      console.log("PayPal 付款未完成:", capture.result.status);
      res.status(400).json({
        success: false,
        error: "付款未完成",
        status: capture.result.status,
      });
    }
  } catch (err) {
    console.error("PayPal 支付確認失敗:", err);
    res.status(500).json({
      success: false,
      error: "支付失敗",
    });
  }
}

async function paypalSuccess(req, res) {
  try {
    const { token, PayerID } = req.query;

    if (!token) {
      console.error("缺少 PayPal 訂單 token");
      return res.redirect(`${FRONTEND_URL}/payment?error=missing_token`);
    }

    try {
      const request = new paypal.orders.OrdersCaptureRequest(token);

      const capture = await paypalClient.execute(request);

      if (capture.result.status === "COMPLETED") {
        const customId =
          capture.result.purchase_units[0].payments.captures[0].custom_id;

        if (!customId) {
          console.error("PayPal 回調缺少 custom_id");
          return res.redirect(`${FRONTEND_URL}/payment?error=missing_data`);
        }

        let sender_id, receiver_id, items;
        try {
          const customData = JSON.parse(customId);
          sender_id = customData.sender_id;
          receiver_id = customData.receiver_id;
          items = customData.items;

          if (!sender_id || !receiver_id || !items || !Array.isArray(items)) {
            throw new Error("PayPal 自訂資料格式錯誤");
          }

          console.log("成功解析 PayPal 資料:", {
            sender_id,
            receiver_id,
            items,
          });
        } catch (err) {
          console.error("PayPal 資料解析失敗:", err);
          return res.redirect(
            `${FRONTEND_URL}/payment?error=data_parse_failed`
          );
        }

        await db.transaction(async (tx) => {
          const orderId = orderGenerator();
          console.log("產生的訂單編號:", orderId);

          const [giftOrder] = await tx
            .insert(giftOrdersTable)
            .values({
              order_id: orderId,
              sender_id,
              receiver_id,
              status: "paid",
              amount: parseFloat(
                capture.result.purchase_units[0].payments.captures[0].amount
                  .value
              ),
            })
            .returning();

          const { id: gift_order_id } = giftOrder;

          const itemRows = items.map((item) => ({
            gift_order_id: gift_order_id,
            product_id: item.product_id,
            quantity: item.quantity,
          }));

          await tx.insert(orderItemsTable).values(itemRows);
        });

        res.redirect(`${FRONTEND_URL}/order/confirm?success=true`);
      } else {
        res.redirect(`${FRONTEND_URL}/payment?error=payment_incomplete`);
      }
    } catch (err) {
      console.error("處理訂單失敗:", err);
      res.redirect(`${FRONTEND_URL}/payment?error=order_processing_failed`);
    }
  } catch (err) {
    console.error("PayPal 成功頁面錯誤:", err);
    res.redirect(`${FRONTEND_URL}/payment?error=system_error`);
  }
}

async function paypalCancel(req, res) {
  try {
    res.redirect(`${FRONTEND_URL}/product`);
  } catch (err) {
    console.error("PayPal 取消頁面處理錯誤:", err);
    res.redirect(`${FRONTEND_URL}/product`);
  }
}

module.exports = {
  createPayPalOrder,
  capturePayPalOrder,
  paypalSuccess,
  paypalCancel,
};
