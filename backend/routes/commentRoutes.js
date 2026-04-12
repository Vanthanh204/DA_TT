const express = require("express");
const router = express.Router();
const Comment = require("../models/comment");
const { verifyToken } = require("../middleware/authMiddleware");

// 👉 1. LẤY TẤT CẢ BÌNH LUẬN CỦA MỘT BỘ TRUYỆN
router.get("/:comicId", async (req, res) => {
  try {
    const comments = await Comment.find({ comic: req.params.comicId })
      .populate("user", "username avatar") // Chỉ lấy tên và avatar
      .sort({ createdAt: -1 }); // Mới nhất lên đầu
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy bình luận", error: err.message });
  }
});

// 👉 2. ĐĂNG BÌNH LUẬN MỚI (Yêu cầu đăng nhập)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { comicId, content } = req.body;
    if (!content) return res.status(400).json({ message: "Nội dung không được rỗng" });

    const newComment = new Comment({
      comic: comicId,
      user: req.user.id, // Lấy ID từ token
      content
    });

    await newComment.save();
    
    // Trả về comment đã được populate user để hiển thị ngay trên frontend
    const populatedComment = await Comment.findById(newComment._id).populate("user", "username avatar");
    
    res.json(populatedComment);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi đăng bình luận", error: err.message });
  }
});

// 👉 3. XÓA BÌNH LUẬN (Dành cho admin hoặc chính chủ - tạm thời bỏ qua cho đơn giản)

module.exports = router;