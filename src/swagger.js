const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kizuna 交友平台 API',
      version: '1.0.0',
      description: 'Kizuna 專案的 API 文件',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? process.env.API_BASE_URL || 'https://your-api-domain.com'
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' ? '正式環境' : '開發環境'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: '請在 Header 中加入: Authorization: Bearer <your-token>'
        }
      }
    }
  },
  // 指向你的路由檔案位置
  apis: [
    path.join(__dirname, 'routes', '*.js'),
    path.join(__dirname, 'server.js'),
  ],
};

const specs = swaggerJsdoc(options);
//swagger degug用 記得刪掉
// console.log('=== Swagger Debug ===');
// console.log('Paths found:', Object.keys(specs.paths || {}));
// console.log('Full paths:', JSON.stringify(specs.paths, null, 2));
// console.log('====================');
module.exports = {
  swaggerUi,
  specs
};
