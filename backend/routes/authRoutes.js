const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user.js");


// 👉 REGISTER USER
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, birthDate } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      birthDate: birthDate || null
    });

    await user.save();
    res.json({ message: "Đăng ký thành công" });

  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: messages[0] });
    }
    res.status(500).json({ message: "Lỗi hệ thống khi đăng ký" });
  }
});


// 👉 LOGIN (USER + ADMIN)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Sai email" });
    }

    if (user.isLocked) {
      return res.status(403).json({ message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Sai mật khẩu" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        level: user.level
      }
    });

  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;