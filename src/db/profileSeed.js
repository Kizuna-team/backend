const db = require("./index.js");
const {
  usersTable,
  profileTable,
  interestsTable,
  userInterestsTable,
  userPreferencesTable,
} = require("./schema.js");
const bcrypt = require("bcrypt");
const profilesSeed = require("./profile.js");
const { faker } = require("@faker-js/faker");
const generateFakeInterests = require("./interests.js");
const generateUserInterests = require("./userInterests.js");
const { generateFakeUserPreference } = require("./userPreferences.js");

async function seed() {
  const rawPasswords = Array.from(
    { length: 500 },
    (_, i) => `password${i + 1}`
  );

  const userData = await Promise.all(
    rawPasswords.map(async (pw, i) => ({
      username: `user${i + 1}`,
      password: await bcrypt.hash(pw, 10),
      subscription_plan: faker.helpers.arrayElement([1, 2]),
    }))
  );

  const insertedUsers = await db
    .insert(usersTable)
    .values(userData)
    .returning({ id: usersTable.id });
  console.log(`✅成功建立 ${insertedUsers.length} 筆 users`);

  const profileData = insertedUsers.map((user, i) => {
    const seed = profilesSeed[i];
    return {
      userId: user.id,
      name: seed.name,
      gender: seed.gender,
      orientation: seed.orientation,
      bio: seed.bio,
      age: seed.age,
      location: seed.location,
      zodiac: seed.zodiac,
      mbti: seed.mbti,
      job: seed.job,
      last_active_at: seed.last_active_at,
    };
  });

  await db.insert(profileTable).values(profileData);
  console.log(`✅ 假資料已成功寫入 profileTable (${profileData.length})`);

  const interestsData = generateFakeInterests();
  await db.insert(interestsTable).values(interestsData);
  console.log(`✅ 假資料已成功寫入 interestsTable (${interestsData.length})`);

  const insertedInterests = await db.select().from(interestsTable);
  const userInterestsData = generateUserInterests(
    insertedUsers,
    insertedInterests
  );
  await db.insert(userInterestsTable).values(userInterestsData);
  console.log(
    `✅ 假資料已成功寫入 user_interests (${userInterestsData.length})`
  );

  //userPreference表
  for (let userId = 1; userId <= 100; userId++) {
    //這邊是不是要更多
    const fakePref = generateFakeUserPreference(userId);
    await db.insert(userPreferencesTable).values(fakePref);
  }
}

seed().catch((err) => {
  console.error("❌ 寫入資料時發生錯誤:", err);
});
