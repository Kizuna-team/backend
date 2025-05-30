const db = require("./index");
const { activities } = require("./schema");

const clearActivities = async () => {
  try {
    await db.delete(activities);
    console.log("已清空 activities 資料表");
  } catch (err) {
    console.error("清空活動資料表時出錯:", err);
  } finally {
    process.exit();
  }
};

clearActivities();
