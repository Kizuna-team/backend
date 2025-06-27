const db = require("../db/index.js");
const {
  usersTable,
  giftOrdersTable,
  orderItemsTable,
  productsTable,
} = require("../db/schema.js");
const { orderGenerator } = require("../lib/order.js");
const { requestOnlineAPI } = require("../lib/linepay.js");
const frontendUrl = process.env.FRONTEND_URL;
const { eq, inArray, sql, and } = require("drizzle-orm");

const BACKEND_URL = process.env.BACKEND_URL;

async function increaseProductSales(orderId) {
  const items = await db
    .select({
      productId: orderItemsTable.product_id,
      quantity: orderItemsTable.quantity,
    })
    .from(orderItemsTable)
    .where(eq(orderItemsTable.gift_order_id, orderId));

  for (const item of items) {
    const [product] = await db
      .select({ sales: productsTable.sales })
      .from(productsTable)
      .where(eq(productsTable.id, item.productId));
    const newSales = (product?.sales || 0) + item.quantity;

    await db
      .update(productsTable)
      .set({ sales: newSales })
      .where(eq(productsTable.id, item.productId));
  }
}

async function createOrder(req, res) {
  const { sender_id, receiver_id, items, message } = req.body;

  console.log("收到的訂單資料:", req.body);

  if (
    !sender_id ||
    !receiver_id ||
    items.length === 0 ||
    !Array.isArray(items)
  ) {
    return res.status(400).json({ error: "資料格式錯誤" });
  }

  try {
    await db.transaction(async (tx) => {
      const productIds = items.map((item) => item.product_id);
      const products = await tx
        .select()
        .from(productsTable)
        .where(inArray(productsTable.id, productIds));

      const linepayItems = items.map((item) => {
        const product = products.find((p) => p.id === item.product_id);
        return {
          id: product.id.toString(),
          name: product.name,
          quantity: item.quantity,
          price: product.price,
          imageUrl: product.image_url,
        };
      });

      const totalAmount = linepayItems.reduce((sum, item) => {
        return (sum += item.price * item.quantity);
      }, 0);

      const orderId = orderGenerator();
      console.log("產生的訂單編號:", orderId);

      const [giftOrder] = await tx
        .insert(giftOrdersTable)
        .values({
          order_id: orderId,
          sender_id,
          receiver_id,
          status: "pending",
          amount: totalAmount,
          message,
        })
        .returning();

      const { id: gift_order_id } = giftOrder;

      const itemRows = items.map((item) => ({
        gift_order_id: gift_order_id,
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      console.log(itemRows);

      await tx.insert(orderItemsTable).values(itemRows);

      const data = {
        amount: totalAmount,
        currency: "TWD",
        orderId: orderId,
        packages: [
          {
            id: `package-${gift_order_id}`,
            amount: totalAmount,
            name: "購物車商品包",
            products: linepayItems,
          },
        ],
        redirectUrls: {
          confirmUrl: `${BACKEND_URL}/order/confirm`,
          cancelUrl: `${BACKEND_URL}/order/cancel`,
        },
      };

      const response = await requestOnlineAPI({
        method: "POST",
        apiPath: "/v3/payments/request",
        data,
      });

      if (response.returnCode === "0000") {
        const paymentURL = response.info.paymentUrl.web;

        res.json({
          success: true,
          paymentUrl: paymentURL,
          gift_order_id,
          order_id: orderId,
        });
      } else {
        await tx
          .update(giftOrdersTable)
          .set({
            status: "failed",
          })
          .where(eq(giftOrdersTable.id, gift_order_id));

        res.status(500).json({
          success: false,
          message: "LINE Pay 錯誤",
          details: response,
        });
      }
      console.log(response);
    });
  } catch (err) {
    console.error("送禮失敗 ( 還原送禮前的狀態 ):", err);
    res.status(500).json({ error: "送禮失敗" });
  }
}

async function confirmOrder(req, res) {
  const { transactionId, orderId } = req.query;

  try {
    const [order] = await db
      .select()
      .from(giftOrdersTable)
      .where(eq(giftOrdersTable.order_id, orderId));

    if (!order) {
      return res.status(404).send("訂單不存在");
    }

    const orderAmount = order.amount;

    const result = await requestOnlineAPI({
      method: "POST",
      apiPath: `/v3/payments/${transactionId}/confirm`,
      data: {
        amount: orderAmount,
        currency: "TWD",
      },
    });

    console.log("LINE Pay confirm 回傳結果：", result);

    if (result.returnCode === "0000") {
      await db
        .update(giftOrdersTable)
        .set({
          status: "paid",
          transaction_id: transactionId,
        })
        .where(eq(giftOrdersTable.order_id, orderId));

      const orderItems = await db
        .select()
        .from(orderItemsTable)
        .where(eq(orderItemsTable.gift_order_id, order.id));

      for (const item of orderItems) {
        await db
          .update(productsTable)
          .set({
            inventory: sql`${productsTable.inventory}-${item.quantity}`,
          })
          .where(eq(productsTable.id, item.product_id));
      }

      res.redirect(
        `${frontendUrl}/order/confirm?transactionId=${transactionId}&orderId=${orderId}`
      );

      await increaseProductSales(order.id);
    } else {
      res.redirect(
        `${frontendUrl}/order/confirm?error=1&message=${encodeURIComponent(
          result.returnMessage
        )}`
      );
    }
  } catch (err) {
    console.error("付款確認錯誤", err);
    res.status(500).send("伺服器錯誤，請稍後再試！");
  }
}

async function getMyOrders(req, res) {
  const userId = parseInt(req.query.userId);

  try {
    const orders = await db
      .select({
        id: giftOrdersTable.id,
        orderId: giftOrdersTable.order_id,
        createdAt: giftOrdersTable.created_at,
        status: giftOrdersTable.status,
        amount: giftOrdersTable.amount,
        message: giftOrdersTable.message,
        receiverName: usersTable.username,
      })
      .from(giftOrdersTable)
      .innerJoin(usersTable, eq(giftOrdersTable.receiver_id, usersTable.id))
      .where(eq(giftOrdersTable.sender_id, userId));

    const orderIds = orders.map((order) => order.id);
    const orderItems = await db
      .select({
        giftOrderId: orderItemsTable.gift_order_id,
        productName: productsTable.name,
        quantity: orderItemsTable.quantity,
        imageUrl: productsTable.image_url,
      })
      .from(orderItemsTable)
      .innerJoin(
        productsTable,
        eq(orderItemsTable.product_id, productsTable.id)
      )
      .where(inArray(orderItemsTable.gift_order_id, orderIds));

    const orderMap = {};
    for (const order of orders) {
      orderMap[order.id] = { ...order, items: [] };
    }

    for (const item of orderItems) {
      orderMap[item.giftOrderId].items.push({
        productName: item.productName,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
      });
    }

    const result = Object.values(orderMap);
    res.json(result);
  } catch (err) {
    console.error("取得我的訂單失敗", err);
    res.status(500).json({ error: "伺服器錯誤" });
  }
}

async function getReceivedOrders(req, res) {
  const userId = parseInt(req.query.userId);

  try {
    const orders = await db
      .select({
        id: giftOrdersTable.id,
        orderId: giftOrdersTable.order_id,
        createdAt: giftOrdersTable.created_at,
        status: giftOrdersTable.status,
        amount: giftOrdersTable.amount,
        senderName: usersTable.username,
        message: giftOrdersTable.message,
      })
      .from(giftOrdersTable)
      .innerJoin(usersTable, eq(giftOrdersTable.sender_id, usersTable.id))
      .where(
        and(
          eq(giftOrdersTable.receiver_id, userId),
          eq(giftOrdersTable.status, "paid")
        )
      );

    const orderIds = orders.map((order) => order.id);
    const orderItems = await db
      .select({
        giftOrderId: orderItemsTable.gift_order_id,
        productName: productsTable.name,
        quantity: orderItemsTable.quantity,
        imageUrl: productsTable.image_url,
      })
      .from(orderItemsTable)
      .innerJoin(
        productsTable,
        eq(orderItemsTable.product_id, productsTable.id)
      )
      .where(inArray(orderItemsTable.gift_order_id, orderIds));

    const orderMap = {};
    for (const order of orders) {
      orderMap[order.id] = { ...order, items: [] };
    }

    for (const item of orderItems) {
      orderMap[item.giftOrderId].items.push({
        productName: item.productName,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
      });
    }

    const result = Object.values(orderMap);
    res.json(result);
  } catch (err) {
    console.error("取得收到的訂單失敗", err);
    res.status(500).json({ error: "伺服器錯誤" });
  }
}

module.exports = {
  createOrder,
  confirmOrder,
  getMyOrders,
  getReceivedOrders,
};
