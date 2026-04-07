const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json("Token không hợp lệ!");
      req.user = user;
      next();
    });
  } else {
    res.status(401).json("Bạn chưa đăng nhập!");
  }
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "admin") {
      next();
    } else {
      res.status(403).json("Bạn không có quyền truy cập chức năng này!");
    }
  });
};

module.exports = { verifyToken, verifyAdmin };