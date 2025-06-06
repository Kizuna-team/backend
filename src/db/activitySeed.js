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
  "親子同樂日",
  "懷舊電影夜",
  "書法體驗營",
  "攝影巡迴展",
  "桌遊歡樂場",
  "國際文化節",
  "手作甜點坊",
  "街頭藝人秀",
  "音樂即興表演",
  "環保教育活動",
  "瑜伽靜心課",
  "插畫創作展",
  "數位轉型論壇",
  "戶外露營體驗",
  "狗狗趣味運動會",
  "茶道體驗日",
  "復古市集",
  "即興劇場秀",
  "繪本分享會",
  "手作香氛蠟燭課",
];

const descriptions = [
  "這是一場充滿歡樂與驚喜的活動，適合全家大小參加。",
  "青春洋溢的音樂盛會，邀請多組表演者輪番上陣。",
  "融合在地農產品與文創商品的綠色環保市集。",
  "發揮創造力，親手打造屬於自己的藝術作品。",
  "網羅來自世界各地的美食，讓你一飽口福。",
  "愛書人的聚會，共享閱讀與人生的體會。",
  "展出多位藝術家的原創作品，邀你一同感受藝術之美。",
  "考驗體能與團隊默契的極限挑戰活動！",
  "科技大師親臨分享最新趨勢與未來展望。",
  "音樂、燈光、舞蹈嗨翻夜晚的精彩派對。",
  "設有趣味遊戲與親子互動體驗，適合全家參與。",
  "在星空下欣賞經典好片，一起回味美好時光。",
  "學習傳統書法的技巧與文化底蘊。",
  "捕捉城市風景的攝影展覽，激發視覺創意。",
  "精選多款桌遊，適合朋友同樂、增進感情。",
  "一次了解世界各國文化、食物與表演。",
  "親手製作可口甜點，享受甜蜜時光。",
  "街頭藝人帶來即興演出與現場互動。",
  "樂手即場表演，節奏自由奔放、充滿驚喜。",
  "透過互動遊戲，學習環保知識與愛地球的重要性。",
  "體驗身心放鬆與靜心冥想的療癒課程。",
  "多位插畫家展出作品，呈現不同風格的視覺饗宴。",
  "專為創業與企業轉型規劃的趨勢論壇。",
  "野外生存技巧＋露營體驗，適合初學者入門。",
  "萌犬登場！和狗狗一起挑戰趣味闖關任務。",
  "深入認識東方茶文化，學習沖泡技藝與品茗。",
  "懷舊復古風格市集，回味過往的美好年代。",
  "結合觀眾互動的即興戲劇，笑料不斷。",
  "繪本朗讀與創作分享，適合親子共讀時光。",
  "製作獨一無二的香氛蠟燭，療癒你的感官體驗。",
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

    for (let i = 0; i < 30; i++) {
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
