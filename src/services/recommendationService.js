const db = require("../db/index.js");
const {
  userPreferencesTable,
  userInterestsTable,
  profileTable,
} = require("../db/schema.js");
const { eq, ne } = require("drizzle-orm");

async function getUserInterests(userId) {
  const rows = await db
    .select()
    .from(userInterestsTable)
    .where(eq(userInterestsTable.userId, userId));

  return rows.map((row) => row.interestId);
}

async function getRecommendedUsers(userId) {

  const currentUserResult = await db
    .select()
    .from(userPreferencesTable)
    .where(eq(userPreferencesTable.userId, userId));

  const currentUser = currentUserResult[0];
  if (!currentUser) {
    throw new Error(`User preference not found for userId ${userId}`); 
  }

  const otherUsers = await db
    .select()
    .from(userPreferencesTable)
    .where(ne(userPreferencesTable.userId, userId));

  const allProfiles = await db.select().from(profileTable);
  const profileAgeMap = new Map();
  allProfiles.forEach(profile => {
    profileAgeMap.set(profile.userId, profile.age);
  });

  const currentUserInterests = await getUserInterests(userId); //[2,3,5]

  const recommendations = await Promise.all(
    otherUsers.map(async (other) => {
      let score = 0;

      const otherAge = profileAgeMap.get(other.userId);
      if (otherAge >= currentUser.ageMin && otherAge <= currentUser.ageMax) {
        score++;
      }

      if (other.musicMatch === currentUser.musicMatch) score++;
      if (other.introvertOrExtrovert === currentUser.introvertOrExtrovert)
        score++;
      if (other.pet === currentUser.pet) score++;
      if (other.wakeUpTime === currentUser.wakeUpTime) score++;

      const otherUserInterests = await getUserInterests(other.userId); 
      const sharedInterests = otherUserInterests.filter((i) =>
        currentUserInterests.includes(i)
      );
      score += sharedInterests.length;

      return {
        ...other,
        score,
      };
    })
  );

  const sorted = recommendations.sort((a, b) => b.score - a.score);

  const finalRecommendations = sorted
    .slice(0, 20)
    .map(({ score, ...rest }) => rest);

  return finalRecommendations;
}

module.exports = { getRecommendedUsers };
