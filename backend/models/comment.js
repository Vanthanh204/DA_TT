const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  comic: { type: mongoose.Schema.Types.ObjectId, ref: "Comic", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { 
    type: String, 
    required: [true, "Nội dung bình luận không được để trống"],
    trim: true,
    maxlength: [500, "Bình luận không được quá 500 ký tự"]
  }
}, { timestamps: true });

module.exports = mongoose.model("Comment", CommentSchema);