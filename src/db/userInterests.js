const { faker } = require("@faker-js/faker");

function generateUserInterests(users, interests) {
  const interestIds = interests.map((interest) => interest.id);
  const userInterestsData = [];

  users.forEach((user) => {
    const numInterests = faker.number.int({ min: 2, max: 5 });
    const shuffled = faker.helpers.shuffle(interestIds);
    const selectedInterests = shuffled.slice(0, numInterests);

    selectedInterests.forEach((interestId) => {
      userInterestsData.push({
        userId: user.id,
        interestId: interestId,
      });
    });
  });

  return userInterestsData;
}

module.exports = generateUserInterests;
