const { eq } = require("drizzle-orm");
const { profileTable } = require("../db/schema");
const db = require("../db");

const getProfileByIdFromDB = async (userId) => {
  const [user] = await db
    .select()
    .from(profileTable)
    .where(eq(profileTable.userId, userId));
  return user || null;
};

module.exports = { getProfileByIdFromDB };
