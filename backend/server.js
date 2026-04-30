require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const uploadRoute = require('./routes/uploadRoutes');
const authRoute = require('./routes/authRoutes');
const comicRoute = require('./routes/comicRoutes');
const userRoute = require('./routes/userRoutes');
const genreRoute = require('./routes/genreRoutes');
const commentRoute = require('./routes/commentRoutes'); // Thêm dòng này
const User = require('./models/user');
const Comic = require('./models/comic');
const Chapter = require('./models/chapter');
const WebsiteStats = require('./models/websiteStats');
const DailyStats = require('./models/dailyStats');
const { verifyAdmin } = require('./middleware/authMiddleware');

const app = express();

// connect DB
connectDB();

// middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// routes
app.use('/api/upload', uploadRoute);
app.use('/api/auth', authRoute);
app.use('/api/comics', comicRoute);
app.use('/api/users', userRoute);
app.use('/api/genres', genreRoute);
app.use('/api/comments', commentRoute); // Thêm dòng này

// 👉 API TĂNG LƯỢT TRUY CẬP (Gọi khi load trang chủ)
app.post('/api/admin/stats/visit', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Tăng tổng lượt truy cập
    let stats = await WebsiteStats.findOne();
    if (!stats) {
      stats = new WebsiteStats({ visitCount: 1 });
    } else {
      stats.visitCount += 1;
    }
    await stats.save();

    // 2. Tăng lượt truy cập theo ngày
    await DailyStats.findOneAndUpdate(
      { date: today },
      { $inc: { visitCount: 1 } },
      { upsert: true, new: true }
    );

    res.json({ visitCount: stats.visitCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👉 API THỐNG KÊ THEO NGÀY (Cho biểu đồ)
app.get('/api/admin/stats/daily', verifyAdmin, async (req, res) => {
  try {
    // Lấy dữ liệu 10 ngày gần nhất
    const dailyData = await DailyStats.find().sort({ date: -1 }).limit(10);
    res.json(dailyData.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👉 API THỐNG KÊ TỔNG QUAN CHO ADMIN
app.get('/api/admin/stats', verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalComics = await Comic.countDocuments();
    const totalChapters = await Chapter.countDocuments();
    const siteStats = await WebsiteStats.findOne();
    res.json({ 
      totalUsers, 
      totalComics, 
      totalChapters, 
      visitCount: siteStats ? siteStats.visitCount : 0 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// test route
app.get('/', (req, res) => {
  res.send('Chào mừng bạn đến với Góc truyện của Thanh API');
});

// start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Tự động ping chính mình mỗi 14 phút để tránh Render ngủ
  // Đảm bảo bạn đã cấu hình BACKEND_URL trong biến môi trường trên Render
  const BACKEND_URL = process.env.BACKEND_URL;
  if (BACKEND_URL) {
    const https = require('https');
    setInterval(() => {
      https.get(BACKEND_URL, (res) => {
        console.log(`Self-ping successful: ${res.statusCode}`);
      }).on('error', (err) => {
        console.error(`Self-ping failed: ${err.message}`);
      });
    }, 14 * 60 * 1000); // 14 phút
  }
});