const express = require("express");
const router = express.Router();
const Genre = require("../models/genre");
const { verifyAdmin } = require("../middleware/authMiddleware");

// Lấy tất cả thể loại
router.get("/", async (req, res) => {
  try {
    const genres = await Genre.find().sort({ name: 1 });
    res.json(genres);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// THÊM THỂ LOẠI (Admin only)
router.post("/", verifyAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const newGenre = new Genre({ name, description });
    await newGenre.save();
    res.status(201).json(newGenre);
  } catch (err) {
    res.status(400).json({ message: "Thể loại đã tồn tại hoặc có lỗi" });
  }
});

// SỬA THỂ LOẠI (Admin only)
router.put("/:id", verifyAdmin, async (req, res) => {
  try {
    const updatedGenre = await Genre.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedGenre);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// XÓA THỂ LOẠI (Admin only)
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    await Genre.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa thể loại thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;