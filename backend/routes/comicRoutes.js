const express = require("express");
const router = express.Router();
const Comic = require("../models/comic");
const Chapter = require("../models/chapter");
const User = require("../models/user");
const { verifyAdmin, verifyToken } = require("../middleware/authMiddleware");

// Lấy tất cả truyện
router.get("/", async (req, res) => {
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
    const isLocked = latestIds.includes(chapter._id.toString()) && user.level < 1;

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
    const updatedComic = await Comic.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedComic);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👉 XÓA TRUYỆN (Và tất cả chương của nó)
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    await Chapter.deleteMany({ comicId: req.params.id });
    await Comic.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa truyện và các chương thành công!" });
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

// 👉 XÓA CHƯƠNG
router.delete("/chapter/:chapterId", verifyAdmin, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId);
    if (!chapter) return res.status(404).json({ message: "Không tìm thấy chương" });

    // Xóa ID chương khỏi danh sách chương của Comic
    await Comic.findByIdAndUpdate(chapter.comicId, { $pull: { chapters: chapter._id } });
    
    // Xóa chương
    await Chapter.findByIdAndDelete(req.params.chapterId);
    
    res.json({ message: "Xóa chương thành công!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;