const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const dotenv = require("dotenv");
dotenv.config();

passport.use(
  new GoogleStrategy(
    // new GoogleStrategy(options物件, verifyCallback)
    // options物件 : 告訴 passport 要怎麼跟 google 認證系統溝通
    // verifyCallback : 當 Google 驗證完畢後 Passport 會呼叫這個函式 並傳入使用者資料。
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Google 授權後 要導回我們後端的哪個URL
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      // 把使用者資料包成一個物件 
      const user = {
        accessToken: accessToken,
        refreshToken: refreshToken,
        googleId: profile.id,
        // emails是陣列[主帳號、次帳號....]
        email: profile.emails[0].value,
        name: profile.displayName,
        avatar: profile.photos[0].value,
      };
      // 把 user 資料傳出去 給後面的server.js接收
      done(null, user);
    }
  )
);

module.exports = passport;
