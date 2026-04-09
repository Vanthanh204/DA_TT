const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, "Tên đăng nhập không được rỗng"],
    trim: true,
    minlength: [3, "Tên đăng nhập ít nhất 3 ký tự"],
    maxlength: [20, "Tên đăng nhập tối đa 20 ký tự"],
    match: [/^[a-zA-Z0-9_]+$/, "Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới"]
  },
  email: { 
    type: String, 
    unique: true, 
    required: [true, "Email không được rỗng"],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Vui lòng nhập định dạng email hợp lệ"]
  },
  password: { 
    type: String, 
    required: [true, "Mật khẩu không được rỗng"],
    minlength: [6, "Mật khẩu ít nhất 6 ký tự"]
  },
  birthDate: {
    type: Date,
    validate: {
      validator: function(value) {
        if (!value) return true;
        const now = new Date();
        const minAgeDate = new Date();
        minAgeDate.setFullYear(now.getFullYear() - 100); // Tối đa 100 tuổi
        const maxAgeDate = new Date();
        maxAgeDate.setFullYear(now.getFullYear() - 6);   // Tối thiểu 6 tuổi
        return value >= minAgeDate && value <= maxAgeDate;
      },
      message: "Ngày sinh không hợp lệ. Người dùng phải từ 6 đến 100 tuổi."
    }
  },
  avatar: {
    type: String,
    default: ""
  },
  role: {
    type: String,
    enum: {
      values: ["admin", "user"],
      message: "{VALUE} không phải là vai trò hợp lệ"
    },
    default: "user"
  },
  isLocked: { 
    type: Boolean, 
    default: false 
  },
  level: { 
    type: Number, 
    default: 0,
    min: [0, "Level không được là số âm"],
    validate: {
      validator: Number.isInteger,
      message: "Level phải là số nguyên"
    }
  },
  readCount: { 
    type: Number, 
    default: 0,
    min: [0, "Số lượng chương đã đọc không được âm"]
  },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comic" }]
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);