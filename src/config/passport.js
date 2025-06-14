console.log("✅ passport config loaded");
const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const dotenv = require("dotenv");
const db = require("../db/index.js");
const { usersTable } = require("../db/schema.js");
const { eq } = require("drizzle-orm");

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("👉 Google 回傳的 profile", profile);
        const email = profile.emails[0].value;

        // 檢查是否已有使用者
        const existingUsers = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, email));

        let user;
        if (existingUsers.length > 0) {
          user = existingUsers[0]; // 已存在
        } else {
          // 沒有的話就創新帳號
          const newUsers = await db
            .insert(usersTable)
            .values({
              email,
              username: profile.displayName,
              avatar: profile.photos[0].value,
              subscription_plan: 1, // 預設免費會員
            })
            .returning();
          user = newUsers[0];
        }

        done(null, user);
      } catch (error) {
        console.error("Google 登入錯誤：", error);
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
