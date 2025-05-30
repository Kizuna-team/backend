const { Faker, zh_TW } = require("@faker-js/faker");
const faker = new Faker({ locale: [zh_TW] });
const db = require("./index");
const { activities } = require("./schema");

const activityNames = [
  "快樂嘉年華",
  "青春音樂會",
  "綠色市集",
  "創意工作坊",
  "美食盛典",
  "閱讀交流會",
  "藝術展覽",
  "運動挑戰賽",
  "科技講座",
  "夜間派對",
];

const descriptions = [
  "這是一場充滿歡樂與驚喜的活動，適合全家大小參加。",
  "活動中將有多位專業講師分享最新的行業知識。",
  "歡迎喜愛美食的朋友一同來享受各種美味佳餚。",
  "這是一個充滿創意與動手做的手作工作坊。",
  "透過音樂與舞蹈，讓你釋放壓力，享受生活。",
  "來體驗精彩的運動比賽，挑戰自我極限。",
  "活動現場將展出多位藝術家的傑作，讓人眼睛一亮。",
  "這是一個結合科技與生活的創新論壇。",
  "夜晚的派對將帶給你無限的歡樂與交流機會。",
  "活動期間設有豐富的互動遊戲，讓參與者樂在其中。",
];

function getRandomActivityName() {
  const index = Math.floor(Math.random() * activityNames.length);
  return activityNames[index];
}

function getRandomDescription() {
  const index = Math.floor(Math.random() * descriptions.length);
  return descriptions[index];
}

const seedActivities = async () => {
  try {
    const fakeActivities = [];

    for (let i = 0; i < 10; i++) {
      fakeActivities.push({
        title: getRandomActivityName(),
        location: faker.location.city(),
        date: faker.date.future(),
        description: getRandomDescription(),
        createdBy: faker.person.firstName(),
        createdAt: faker.date.anytime(),
      });
    }

    await db.insert(activities).values(fakeActivities);
    console.log("activities 假資料已插入完成");
  } catch (err) {
    console.error("activities 假資料插入錯誤:", err);
  } finally {
    process.exit();
  }
};

seedActivities();
