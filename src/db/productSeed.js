const db = require("./index.js");
const { productsTable } = require("./schema/products");

// 你前端 products.js 裡的資料：
const products = [
  {
    id: 1,
    img: "https://lcp-prod-obs.line-scdn.net/0hB0cYFDAAHR9eIA3Q1u9iSA19EW5tURkXN1gAInplPHAITAkVNA4CDwxpP3NzUTERCQ0zHzpmPHcYETsvAhoHHHppKEoYVDEsOx8CJTlrPGQDWSEVOE4uCQ/f300",
    name: "烏龍奶茶",
    price: 350,
    inventory: 5
  },
  {
    id: 2,
    img: "https://lcp-prod-obs.line-scdn.net/0ho2PNKBSEMB1tNyDS5aFPSj5qPGxeRjQVBE8tIElyEXYrTCdICBgUIDh-Pkg7TCQTOhoeHQlxEXUrBhYtMQ0qHkl-BUgrQxwtMgkUHjh8EFsSQQwXC1kDCw/f300",
    name: "芋頭牛奶",
    price: 500,
    inventory: 6
  },
  {
    id: 3,
    img: "https://lcp-prod-obs.line-scdn.net/0h8Gm2tOW-Z2hQS3en2s4YPwAWaxljOmNgOTN6VXROUhMgOVxIZGl6DB5IbAcdJ3J1bG16ex0XbC19IVthCCVUaBFIagQoIXVhH3ZURSMNRSoWOkFbHA/f300",
    name: "柳橙汁",
    price: 200,
    inventory: 7
  },
  {
    id: 4,
    img: "https://lcp-prod-obs.line-scdn.net/0hB0cYFDAAHR9eIA3Q1u9iSA19EW5tURkXN1gAInplPHAITAkVNA4CDwxpP3NzUTERCQ0zHzpmPHcYETsvAhoHHHppKEoYVDEsOx8CJTlrPGQDWSEVOE4uCQ/f300",
    name: "烏龍奶茶",
    price: 350,
    inventory: 5
  }
];

async function seed() {
  try {
    console.log("🔄 開始 upsert products...");

    for (const product of products) {
      // 用 id 做 upsert
      await db
        .insert(productsTable)
        .values(product)
        .onConflictDoUpdate({
          target: productsTable.id,
          set: {
            name: product.name,
            price: product.price,
            inventory: product.inventory,
            img: product.img
          }
        });
    }

    console.log("🎉 Products upsert 完成！");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding 發生錯誤:", err);
    process.exit(1);
  }
}

seed();
