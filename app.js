const express = require('express');
const postRoutes = require('./routes/post');
const authRoutes = require('./routes/auth');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();
const connectDB = require('./db');
const app = express();
const port = process.env.PORT || 3000;

// 链接数据库
connectDB()

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '我的个人博客 API 文档',
      version: '1.0.0',
      description: '这是使用 Express 搭建的博客后端接口文档',
    },
    servers: [{ url: 'http://localhost:3001' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // 告诉 Swagger 去哪里找 API 注释（这里指你的路由文件）
  apis: ['./routes/*.js'], 
};
const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use(express.json())

app.use('/api/posts',postRoutes)
app.use('/api/auth', authRoutes)

app.listen(port,'0.0.0.0' ,() => {
  console.log(`服务正在运行于 http://localhost:${port}`);
  console.log(`Swagger UI 文档正在运行于 http://localhost:${port}/api-docs`);
});