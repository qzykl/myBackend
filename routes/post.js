const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Post = require('../models/Post'); // 引入模型
const auth = require('../middleware/auth'); // 引入中间件
/**
 * @openapi
 * /api/posts:
 *      get:
 *          summary: 获取文章列表
 *          responses:
 *              '200':
 *                  description: 成功返回文章列表
 */
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find(); // 从数据库获取所有文章
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: "获取文章失败" });
    }
});

/**
 * @openapi
 * /api/posts:
 *      post:
 *          summary: 发布文章（需登录）
 *          description: 需要 Bearer Token，author 字段由服务端根据 Token 自动填充
 *          security:
 *              - bearerAuth: []
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                              - title
 *                              - content
 *                          properties:
 *                              title:
 *                                  type: string
 *                              content:
 *                                  type: string
 *          responses:
 *              '201':
 *                  description: 文章发布成功
 *              '401':
 *                  description: 未登录或 Token 无效
 */
router.post('/', auth, async (req, res) => {
  try {
    const newPost = new Post({ ...req.body, author: req.user.userId });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: "发布失败" });
  }
});

/**
 * @openapi
 * /api/posts/getToken:
 */

/**
 * @openapi
 * /api/posts/getToken:
 *      post:
 *          summary: 快速获取 Token（仅开发调试用）
 *          description: 传入 userId 和过期时间，快速生成 JWT，用于模拟 Token 过期等场景
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                              - userId
 *                          properties:
 *                              userId:
 *                                  type: string
 *                                  description: 用户 ID
 *                              expiresIn:
 *                                  type: string
 *                                  description: 过期时间，如 1s / 5m / 1h（默认 1h）
 *          responses:
 *              '200':
 *                  description: 返回生成的 Token
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  token:
 *                                      type: string
 */
router.post('/getToken', (req, res) => {
  const { userId, expiresIn } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "缺少 userId" });
  }
  const expire = expiresIn || '1h';
  const token = jwt.sign({ userId }, 'YOUR_SECRET_KEY', { expiresIn: expire });
  res.json({ token, expiresIn: expire });
});

module.exports = router;