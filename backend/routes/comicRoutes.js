const express = require("express");
const router = express.Router();
const Comic = require("../models/comic");
const Chapter = require("../models/chapter");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { verifyAdmin, verifyToken } = require("../middleware/authMiddleware");
const { cloudinary } = require("../config/cloudinary");

// Hàm hỗ trợ xóa ảnh trên Cloudinary
const deleteFromCloudinary = async (url) => {
  if (!url) return;
  try {
    const parts = url.split("/");
    const fileName = parts[parts.length - 1].split(".")[0];
    const folder = "comic_web"; 
    const publicId = `${folder}/${fileName}`;
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Lỗi xóa ảnh Cloudinary:", err);
  }
};

// 👉 API TRENDING: Top 3 truyện và Thể loại hot nhất
router.get("/trending/top", async (req, res) => {
  try {
    const topComics = await Comic.find()
      .sort({ views: -1 })
      .limit(3)
      .select("title coverImage views");

    const allComics = await Comic.find({ views: { $gt: 0 } }).populate("genres");
    
    const genreStats = {};
    allComics.forEach(comic => {
      if (comic.genres && Array.isArray(comic.genres)) {
        comic.genres.forEach(genre => {
          if (genre && genre.name) {
            if (!genreStats[genre.name]) {
              genreStats[genre.name] = 0;
            }
            genreStats[genre.name] += (comic.views || 0);
          }
        });
      }
    });

    let topGenre = "";
    let maxViews = -1;
    for (const [name, views] of Object.entries(genreStats)) {
      if (views > maxViews) {
        maxViews = views;
        topGenre = name;
      }
    }

    res.json({ topComics: topComics || [], topGenre });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Lấy tất cả truyện
router.get("/", async (req, res) => {
  try {
    const comics = await Comic.find().populate("chapters").populate("genres").sort({ updatedAt: -1 });
    res.json(comics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👉 LẤY CHI TIẾT MỘT CHƯƠNG TRUYỆN (Mọi người đều có thể tăng view)
router.get("/chapter/:chapterId", async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId);
    if (!chapter) return res.status(404).json({ message: "Không tìm thấy chương" });

    // 1. TĂNG VIEW CHO BỘ TRUYỆN (Luôn thực hiện)
    try {
      if (chapter.comicId) {
        await Comic.findByIdAndUpdate(chapter.comicId, { $inc: { views: 1 } });
        console.log(`[LOG] Đã tăng view cho truyện ID: ${chapter.comicId}`);
      }
    } catch (viewErr) {
      console.error("Lỗi tăng view:", viewErr.message);
    }

    // 2. Kiểm tra token (không bắt buộc) để xử lý khóa chương và level
    const authHeader = req.headers.authorization;
    let user = null;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.id);
      } catch (err) {
        // Token lỗi thì coi như khách
      }
    }

    // 3. Kiểm tra khóa 3 chương mới nhất
    const latestChapters = await Chapter.find({ comicId: chapter.comicId })
      .sort({ chapterNumber: -1 })
      .limit(3)
      .select("_id");
    
    const latestIds = latestChapters.map(c => c._id.toString());
    const isLocked = latestIds.includes(chapter._id.toString()) && 
                     (!user || (user.role !== "admin" && user.level < 1));

    if (isLocked) {
      return res.status(403).json({ 
        message: "Chương này hiện đang khóa. Bạn cần đăng nhập và đạt Level 1 để đọc.", 
        isLocked: true 
      });
    }

    // 4. Nếu có user đăng nhập, cập nhật lịch sử và readCount
    if (user) {
      user.readCount = (user.readCount || 0) + 1;
      if (user.readCount >= 10 && user.level < 1) { user.level = 1; }
      user.readHistory = user.readHistory.filter(h => h.comic && h.comic.toString() !== chapter.comicId.toString());
      user.readHistory.unshift({ comic: chapter.comicId, chapter: chapter._id, readAt: new Date() });
      if (user.readHistory.length > 30) user.readHistory.pop();
      await user.save();
    }

    const prevChapter = await Chapter.findOne({ comicId: chapter.comicId, chapterNumber: { $lt: chapter.chapterNumber } }).sort({ chapterNumber: -1 });
    const nextChapter = await Chapter.findOne({ comicId: chapter.comicId, chapterNumber: { $gt: chapter.chapterNumber } }).sort({ chapterNumber: 1 });

    res.json({
      ...chapter.toObject(),
      prevChapterId: prevChapter ? prevChapter._id : null,
      nextChapterId: nextChapter ? nextChapter._id : null,
      currentLevel: user ? user.level : 0,
      readCount: user ? user.readCount : 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👉 TÌM KIẾM TRUYỆN
router.get("/search", async (req, res) => {
  try {
    const { q, genre } = req.query;
    let query = {};
    if (q) query.title = { $regex: q, $options: "i" };
    if (genre) query.genres = genre;
    const comics = await Comic.find(query).populate("genres").limit(20);
    res.json(comics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👉 LẤY DANH SÁCH TRUYỆN THEO IDs
router.post("/by-ids", async (req, res) => {
  try {
    const { ids } = req.body;
    const comics = await Comic.find({ _id: { $in: ids } }).populate("genres");
    res.json(comics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👉 LẤY CHI TIẾT TRUYỆN (Trang Detail)
router.get("/:id", async (req, res) => {
  try {
    const comic = await Comic.findById(req.params.id).populate("chapters").populate("genres");
    if (!comic) return res.status(404).json({ message: "Không tìm thấy truyện" });
    res.json(comic);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- ADMIN ROUTES ---
router.put("/:id", verifyAdmin, async (req, res) => {
  try {
    const oldComic = await Comic.findById(req.params.id);
    if (req.body.coverImage && oldComic.coverImage && req.body.coverImage !== oldComic.coverImage) {
      await deleteFromCloudinary(oldComic.coverImage);
    }
    const updatedComic = await Comic.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedComic);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const comic = await Comic.findById(req.params.id).populate("chapters");
    if (!comic) return res.status(404).json({ message: "Không tìm thấy truyện" });
    await deleteFromCloudinary(comic.coverImage);
    if (comic.chapters) {
      for (const chapter of comic.chapters) {
        if (chapter.pages) {
          for (const pageUrl of chapter.pages) await deleteFromCloudinary(pageUrl);
        }
      }
    }
    await Chapter.deleteMany({ comicId: req.params.id });
    await Comic.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa thành công!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/chapter/:chapterId", verifyAdmin, async (req, res) => {
  try {
    const updatedChapter = await Chapter.findByIdAndUpdate(req.params.chapterId, req.body, { new: true });
    res.json(updatedChapter);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/chapter/:chapterId", verifyAdmin, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId);
    if (!chapter) return res.status(404).json({ message: "Không tìm thấy chương" });
    if (chapter.pages) {
      for (const pageUrl of chapter.pages) await deleteFromCloudinary(pageUrl);
    }
    await Comic.findByIdAndUpdate(chapter.comicId, { $pull: { chapters: chapter._id } });
    await Chapter.findByIdAndDelete(req.params.chapterId);
    res.json({ message: "Xóa chương thành công!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;