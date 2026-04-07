const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, "Tên đăng nhập không được rỗng"],
    trim: true,
    minlength: [3, "Tên đăng nhập ít nhất 3 ký tự"],
    maxlength: [20, "Tên đăng nhập tối đa 20 ký tự"]
  },
  email: { 
    type: String, 
    unique: true, 
    required: [true, "Email không được rỗng"],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Vui lòng nhập email hợp lệ"]
  },
  password: { 
    type: String, 
    required: [true, "Mật khẩu không được rỗng"],
    minlength: [6, "Mật khẩu ít nhất 6 ký tự"]
  },
  age: {
    type: Number,
    min: [6, "Tuổi tối thiểu là 6"],
    max: [100, "Tuổi tối đa là 100"],
    validate: {
      validator: Number.isInteger,
      message: "Tuổi phải là số nguyên dương"
    }
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user"
  },
  isLocked: { 
    type: Boolean, 
    default: false 
  },
  level: { type: Number, default: 0 },
  readCount: { type: Number, default: 0 },

  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comic" }]

}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);