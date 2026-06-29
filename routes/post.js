const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Post = require('../models/Post'); // 引入模型
const auth = require('../middleware/auth'); // 引入中间件
/**
 * @openapi
 * /api/posts:
 *      get:
 *          summary: 获取当前用户的文章列表（需登录）
 *          description: 需要 Bearer Token，只返回当前登录用户发布的文章
 *          security:
 *              - bearerAuth: []
 *          responses:
 *              '200':
 *                  description: 成功返回当前用户的文章列表
 *              '401':
 *                  description: 未登录或 Token 无效
 */
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.userId });
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

/**
 * @openapi
 * /api/posts/{id}:
 *      get:
 *          summary: 获取文章详情（需登录，仅限作者本人）
 *          description: 需要 Bearer Token，只能查看自己的文章
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: path
 *                name: id
 *                required: true
 *                description: 文章 ID
 *                schema:
 *                  type: string
 *          responses:
 *              '200':
 *                  description: 成功返回文章详情
 *              '401':
 *                  description: 未登录或 Token 无效
 *              '403':
 *                  description: 无权限（非文章作者）
 *              '404':
 *                  description: 文章不存在
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "文章不存在" });
    }

    // 仅允许作者本人查看
    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ error: "无权查看他人文章" });
    }

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "获取文章失败" });
  }
});

/**
 * @openapi
 * /api/posts/{id}:
 *      put:
 *          summary: 更新文章（需登录，仅限作者本人）
 *          description: 需要 Bearer Token，只能修改自己发布的文章
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: path
 *                name: id
 *                required: true
 *                description: 文章 ID
 *                schema:
 *                  type: string
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              title:
 *                                  type: string
 *                              content:
 *                                  type: string
 *          responses:
 *              '200':
 *                  description: 文章更新成功
 *              '401':
 *                  description: 未登录或 Token 无效
 *              '403':
 *                  description: 无权限（非文章作者）
 *              '404':
 *                  description: 文章不存在
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "文章不存在" });
    }

    // 仅允许作者本人修改
    if (post.author && post.author.toString() !== req.user.userId) {
      return res.status(403).json({ error: "无权修改他人文章" });
    }

    const { title, content } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "更新失败" });
  }
});

/**
 * @openapi
 * /api/posts/{id}:
 *      delete:
 *          summary: 删除文章（需登录，仅限作者本人）
 *          description: 需要 Bearer Token，只能删除自己发布的文章
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: path
 *                name: id
 *                required: true
 *                description: 文章 ID
 *                schema:
 *                  type: string
 *          responses:
 *              '200':
 *                  description: 文章删除成功
 *              '401':
 *                  description: 未登录或 Token 无效
 *              '403':
 *                  description: 无权限（非文章作者）
 *              '404':
 *                  description: 文章不存在
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "文章不存在" });
    }

    // 仅允许作者本人删除
    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ error: "无权删除他人文章" });
    }

    await post.deleteOne();
    res.json({ message: "文章删除成功" });
  } catch (err) {
    res.status(500).json({ error: "删除失败" });
  }
});

module.exports = router;