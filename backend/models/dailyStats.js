const mongoose = require("mongoose");

const DailyStatsSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // Định dạng: YYYY-MM-DD
  visitCount: { type: Number, default: 0 },
  newComics: { type: Number, default: 0 } // Thống kê số truyện mới/cập nhật trong ngày
}, { timestamps: true });

module.exports = mongoose.model("DailyStats", DailyStatsSchema);