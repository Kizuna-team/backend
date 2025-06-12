const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const systemPrompt = "你是一個親切、有耐心的 AI 助理，用簡單清楚的方式回覆問題。";

async function handleChat(req, res) {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "請提供 message" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
      ],
    });


    const result = await chat.sendMessage(message);
    const response = await result.response;
    const reply = response.text();

    res.json({ reply });
  } catch (err) {
    console.error("Gemini 錯誤：", err.message);
    res.status(500).json({ error: "AI 回覆失敗" });
  }
}

module.exports = { handleChat };
