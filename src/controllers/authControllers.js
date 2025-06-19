const db = require("../db/index.js");
const { usersTable } = require("../db/schema.js");
const { eq } = require("drizzle-orm");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");
const { assignAvatar } = require("../services/userPhoto.js");

require("dotenv").config();

const REFRESH_SECRET = process.env.REFRESH_SECRET;
// debug
// console.log(`JWT_SECRET: ${JWT_SECRET}`);
// console.log(`REFRESH_SECRET: ${REFRESH_SECRET}`);

async function register(req, res) {
  const { username, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  try {
    // 註冊的帳號不能重複 所以先檢查 username 是否已經存在
    const checkUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username));
    console.log(checkUser);
    // 如果已經有相同名稱的帳號名稱
    if (checkUser.length > 0) {
      return res.status(400).json({ message: "此帳號已存在，請嘗試其他名稱" });
    }

    // 有通過檢查才真的把這位使用者帳號密碼加入資料庫
    const [newUser] = await db
      .insert(usersTable)
      .values({ username: username, password: hashed })
      .returning();

    // 註冊完立即給予預設大頭照
    await assignAvatar(newUser.id);

    res.json({ message: "註冊成功" });
  } catch (error) {
    res.status(400).json({
      message: "註冊失敗，請稍後再試",
      reason: error.message || "未知原因",
    });
  }
}

async function login(req, res) {
  const { username, password } = req.body;

  try {
    // console.log("收到 login 請求", username, password);
    const result = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username));
    // debug
    // console.log("資料庫查詢結果", result);
    const user = result[0];
    if (user && (await bcrypt.compare(password, user.password))) {
      // console.log("密碼比對成功 產生token");
      const accessToken = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "1d" }
      );
      // console.log("印出accessToken : ",accessToken);
      const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, {
        expiresIn: "7d",
      });
      res.json({
        accessToken,
        refreshToken,
        userId: user.id,
        username: user.username,
      });
    } else {
      res.status(401).json({ message: "帳號或密碼錯誤" });
    }
  } catch (error) {
    console.error("❌ Login failed:", error);
    return res.status(500).json({ message: "登入失敗，請稍後再試" });
  }
}
function refresh(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ message: "未帶 refreshToken" });

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const newAccessToken = jwt.sign({ id: decoded.id }, JWT_SECRET, {
      expiresIn: "15m",
    });
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res
      .status(401)
      .json({ message: "Refresh Token 無效或過期", reason: error.message });
  }
}

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET, HOST } =
  process.env;

const client = new OAuth2Client({
  clientId: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  redirectUri: `${HOST}/callback`,
});

async function googleLogin(req, res) {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email } = payload;

    let user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, email));

    if (user.length === 0) {
      const newUser = await db
        .insert(usersTable)
        .values({
          username: email,
          password: "",
        })
        .returning();

      user = newUser;
    }

    const accessToken = jwt.sign(
      { id: user[0].id, username: user[0].username },
      JWT_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign({ id: user[0].id }, REFRESH_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user[0].id,
        username: user[0].username,
      },
    });
  } catch (error) {
    console.error("Google One Tap 登入失敗", error);
    res.status(400).json({ message: "Google 登入失敗" });
  }
}

module.exports = {
  register,
  login,
  refresh,
  googleLogin,
};
