const db = require("../db/index.js");
const { usersTable } = require("../db/schema.js");
const { eq } = require("drizzle-orm");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const { OAuth2Client } = require('google-auth-library');

require('dotenv').config();

const REFRESH_SECRET = process.env.REFRESH_SECRET;
// debug
// console.log(`JWT_SECRET: ${JWT_SECRET}`);
// console.log(`REFRESH_SECRET: ${REFRESH_SECRET}`);


async function register(req, res) {
  const { username, password } = req.body;
  // const username = req.body.username;
  const hashed = await bcrypt.hash(password, 10);
  // 正式環境要拿掉raw_password欄位
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
    await db.insert(usersTable).values({
      username: username,
      password: hashed,
      // 測試用 正式環境會移除
      raw_password: password,
    });
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
        { expiresIn: "15m" }
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

// // step1 : 導向 Google 登入頁
// function googleAuth(req, res) {
//   return passport.authenticate("google", { scope: ["email", "profile"] })(
//     req,
//     res
//   );
// }

// // step2: Google 認證完後 回到這邊
// function googleAuthCallback(req, res, next) {
//   passport.authenticate("google", { session: false }, (err, user) => {
//     if (err) return next(err);
//     if (!user) return res.redirect("/auth/google"); // 沒登入成功就導回去

//     // 登入成功：把 user 資料傳到前端
//     const userData = encodeURIComponent(JSON.stringify(user));
//     // 重新導向哪裡
//     res.redirect(`http://localhost:5173/profile?user=${userData}`);
//   })(req, res, next);
// }


const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET, HOST } = process.env;

const client = new OAuth2Client({
  clientId: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  redirectUri: `${HOST}/callback`,
});

// 產生 Google 授權 URL
async function googleAuth(req, res) {
  const authorizeUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  });
  res.redirect(authorizeUrl);
}

// callback route
async function googleCallback(req, res) {
  const { code } = req.query;

  try {
    // 用授權碼換取 token
    const { tokens } = await client.getToken(code);
    console.log('Google tokens:', tokens);
    client.setCredentials(tokens);

    // 取得用戶資訊
    const userInfo = await client.request({
      url: 'https://www.googleapis.com/oauth2/v3/userinfo',
    });

    const { email, sub: googleId, name, picture } = userInfo.data;

    // 查 usersTable 是否已有 user
    let user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, email)); // 假設 username 用 email

    if (user.length === 0) {
      // 沒有 → 自動創建 user
      const newUser = await db
        .insert(usersTable)
        .values({
          username: email,
          password: '', // 第三方登入不用密碼
          raw_password: '',
        })
        .returning();

      user = newUser;
    }

    // 產生 JWT
    const accessToken = jwt.sign(
      {
        id: user[0].id,
        username: user[0].username,
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user[0].id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 回傳 token + user
    res.redirect(
      `http://localhost:5173/profile?accessToken=${accessToken}&refreshToken=${refreshToken}&userId=${user[0].id}&username=${user[0].username}`
    );
  } catch (error) {
    console.error(error);
    res.status(400).send('Error fetching Google user info');
  }
}

module.exports = {
  register,
  login,
  refresh,
  googleAuth,
  googleCallback,
};
