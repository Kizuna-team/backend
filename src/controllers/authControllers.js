const db = require("../db/index.js");
const { usersTable } = require("../db/schema.js");
const { eq } = require("drizzle-orm");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const passport = require("passport");
const dotenv = require("dotenv");
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
// debug
console.log(`JWT_SECRET: ${JWT_SECRET}`);
console.log(`REFRESH_SECRET: ${REFRESH_SECRET}`);

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
    const result = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username));
    // debug
    // console.log(result);
    const user = result[0];
    if (user && (await bcrypt.compare(password, user.password))) {
      const accessToken = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "15m" }
      );
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

// step1 : 導向 Google 登入頁
function googleAuth(req, res) {
  return passport.authenticate("google", { scope: ["email", "profile"] })(
    req,
    res
  );
}

// step2: Google 認證完後 回到這邊
function googleAuthCallback(req, res, next) {
  passport.authenticate("google", { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) return res.redirect("/auth/google"); // 沒登入成功就導回去

    // 登入成功：把 user 資料傳到前端
    const userData = encodeURIComponent(JSON.stringify(user));
    // 重新導向哪裡
    res.redirect(`http://localhost:5173/profile?user=${userData}`);
  })(req, res, next);
}

module.exports = {
  register,
  login,
  refresh,
  googleAuth,
  googleAuthCallback,
};
