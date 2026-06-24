const express = require('express');
const router = express.Router();
const Post = require('../models/Post'); // 引入模型

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
 *          summary: 发布文章
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
 *              '201':
 *                  description: 文章发布成功
 */
router.post('/',async (req, res) => {
  try {
    const { title, content } = req.body;
    // 创建并保存新文章
    const newPost = new Post({ title, content });
    await newPost.save();
    
    res.status(201).json({ message: "文章发布成功", data: newPost });
  } catch (error) {
    res.status(500).json({ error: "服务器内部错误" });
  }
});

module.exports = router;