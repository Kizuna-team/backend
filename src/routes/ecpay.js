const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.js");
const ecpay = require("ecpay_aio_nodejs");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const dotenv = require("dotenv");
const db = require("../db/index.js");
const {
  subscriptionsTable,
  usersTable,
  subscriptionPlansTable,
} = require("../db/schema.js");
const { eq } = require("drizzle-orm");
dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL;

dayjs.extend(utc);
dayjs.extend(timezone);

const options = {
  OperationMode: "Test", //測試環境是Test不是Stage，正式環境是Production
  MercProfile: {
    MerchantID: process.env.ECPAY_MERCHANT_ID,
    HashKey: process.env.ECPAY_HASH_KEY,
    HashIV: process.env.ECPAY_HASH_IV,
  },
  IsProjectContractor: false,
  IgnorePayment: [],
};

const createOrder = new ecpay(options);

// ecpay 時間格式為 yyyy/MM/dd HH:mm:ss
function getTimeString() {
  const date = new Date();
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}/${MM}/${dd} ${hh}:${mm}:${ss}`;
}

// console.log(new Date().toString()); //檢查時區
// 建立訂單（付款表單）
/**
 * @swagger
 * /api/ecpay/create:
 *   post:
 *     summary: 建立綠界付款訂單
 *     tags: [ECPay Payment]
 *     security:
 *       - bearerAuth: []
 */
router.post("/create", authMiddleware, async (req, res) => {
  const { planId } = req.body;

  const [plan] = await db
    .select()
    .from(subscriptionPlansTable)
    .where(eq(subscriptionPlansTable.id, planId));

  const price = plan.price;
  const userId = req.user.id;
  const MerchantTradeNo = "SUB" + Date.now();
  console.log("建立訂單的商戶交易編號:", MerchantTradeNo);

  try {
    // 將訂單編號先存入資料庫
    // 這裡的訂單狀態先設為 pending，等付款成功後再更新為 paid
    await db.transaction(async (tx) => {
      // 將訂單編號先存入資料庫
      await tx.insert(subscriptionsTable).values({
        user_id: userId,
        plan: plan.name,
        price: plan.price,
        status: "pending",
        merchanttradeno: MerchantTradeNo,
        created_at: new Date(),
      });
    });

    const notifyUrl = process.env.ECPAY_NOTIFY_URL;

    const form = createOrder.payment_client.aio_check_out_all({
      MerchantTradeNo,
      MerchantTradeDate: getTimeString(),
      TotalAmount: price.toString(),
      TradeDesc: "Kizuna 交友訂閱",
      ItemName: `${plan.name}會員訂閱 x1`,
      ReturnURL: notifyUrl,
      ClientBackURL: `${FRONTEND_URL}/subscription`,
      PaymentType: "aio",
      EncryptType: 1,
    });

    res.send(form);
  } catch (error) {
    console.error("建立訂單失敗", error);
    res.status(500).json({ message: "訂單建立失敗", reason: error.message });
  }
});

// 綠界付款完成後會post回來（付款成功回傳）=> 更新資料庫訂閱狀態
/**
 * @swagger
 * /api/ecpay/notify:
 *   post:
 *     summary: 綠界付款完成回調
 *     tags: [ECPay Payment]
 */
router.post("/notify", async (req, res) => {
  console.log("收到綠界回傳的訂單編號 付款狀態等資訊 :", req.body);
  const { MerchantTradeNo, RtnCode, PaymentDate, TradeNo } = req.body;

  if (RtnCode === "1") {
    try {
      // 查訂單
      const [order] = await db
        .select()
        .from(subscriptionsTable)
        .where(eq(subscriptionsTable.merchanttradeno, MerchantTradeNo));

      console.log("查詢到的訂單:", order);

      const paidAtUTC = order.paid_at;
      const paidAtTaipei = dayjs(paidAtUTC)
        .tz("Asia/Taipei")
        .format("YYYY-MM-DD HH:mm:ss");
      console.log("台灣時間:", paidAtTaipei);

      if (!order) return res.status(404).send("0|訂單不存在");

      // 查對應的方案 id（根據 plan name）
      const [matchedPlan] = await db
        .select()
        .from(subscriptionPlansTable)
        .where(eq(subscriptionPlansTable.name, order.plan));

      if (!matchedPlan) return res.status(404).send("0|方案不存在");

      // 更新訂單狀態
      // 將 PaymentDate 格式轉換為 yyyy-MM-dd HH:mm:ss
      // 注意：ECPay 的 PaymentDate 格式是 yyyy/MM/dd HH:mm:ss
      const paidAtStr = PaymentDate ? PaymentDate.replace(/\//g, "-") : null;
      const now = dayjs().utc();

      await db
        .update(subscriptionsTable)
        .set({
          status: "paid",
          paid_at: paidAtStr ? new Date(paidAtStr) : null,
          trade_no: TradeNo ?? null,
          start_date: now.toDate(),
          end_date: now.add(2, "minute").toDate(),
        })
        .where(eq(subscriptionsTable.merchanttradeno, MerchantTradeNo));

      // 更新會員目前方案（要設的是 plan.id）
      await db
        .update(usersTable)
        .set({ subscription_plan: matchedPlan.id })
        .where(eq(usersTable.id, order.user_id));

      res.send("1|OK");
    } catch (error) {
      console.error("資料庫更新失敗", error);
      res.status(500).send("0|Error: " + error.message);
    }
  } else {
    res.status(400).send("0|交易未成功");
  }
});

module.exports = router;
