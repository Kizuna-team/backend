const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

require('dotenv').config();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Kizuna 交友平台 API",
      version: "1.0.0",
      description: "Kizuna 專案的 API 文件",
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? "https://kizuna-backend.zeabur.app"
            : process.env.BACKEND_URL,
        description:
          process.env.NODE_ENV === "production" ? "正式環境" : "開發環境",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "請在 Header 中加入: Authorization: Bearer <your-token>",
        },
      },
    },
  },
  // 指向路由檔案位置
  apis: [
    path.join(__dirname, "routes", "*.js"),
    path.join(__dirname, "server.js"),
  ],
};

const specs = swaggerJsdoc(options);
module.exports = {
  swaggerUi,
  specs,
};
