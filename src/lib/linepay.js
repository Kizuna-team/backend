import crypto from "crypto"
import "dotenv/config"

const { LINEPAY_CHANNEL_ID, LINEPAY_CHANNEL_SECRET_KEY } = process.env

function signKey(clientKey, msg) {
  const encoder = new TextEncoder()
  return crypto
    .createHmac("sha256", encoder.encode(clientKey))
    .update(encoder.encode(msg))
    .digest("base64")
}

async function requestOnlineAPI({
  method,
  baseUrl = "https://sandbox-api-pay.line.me",
  apiPath,
  queryString = "",
  data = null,
  signal = null,
}) {
  const nonce = crypto.randomUUID()
  let signature = ""

  // 根據不同方式(method)生成MAC
  if (method === "GET") {
    signature = signKey(
      LINEPAY_CHANNEL_SECRET_KEY,
      LINEPAY_CHANNEL_SECRET_KEY + apiPath + queryString + nonce
    )
  } else if (method === "POST") {
    signature = signKey(
      LINEPAY_CHANNEL_SECRET_KEY,
      LINEPAY_CHANNEL_SECRET_KEY + apiPath + JSON.stringify(data) + nonce
    )
  }
  const headers = {
    "X-LINE-ChannelId": LINEPAY_CHANNEL_ID,
    "X-LINE-Authorization": signature,
    "X-LINE-Authorization-Nonce": nonce,
  }

  const response = await fetch(
    `${baseUrl}${apiPath}${queryString !== "" ? "&" + queryString : ""}`,
    {
      method: method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: data ? JSON.stringify(data) : null,
      signal: signal,
    }
  )

  return await response.json()
}

export { requestOnlineAPI }
