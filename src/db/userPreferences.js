const { faker } = require("@faker-js/faker");

function generateFakeUserPreference(userId) {
  const musicMatch = [
    "流行音樂",
    "搖滾",
    "爵士",
    "古典音樂",
    "嘻哈",
    "R&B",
    "K-pop",
    "J-pop",
  ];
  const introvertOrExtrovert = ["內向", "外向"];
  const pet = ["貓", "狗", "爬蟲類", "鳥類", "兔子"];
  const wakeUpTime = ["早睡早起", "夜貓子"];
  const ageMin = faker.number.int({ min: 18, max: 50 });
  const ageMax = faker.number.int({ min: ageMin + 1, max: 70 });

  return {
    userId,
    musicMatch: faker.helpers.arrayElement(musicMatch),
    introvertOrExtrovert: faker.helpers.arrayElement(introvertOrExtrovert),
    pet: faker.helpers.arrayElement(pet),
    wakeUpTime: faker.helpers.arrayElement(wakeUpTime),
    ageMin,
    ageMax,
  };
}

module.exports = {
  generateFakeUserPreference,
};
