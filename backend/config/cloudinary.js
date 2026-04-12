const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const crypto = require("crypto");
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
    format: async (req, file) => "jpg",
    // Tạo tên file duy nhất bằng hash để tránh trùng lặp khi up nhiều ảnh nhanh
    public_id: (req, file) => {
        const uniqueSuffix = crypto.randomBytes(4).toString('hex');
        const originalName = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
        return `${Date.now()}-${uniqueSuffix}-${originalName}`;
    },
    // Tối ưu hóa tốc độ xử lý trên Cloudinary
    transformation: [{ quality: "auto", fetch_format: "auto" }]
  },
});

const uploadCloud = multer({ 
    storage,
    limits: { fileSize: 20 * 1024 * 1024 } // Tăng lên 20MB
});

module.exports = { uploadCloud, cloudinary };