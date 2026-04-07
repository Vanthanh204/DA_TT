require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const uploadRoute = require('./routes/uploadRoutes');
const authRoute = require('./routes/authRoutes');
const comicRoute = require('./routes/comicRoutes');
const userRoute = require('./routes/userRoutes');
const genreRoute = require('./routes/genreRoutes');
const User = require('./models/user');
const Comic = require('./models/comic');
const Chapter = require('./models/chapter');
const { verifyAdmin } = require('./middleware/authMiddleware');

const app = express();

// connect DB
connectDB();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use('/api/upload', uploadRoute);
app.use('/api/auth', authRoute);
app.use('/api/comics', comicRoute);
app.use('/api/users', userRoute);
app.use('/api/genres', genreRoute);

// 👉 API THỐNG KÊ CHO ADMIN
app.get('/api/admin/stats', verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalComics = await Comic.countDocuments();
    const totalChapters = await Chapter.countDocuments();
    res.json({ totalUsers, totalComics, totalChapters });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// test route
app.get('/', (req, res) => {
  res.send('Comic API is running');
});

// start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});