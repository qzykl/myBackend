# 个人博客后端 API

基于 Express + MongoDB 搭建的博客后端接口服务，集成 Swagger API 文档。

## 技术栈

- **Node.js** + **Express 5**
- **MongoDB** + **Mongoose**
- **Swagger**（swagger-jsdoc / swagger-ui-express）
- **JWT** 认证（jsonwebtoken + bcryptjs）

## 项目结构

```
myBackend/
├── app.js              # 入口文件
├── package.json
├── pnpm-lock.yaml
├── .gitignore
├── db/
│   └── index.js        # 数据库连接
├── models/
│   └── Post.js         # 文章模型
└── routes/
    └── post.js         # 文章路由
```

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

创建 `.env` 文件，填入你的 MongoDB 连接地址：

```env
MONGO_URI=your_mongodb_connection_string
```

> 当前 `db/index.js` 中硬编码了连接字符串，实际使用请改为读取环境变量。

### 3. 启动服务

```bash
pnpm dev
```

服务默认运行在 `http://localhost:3000`

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/posts` | 获取文章列表 |
| POST | `/api/posts` | 发布文章 |

### Swagger 文档

启动服务后访问：

```
http://localhost:3000/api-docs
```

### 示例

**发布文章：**

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title": "Hello World", "content": "我的第一篇文章"}'
```

**获取文章列表：**

```bash
curl http://localhost:3000/api/posts
```

## 文章模型

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | String | 是 | 文章标题 |
| content | String | 是 | 文章内容 |
| createdAt | Date | 否 | 创建时间（自动生成） |
