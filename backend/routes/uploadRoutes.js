const express = require("express");
const router = express.Router();
const { uploadCloud, cloudinary } = require("../config/cloudinary");
const Comic = require("../models/comic");
const Chapter = require("../models/chapter");
const DailyStats = require("../models/dailyStats");
const { verifyAdmin, verifyToken } = require("../middleware/authMiddleware");

// 👉 0. TẠO SIGNATURE ĐỂ UPLOAD TRỰC TIẾP TỪ FRONTEND (Tăng tốc tối đa)
router.get("/signature", verifyAdmin, (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: "comic_web" },
    process.env.CLOUDINARY_API_SECRET
  );
  res.json({ 
    signature, 
    timestamp, 
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY
  });
});

// 👉 1. UPLOAD ẢNH (Dùng cho cả ảnh bìa và avatar)
router.post("/comic-cover", verifyToken, uploadCloud.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Chưa có ảnh nào được chọn" });
    res.json({ imageUrl: req.file.path });
  } catch (err) {
    res.status(500).json({ message: "Lỗi upload ảnh bìa", error: err.message });
  }
});

// 👉 2. UPLOAD HÀNG LOẠT TRANG TRUYỆN CHO CHƯƠNG (Admin only)
router.post("/chapter-pages", verifyAdmin, uploadCloud.array("images", 200), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Chưa có ảnh nào được chọn" });
    }
    const imageUrls = req.files.map((file) => file.path);
    res.json({ imageUrls });
  } catch (err) {
    res.status(500).json({ message: "Lỗi upload trang truyện", error: err.message });
  }
});

// 👉 3. TẠO TRUYỆN MỚI (Admin only)
router.post("/create-comic", verifyAdmin, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { title, description, coverImage, author, genres } = req.body;
    const newComic = new Comic({ title, description, coverImage, author, genres });
    await newComic.save();

    // Cập nhật thống kê ngày
    await DailyStats.findOneAndUpdate(
      { date: today },
      { $inc: { newComics: 1 } },
      { upsert: true }
    );

    res.json({ message: "Tạo truyện thành công!", comic: newComic });
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo truyện", error: err.message });
  }
});

// 👉 4. TẠO CHƯƠNG MỚI (Admin only)
router.post("/create-chapter", verifyAdmin, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { comicId, chapterNumber, title, pages } = req.body;
    const newChapter = new Chapter({ comicId, chapterNumber, title, pages });
    await newChapter.save();
    await Comic.findByIdAndUpdate(comicId, { $push: { chapters: newChapter._id } });

    // Cập nhật thống kê ngày
    await DailyStats.findOneAndUpdate(
      { date: today },
      { $inc: { newComics: 1 } },
      { upsert: true }
    );

    res.json({ message: "Tạo chương thành công!", chapter: newChapter });
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo chương", error: err.message });
  }
});

module.exports = router;