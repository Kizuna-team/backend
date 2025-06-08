const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.js");
const ecpay = require("ecpay_aio_nodejs");
const dotenv = require("dotenv");
const db = require("../db/index.js");
const {
  subscriptionsTable,
  usersTable,
  subscriptionPlansTable,
} = require("../db/schema.js");
const { eq } = require("drizzle-orm");
dotenv.config();

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

// ✅ ecpay 時間格式為 yyyy/MM/dd HH:mm:ss
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
// ✅ 建立訂單（付款表單）
router.post("/create", authMiddleware, async (req, res) => {
  const { planId } = req.body;

  const [plan] = await db
    .select()
    .from(subscriptionPlansTable)
    .where(eq(subscriptionPlansTable.id, planId));

  if (!plan) return res.status(400).send("❌ 找不到對應方案");

  if (plan.price === 0) {
    return res.status(400).send("❌ 免費方案無需建立訂單，請直接使用");
  }
  const price = plan.price;
  const userId = req.user.id;
  const MerchantTradeNo = "SUB" + Date.now();
  console.log("建立訂單的商戶交易編號:", MerchantTradeNo);

  try {
    await db.insert(subscriptionsTable).values({
      user_id: userId,
      plan: plan.name,
      price: plan.price,
      status: "pending",
      merchanttradeno: MerchantTradeNo,
      created_at: new Date(),
    });
    // test
    console.log({
      MerchantTradeNo: MerchantTradeNo,
      MerchantTradeDate: getTimeString(),
      TotalAmount: price.toString(),
      TradeDesc: "Kizuna 交友訂閱",
      ItemName: `${plan.name}會員訂閱 x1`,
      ReturnURL: process.env.ECPAY_RETURN_URL,
      ClientBackURL: "http://localhost:5173/member",
      PaymentType: "aio",
      EncryptType: 1,
    });

    const form = createOrder.payment_client.aio_check_out_all({
      MerchantTradeNo, // Ecpay 官方要求M要大寫！！
      MerchantTradeDate: getTimeString(),
      TotalAmount: price.toString(),
      TradeDesc: "Kizuna 交友訂閱",
      ItemName: `${plan.name}會員訂閱 x1`,
      ReturnURL: process.env.ECPAY_RETURN_URL,
      ClientBackURL: "http://localhost:5173/member",
      PaymentType: "aio",
      EncryptType: 1,
    });

    res.send(form); // ✅ form 是完整 HTML 字串
  } catch (error) {
    console.error("❌ 建立訂單失敗", error);
    res.status(500).json({ message: "訂單建立失敗", reason: error.message });
  }
});

// ✅ 綠界通知（付款成功回傳）
router.post("/notify", async (req, res) => {
  const { MerchantTradeNo, RtnCode, PaymentDate, TradeNo } = req.body;

  if (RtnCode === "1") {
    try {
      // 1️⃣ 查訂單
      const [order] = await db
        .select()
        .from(subscriptionsTable)
        .where(eq(subscriptionsTable.MerchantTradeNo, MerchantTradeNo));

      if (!order) return res.status(404).send("0|訂單不存在");

      // 2️⃣ 查對應的方案 id（根據 plan name）
      const [matchedPlan] = await db
        .select()
        .from(subscriptionPlansTable)
        .where(eq(subscriptionPlansTable.name, order.plan));

      if (!matchedPlan) return res.status(404).send("0|方案不存在");

      // 3️⃣ 更新訂單狀態
      await db
        .update(subscriptionsTable)
        .set({
          status: "paid",
          paid_at: new Date(PaymentDate),
          trade_no: TradeNo,
        })
        .where(eq(subscriptionsTable.MerchantTradeNo, MerchantTradeNo));

      // 4️⃣ 更新會員目前方案（要設的是 plan.id）
      await db
        .update(usersTable)
        .set({ subscription_plan: matchedPlan.id })
        .where(eq(usersTable.id, order.user_id));

      res.send("1|OK");
    } catch (error) {
      console.error("❌ 資料庫更新失敗", error);
      res.status(500).send("0|Error: " + error.message);
    }
  } else {
    res.status(400).send("0|交易未成功");
  }
});

module.exports = router;
