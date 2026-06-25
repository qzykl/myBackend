const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * @openapi
 * /api/auth/register:
 *      post:
 *          summary: 用户注册
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                              - username
 *                              - password
 *                          properties:
 *                              username:
 *                                  type: string
 *                              password:
 *                                  type: string
 *          responses:
 *              '201':
 *                  description: 注册成功
 *              '400':
 *                  description: 注册失败，用户名可能已存在
 */
router.post('/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: "注册成功" });
  } catch (err) {
    res.status(400).json({ error: "注册失败，用户名可能已存在" });
  }
});

/**
 * @openapi
 * /api/auth/login:
 *      post:
 *          summary: 用户登录
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                              - username
 *                              - password
 *                          properties:
 *                              username:
 *                                  type: string
 *                              password:
 *                                  type: string
 *          responses:
 *              '200':
 *                  description: 登录成功，返回 Token
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  token:
 *                                      type: string
 *              '401':
 *                  description: 用户名或密码错误
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "用户名或密码错误" });
  }

  // 生成 Token，有效期 1 小时
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

module.exports = router;