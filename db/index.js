const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI; 
    // const uri = 'mongodb+srv://wk1651683620_db_user:1651683620@cluster0.pqpw1hg.mongodb.net/?appName=Cluster0'; 
    console.log("正在尝试连接的 URI:", uri); // 调试用，看看是不是拿到了预期的字符串
    await mongoose.connect(uri);
    console.log('MongoDB 连接成功！');
  } catch (err) {
    console.error('数据库连接失败:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;