const db = require("./src/db/index.js"); // 初始化 db
const { usersTable, profileTable } = require("./src/db/schema.js"); // schema
const profilesSeed = require("./fake-profile.js"); // ESModule 轉 import
const bcrypt = require("bcrypt");

async function seed() {
  // 先給 50 筆假密碼
  const rawPasswords = [
    "pass123", "apple2024", "hello321", "snowman11", "sun6789",
    "music123", "fashion99", "runner88", "drawme56", "12design",
    "catlove", "ocean77", "flower88", "sky555", "dreamer",
    "moonlight", "star999", "guitar321", "happy333", "code888",
    "zen123", "piano456", "travel77", "movie555", "coffee999",
    "artlover", "bookworm", "runnerup", "sweet22", "coolman1",
    "summer55", "spring66", "winter44", "autumn99", "dance88",
    "yoga777", "chef999", "explorer", "nature22", "writer11",
    "hero777", "game999", "jazzman", "smile88", "fashion21",
    "sport888", "dream77", "sunshine", "energy77", "magic999",
  ]; 

  // 先建立 50 筆 users
  const userData = await Promise.all(
    rawPasswords.map(async (pw, i) => ({
      username: `user${i + 1}`,
      password: await bcrypt.hash(pw, 10),
      raw_password: pw,
    }))
  );

  // 插入 users
  const insertedUsers = await db.insert(usersTable).values(userData).returning({ id: usersTable.id });

  console.log(`✅ 成功建立 ${insertedUsers.length} 筆 users`);
  console.log(`✅ 成功建立 ${profilesSeed.length} 筆 profile`);

  // 組成 profile 資料
  const profileData = insertedUsers.map((user, i) => {
    const seed = profilesSeed[i];
    return {
      user_id: user.id,
      gender: seed.gender,
      bio: seed.bio,
      age: seed.age,
      location: seed.location,
      zodiac: seed.zodiac,
      mbti: seed.mbti,
      job: seed.job,
      interest: seed.interest,
      orientation: seed.orientation,
      last_active_at: new Date(),
    };
  });

  // 插入 profiles
  await db.insert(profileTable).values(profileData);

  console.log(`✅ 假資料已成功寫入 usersTable (${insertedUsers.length}) 與 profileTable (${profileData.length})`);
}

seed().catch((err) => {
  console.error("❌ 寫入資料時發生錯誤:", err);
});
