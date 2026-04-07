const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { verifyAdmin, verifyToken } = require("../middleware/authMiddleware");

// 👉 Thêm/Xóa truyện khỏi danh sách yêu thích
router.post("/favorite/:comicId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const comicId = req.params.comicId;

    const index = user.favorites.indexOf(comicId);
    if (index === -1) {
      user.favorites.push(comicId);
      await user.save();
      res.json({ message: "Đã thêm vào yêu thích", isFavorite: true });
    } else {
      user.favorites.splice(index, 1);
      await user.save();
      res.json({ message: "Đã xóa khỏi yêu thích", isFavorite: false });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👉 Lấy danh sách truyện yêu thích
router.get("/favorites/list", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "favorites",
      populate: { path: "genres" } // Lấy luôn thông tin thể loại
    });
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👉 Lấy thông tin bản thân (User/Admin đều dùng được)
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👉 User tự cập nhật thông tin (Chỉ cho phép đổi username, age, avatar)
router.put("/me", verifyToken, async (req, res) => {
  try {
    const { username, age, avatar } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { username, age, avatar },
      { new: true }
    ).select("-password");
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Lấy danh sách tất cả người dùng (Chỉ Admin)
router.get("/", verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin cập nhật thông tin người dùng bất kỳ
router.put("/:id", verifyAdmin, async (req, res) => {
  try {
    const { level, role, username, isLocked } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { level, role, username, isLocked },
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👉 Admin khóa / mở khóa tài khoản
router.patch("/:id/status", verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json("Không tìm thấy người dùng!");
    
    user.isLocked = !user.isLocked;
    await user.save();
    res.json({ message: user.isLocked ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản", isLocked: user.isLocked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Xóa người dùng (Chỉ Admin)
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa người dùng thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;