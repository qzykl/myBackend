const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Quotations = require('../models/Quotations'); // 引入模型
const auth = require('../middleware/auth'); // 引入中间件

/**
 * @openapi
 * /api/quotations:
 *      get:
 *          summary: 获取当前用户的语录列表（需登录）
 *          description: 需要 Bearer Token，只返回当前登录用户发布的引用
 *          security:
 *              - bearerAuth: []
 *          responses:
 *              '200':
 *                  description: 成功返回当前用户的引用列表
 *              '401':
 *                  description: 未登录或 Token 无效
 */
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Quotations.find({ author: req.user.userId });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: "获取语录失败" });
    }
});

/**
 * @openapi
 * /api/quotations:
 *      post:
 *          summary: 发布语录（需登录）
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
 *                              - owner
 *                          properties:
 *                              title:
 *                                  type: string
 *                              content:
 *                                  type: string
 *                              owner:
 *                                  type: string
 *          responses:
 *              '201':
 *                  description: 语录发布成功
 *              '401':
 *                  description: 未登录或 Token 无效
 */
router.post('/', auth, async (req, res) => {
    try {
        const newPost = new Quotations({ ...req.body, author: req.user.userId });
        await newPost.save();
        res.status(201).json({ message: "语录发布成功" });
    } catch (err) {
        res.status(400).json({ error: "语录发布失败" });
    }
});


/**
 * @openapi
 * /api/quotations/:id:
 *      get:
 *          summary: 获取指定语录
 *          description: 需要 Bearer Token，只返回当前登录用户发布的引用
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
 *                  description: 成功返回指定语录
 *              '401':
 *                  description: 未登录或 Token 无效
 *              '404':
 *                  description: 指定语录不存在
 */
router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Quotations.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "语录不存在" });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: "获取语录失败" });
    }
});

/**
 * @openapi
 * /api/quotations/:id:
 *      put:
 *          summary: 更新指定语录
 *          description: 需要 Bearer Token，只允许更新当前登录用户发布的引用
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
 *              '200':
 *                  description: 语录更新成功
 *              '401':
 *                  description: 未登录或 Token 无效
 *              '404':
 *                  description: 指定语录不存在
 *              '403':
 *                  description: 无权限更新其他用户的语录
 */
router.put('/:id', auth, async (req, res) => {
    try {
        const post = await Quotations.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: "语录不存在" });
        }

        // 仅允许作者本人修改
        if (post.author && post.author.toString() !== req.user.userId) {
            return res.status(403).json({ error: "无权修改他人语录" });
        }

        const { title, content } = req.body;
        if (title) post.title = title;
        if (content) post.content = content;

        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: "更新失败" });
    }
})

/**
 * @openapi
 * /api/quotations/:id:
 *      delete:
 *          summary: 删除指定语录
 *          description: 需要 Bearer Token，只允许删除当前登录用户发布的引用
 *          security:
 *              - bearerAuth: []
 *          responses:
 *              '200':
 *                  description: 语录删除成功
 *              '401':
 *                  description: 未登录或 Token 无效
 *              '404':
 *                  description: 指定语录不存在
 *              '403':
 *                  description: 无权限删除其他用户的语录
 */

router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Quotations.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: "语录不存在" });
        }

        // 仅允许作者本人删除
        if (post.author.toString() !== req.user.userId) {
            return res.status(403).json({ error: "无权删除他人语录" });
        }

        await post.deleteOne();
        res.json({ message: "语录删除成功" });
    } catch (err) {
        res.status(500).json({ error: "删除失败" });
    }
})

module.exports = router;