const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // 获取请求头中的 Authorization 字段
  const authHeader = req.headers.authorization;
  
  if (!authHeader) return res.status(401).json({ error: "请先登录" });

  // Token 通常格式为 "Bearer <token>"
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'my_super_secret_key_2024'); // 校验 Token
    req.user = decoded; // 将用户信息挂载到 req 对象上，后续逻辑可用
    next(); // 放行，进入下一个处理函数
  } catch (err) {
    res.status(401).json({ error: "Token 无效或已过期" });
  }
};