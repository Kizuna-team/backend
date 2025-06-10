const paypal = require('@paypal/checkout-server-sdk');
require('dotenv').config();

// 創建 PayPal 客戶端
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID, 
  process.env.PAYPAL_CLIENT_SECRET
);

const paypalClient = new paypal.core.PayPalHttpClient(environment);

module.exports = paypalClient;
