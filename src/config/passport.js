// const db = require("../db/index.js");
// const { eq } = require("drizzle-orm");
// const passport = require("passport");
// const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
// const dotenv = require("dotenv");
// const { usersTable } = require("../db/schema");
// dotenv.config();

// passport.use(
//   new GoogleStrategy(
//     // new GoogleStrategy(options物件, verifyCallback)
//     // options物件 : 告訴 passport 要怎麼跟 google 認證系統溝通
//     // verifyCallback : 當 Google 驗證完畢後 Passport 會呼叫這個函式 並傳入使用者資料。
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       // Google 授權後 要導回我們後端的哪個URL
//       callbackURL: "http://localhost:3000/auth/google/callback",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       // 把使用者資料包成一個物件 
//       const user = {
//         accessToken: accessToken,
//         refreshToken: refreshToken,
//         googleId: profile.id,
//         // emails是陣列[主帳號、次帳號....]
//         email: profile.emails[0].value,
//         name: profile.displayName,
//         avatar: profile.photos[0].value,
//       };
//       console.log("Google 認證成功，使用者資料:", user);
//       // 查詢資料庫是否已經有這個使用者
//       // 如果沒有就新增一筆資料
//       const googleUser = await db.select().from(usersTable).where(
//         eq(usersTable.username, user.email)
//       );
//       if (googleUser.length === 0) {
//         const newUser = await db.insert(usersTable).values({
//           username: user.email,
//           // 使用第三方登入不用密碼 所以預設給它一個固定字串（因為資料庫設定不能是null)
//           password: "google-oauth",
//           raw_password: "google-oauth", // 測試用，正式環境會移除
//         }).returning();
//       console.log("由google註冊的新使用者:", newUser);  
//       // 把 user 資料傳出去 給後面的 authControllers.js 接收
//       user = newUser[0];
//       done(null, {
//         id: user.id,
//         username: user.username,
//         avatar: user.avatar
//       });
//     }
//   })
// );

// module.exports = passport;
