const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "comic_web", 
    format: async (req, file) => "jpg", // Tự động chuyển mọi thứ sang jpg để đảm bảo Android gửi gì cũng nhận được
    public_id: (req, file) => Date.now() + "-" + file.originalname.split('.')[0],
  },
});

const uploadCloud = multer({ storage });

module.exports = uploadCloud;