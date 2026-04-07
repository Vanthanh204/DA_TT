const mongoose = require("mongoose");

const ChapterSchema = new mongoose.Schema({
  comicId: { type: mongoose.Schema.Types.ObjectId, ref: "Comic", required: true },
  chapterNumber: { 
    type: Number, 
    required: true,
    min: [1, "Số chương phải lớn hơn hoặc bằng 1"],
    validate: {
      validator: Number.isInteger,
      message: "{VALUE} không phải là số nguyên."
    }
  },
  title: { 
    type: String,
    trim: true,
    maxlength: [100, "Tiêu đề chương không được quá 100 ký tự"]
  },
  pages: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model("Chapter", ChapterSchema);