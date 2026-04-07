const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Comic = require("./models/comic");
const Chapter = require("./models/chapter");

const seedData = async () => {
  await connectDB();

  // Xóa trắng dữ liệu cũ để nạp mới (Cẩn thận!)
  await Comic.deleteMany({});
  await Chapter.deleteMany({});

  // 1. Tạo bộ truyện Solo Leveling
  const soloLeveling = await Comic.create({
    title: "Solo Leveling",
    description: "Câu chuyện về Sung Jin-Woo, từ thợ săn yếu nhất trở thành chúa tể bóng tối.",
    coverImage: "https://st.ntcdntempv3.com/data/comics/149/solo-leveling.jpg",
    author: "Chu-Gong",
    status: "Hoàn thành",
    genres: ["Action", "Adventure", "Fantasy"]
  });

  // 2. Tạo bộ truyện One Piece
  const onePiece = await Comic.create({
    title: "One Piece",
    description: "Cuộc hành trình của Luffy để trở thành Vua Hải Tặc.",
    coverImage: "https://st.ntcdntempv3.com/data/comics/1/one-piece.jpg",
    author: "Eiichiro Oda",
    status: "Đang tiến hành",
    genres: ["Action", "Adventure", "Comedy"]
  });

  // 3. Tạo một vài chương mẫu cho Solo Leveling
  const chapter1 = await Chapter.create({
    comicId: soloLeveling._id,
    chapterNumber: 1,
    title: "Chương 1: Sự khởi đầu",
    pages: [
      "https://res.cloudinary.com/demo/image/upload/sample.jpg", 
      "https://res.cloudinary.com/demo/image/upload/sample.jpg"
    ]
  });

  // Gán ID của chương vào bộ truyện
  soloLeveling.chapters.push(chapter1._id);
  await soloLeveling.save();

  console.log("✅ Đã nạp xong 2 bộ truyện mẫu!");
  process.exit();
};

seedData();