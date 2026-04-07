const mongoose = require("mongoose");

const ComicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  coverImage: { type: String }, // Link ảnh bìa từ Cloudinary
  author: { type: String, default: "Đang cập nhật" },
  status: { type: String, enum: ["Đang tiến hành", "Hoàn thành"], default: "Đang tiến hành" },
  genres: [{ type: mongoose.Schema.Types.ObjectId, ref: "Genre" }],
  views: { type: Number, default: 0 },
  chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }]
}, { timestamps: true });

module.exports = mongoose.model("Comic", ComicSchema);