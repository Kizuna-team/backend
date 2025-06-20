const { GoogleGenerativeAI } = require("@google/generative-ai");
const { eq } = require("drizzle-orm");
const db = require("../db/index");
const { aiMemoriesTable } = require("../db/schema");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const systemPrompt = "你是一個親切、有耐心的 AI 助理，用簡單清楚的方式回覆問題。";

//  完整對話邏輯（記憶功能）
async function handleChat(req, res) {
  const { message } = req.body;
  const userId = req.user?.id;

  if (!message || !userId) {
    return res.status(400).json({ error: "請提供 message 並登入" });
  }

  try {
    const memories = await db
      .select()
      .from(aiMemoriesTable)
      .where(eq(aiMemoriesTable.userId, userId))
      .orderBy(aiMemoriesTable.created_at)
      .limit(10);

    const history = [
      { role: "user", parts: [{ text: systemPrompt }] },
      ...memories.map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      })),
    ];

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({ history });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const reply = response.text();

    await db.insert(aiMemoriesTable).values([
      { userId, role: "user", content: message },
      { userId, role: "model", content: reply },
    ]);

    res.json({ reply });
  } catch (err) {
    console.error("Gemini 錯誤：", err);
    res.status(500).json({ error: "AI 回覆失敗" });
  }
}

//  建議回覆邏輯
async function handleAISuggestion(req, res) {
  const { message } = req.body;
  const userId = req.user?.id;

  if (!message || !userId) {
    return res.status(400).json({ error: "請提供 message 並登入" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(
      `請根據以下訊息提供三種適合的回覆建議，列出成換行清單：\n${message}`
    );
    const response = await result.response;
    const suggestions = response.text(); // 含 \n 分隔

    res.json({ reply: suggestions });
  } catch (err) {
    console.error("AI 建議失敗", err);
    res.status(500).json({ error: "AI 建議失敗" });
  }
}

module.exports = { handleChat, handleAISuggestion };
