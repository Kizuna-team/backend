const { eq, and, gte, lte, inArray, ne, or } = require("drizzle-orm");
const db = require("../db/index.js");
const {
  profileTable,
  userInterestsTable,
  userPreferencesTable,
} = require("../db/schema.js");

async function getRecommendationsLogic(userId) {
  const myProfileResult = await db
    .select()
    .from(profileTable)
    .where(eq(profileTable.userId, userId));
  const myPrefResult = await db
    .select()
    .from(userPreferencesTable)
    .where(eq(userPreferencesTable.userId, userId));
  const myInterests = await db
    .select({ interestId: userInterestsTable.interestId })
    .from(userInterestsTable)
    .where(eq(userInterestsTable.userId, userId));

  const myProfile = myProfileResult[0];
  const myPref = myPrefResult[0];

  if (!myProfile || !myPref) return []; //是不是要回傳些什麼

  const myInterestIds = myInterests.map((i) => i.interestId);

  const sharedInterestUserIdsRaw = await db
    .select({ userId: userInterestsTable.userId })
    .from(userInterestsTable)
    .where(inArray(userInterestsTable.interestId, myInterestIds));

  const sharedInterestUserIds = [
    ...new Set(
      sharedInterestUserIdsRaw
        .map((u) => u.userId)
        .filter((id) => id !== userId)
    ),
  ];

  if (sharedInterestUserIds.length === 0) return []; //是不是要回傳些什麼

  const matches = await db
    .select()
    .from(profileTable)
    .where(
      and(
        inArray(profileTable.userId, sharedInterestUserIds),
        ne(profileTable.userId, userId),
        or(
          eq(myPref.preferredGender, "any"), //如果我偏好 any，什麼性別都可以
          eq(profileTable.gender, myPref.preferredGender)
        ),
        gte(profileTable.age, myPref.ageMin), // gte >=
        lte(profileTable.age, myPref.ageMax) // lte <=
      )
    )
    .limit(20);

  return matches;
}

module.exports = { getRecommendationsLogic };
