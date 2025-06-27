const { GoogleGenerativeAI } = require("@google/generative-ai");
const { eq } = require("drizzle-orm");
const db = require("../db/index");
const { aiMemoriesTable } = require("../db/schema");
const { getRoomMessages } = require("../lib/getRoomMessages.js");
const { text } = require("drizzle-orm/gel-core");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const systemPrompt =
  "你是一個親切、有耐心的 AI 助理，用簡單清楚的方式回覆問題。";

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

async function handleSuggestion(req, res) {
  const { roomId } = req.body;
  const userId = req.user?.id;

  try {
    const messages = await getRoomMessages(roomId);

    const history = [
      { role: "user", parts: [{ text: systemPrompt }] },
      ...messages.map((msg) => ({
        role: msg.sender_id === userId ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
    ];

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({ history });

    const prompt =
      "請根據這段對話內容，幫我提出一些我可以接著說的話題建議。請用簡單的中文列出1~3個建議。";
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const suggestion = response.text();

    res.json({ suggestion });
  } catch (err) {
    console.error("Gemini 建議錯誤：", err);
    res.status(500).json({ error: "Gemini AI暫時無法使用 請稍後再試一次" });
  }
}

module.exports = { handleChat, handleSuggestion };
