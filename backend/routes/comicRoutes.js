const express = require("express");
const router = express.Router();
const Comic = require("../models/comic");
const Chapter = require("../models/chapter");
const User = require("../models/user");
const { verifyAdmin, verifyToken } = require("../middleware/authMiddleware");
const { cloudinary } = require("../config/cloudinary");

// Hàm hỗ trợ xóa ảnh trên Cloudinary từ URL
const deleteFromCloudinary = async (url) => {
  if (!url) return;
  try {
    // Tách public_id từ URL (Ví dụ: .../comic_web/id.jpg -> comic_web/id)
    const parts = url.split("/");
    const fileName = parts[parts.length - 1].split(".")[0];
    const folder = "comic_web"; // Thư mục đã cấu hình
    const publicId = `${folder}/${fileName}`;
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Lỗi xóa ảnh Cloudinary:", err);
  }
};

// 👉 API TRENDING: Top 3 truyện và Thể loại hot nhất
router.get("/trending/top", async (req, res) => {
  try {
    // 1. Lấy Top 3 truyện có views cao nhất
    const topComics = await Comic.find()
      .sort({ views: -1 })
      .limit(3)
      .select("title coverImage views");

    // 2. Tính toán thể loại được đọc nhiều nhất
    // Lấy tất cả truyện có views > 0 và populate thể loại
    const allComics = await Comic.find({ views: { $gt: 0 } }).populate("genres");
    
    const genreStats = {};
    allComics.forEach(comic => {
      comic.genres.forEach(genre => {
        if (!genreStats[genre.name]) {
          genreStats[genre.name] = 0;
        }
        genreStats[genre.name] += comic.views;
      });
    });

    // Tìm thể loại có tổng views cao nhất
    let topGenre = "Đang cập nhật";
    let maxViews = -1;
    for (const [name, views] of Object.entries(genreStats)) {
      if (views > maxViews) {
        maxViews = views;
        topGenre = name;
      }
    }

    res.json({ topComics, topGenre });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Lấy tất cả truyện (giữ nguyên bên dưới)
  try {
    const comics = await Comic.find().populate("chapters").populate("genres");
    res.json(comics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👉 LẤY CHI TIẾT MỘT CHƯƠNG TRUYỆN (Dùng cho trang đọc)
router.get("/chapter/:chapterId", verifyToken, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId);
    if (!chapter) return res.status(404).json({ message: "Không tìm thấy chương" });

    // Lấy thông tin user để kiểm tra level
    const user = await User.findById(req.user.id);
    
    // Kiểm tra xem chương này có nằm trong 3 chương mới nhất của bộ truyện không
    const latestChapters = await Chapter.find({ comicId: chapter.comicId })
      .sort({ chapterNumber: -1 })
      .limit(3)
      .select("_id");
    
    const latestIds = latestChapters.map(c => c._id.toString());
    
    // ĐIỀU KIỆN MỞ KHÓA: 
    // 1. Là Admin (user.role === "admin")
    // 2. Không phải chương mới nhất
    // 3. Đã đạt Level >= 1
    const isLocked = latestIds.includes(chapter._id.toString()) && 
                     user.role !== "admin" && 
                     user.level < 1;

    if (isLocked) {
      return res.status(403).json({ 
        message: "Chương này hiện đang khóa. Bạn cần đạt Level 1 để đọc (Đọc đủ 10 chương bất kỳ).",
        isLocked: true 
      });
    }

    // Nếu đọc thành công, tăng readCount và kiểm tra level up
    user.readCount = (user.readCount || 0) + 1;
    if (user.readCount >= 10 && user.level < 1) {
      user.level = 1;
    }

    // 👉 LƯU LỊCH SỬ ĐỌC VÀO DB
    // Loại bỏ lịch sử cũ của truyện này (nếu có) để đưa cái mới nhất lên đầu
    user.readHistory = user.readHistory.filter(h => h.comic.toString() !== chapter.comicId.toString());
    user.readHistory.unshift({ comic: chapter.comicId, chapter: chapter._id, readAt: new Date() });
    
    // Giới hạn 30 truyện đọc gần nhất
    if (user.readHistory.length > 30) user.readHistory.pop();

    await user.save();

    // Tìm chương trước và chương sau
    const prevChapter = await Chapter.findOne({
      comicId: chapter.comicId,
      chapterNumber: { $lt: chapter.chapterNumber }
    }).sort({ chapterNumber: -1 });

    const nextChapter = await Chapter.findOne({
      comicId: chapter.comicId,
      chapterNumber: { $gt: chapter.chapterNumber }
    }).sort({ chapterNumber: 1 });

    res.json({
      ...chapter.toObject(),
      prevChapterId: prevChapter ? prevChapter._id : null,
      nextChapterId: nextChapter ? nextChapter._id : null,
      currentLevel: user.level,
      readCount: user.readCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👉 TÌM KIẾM TRUYỆN (Dùng cho cả Search Suggestions và Search Page)
router.get("/search", async (req, res) => {
  try {
    const { q, genre } = req.query;
    let query = {};

    if (q) {
      query.title = { $regex: q, $options: "i" }; // Tìm kiếm không phân biệt hoa thường
    }

    if (genre) {
      query.genres = genre; // Tìm kiếm theo ID thể loại
    }

    const comics = await Comic.find(query).populate("genres").limit(20);
    res.json(comics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👉 LẤY DANH SÁCH TRUYỆN THEO IDs (Dùng cho trang Lịch sử)
router.post("/by-ids", async (req, res) => {
  try {
    const { ids } = req.body;
    const comics = await Comic.find({ _id: { $in: ids } }).populate("genres");
    res.json(comics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Lấy chi tiết một bộ truyện
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

// 👉 SỬA TRUYỆN
router.put("/:id", verifyAdmin, async (req, res) => {
  try {
    const oldComic = await Comic.findById(req.params.id);
    // Nếu đổi ảnh bìa mới, xóa ảnh cũ trên Cloudinary
    if (req.body.coverImage && oldComic.coverImage && req.body.coverImage !== oldComic.coverImage) {
      await deleteFromCloudinary(oldComic.coverImage);
    }
    const updatedComic = await Comic.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedComic);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👉 XÓA TRUYỆN (Và tất cả chương & ảnh liên quan)
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const comic = await Comic.findById(req.params.id).populate("chapters");
    if (!comic) return res.status(404).json({ message: "Không tìm thấy truyện" });

    // 1. Xóa ảnh bìa truyện trên Cloudinary
    await deleteFromCloudinary(comic.coverImage);

    // 2. Lặp qua tất cả chương để xóa ảnh các trang trên Cloudinary
    if (comic.chapters && comic.chapters.length > 0) {
      for (const chapter of comic.chapters) {
        if (chapter.pages && chapter.pages.length > 0) {
          for (const pageUrl of chapter.pages) {
            await deleteFromCloudinary(pageUrl);
          }
        }
      }
    }

    // 3. Xóa dữ liệu trong Database
    await Chapter.deleteMany({ comicId: req.params.id });
    await Comic.findByIdAndDelete(req.params.id);

    res.json({ message: "Xóa truyện và toàn bộ ảnh trên Cloudinary thành công!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👉 SỬA CHƯƠNG
router.put("/chapter/:chapterId", verifyAdmin, async (req, res) => {
  try {
    const updatedChapter = await Chapter.findByIdAndUpdate(req.params.chapterId, req.body, { new: true });
    res.json(updatedChapter);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👉 XÓA CHƯƠNG (Xóa luôn ảnh các trang trên Cloudinary)
router.delete("/chapter/:chapterId", verifyAdmin, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId);
    if (!chapter) return res.status(404).json({ message: "Không tìm thấy chương" });

    // 1. Xóa tất cả ảnh các trang của chương này trên Cloudinary
    if (chapter.pages && chapter.pages.length > 0) {
      for (const pageUrl of chapter.pages) {
        await deleteFromCloudinary(pageUrl);
      }
    }

    // 2. Xóa liên kết trong Comic
    await Comic.findByIdAndUpdate(chapter.comicId, { $pull: { chapters: chapter._id } });
    
    // 3. Xóa chương trong DB
    await Chapter.findByIdAndDelete(req.params.chapterId);
    
    res.json({ message: "Xóa chương và các ảnh liên quan thành công!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;