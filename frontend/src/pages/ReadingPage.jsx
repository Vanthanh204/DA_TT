import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import "../styles/reading-page.css";

function ReadingPage() {
  const { chapterId } = useParams();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Thêm state error
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    // ... (phần scroll giữ nguyên)
  }, [lastScrollY]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setError(null); // Reset lỗi mỗi lần chuyển chương

    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user ? (user._id || user.id) : "guest";

    const fetchChapter = async () => {
      try {
        const res = await API.get(`/comics/chapter/${chapterId}`);
        const foundChapter = res.data;
        
        if (foundChapter) {
          setChapter(foundChapter);
          
          // Kiểm tra xem có thông báo level up từ backend không
          if (user && foundChapter.currentLevel > user.level) {
            alert("🎉 Chúc mừng! Bạn đã đạt Level 1 và mở khóa toàn bộ chương truyện!");
            const updatedUser = { ...user, level: foundChapter.currentLevel, readCount: foundChapter.readCount };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            // Reload nhẹ để Navbar cập nhật (hoặc dùng context nếu có)
            window.dispatchEvent(new Event("storage")); 
          }

          // Cập nhật lịch sử đọc (giữ nguyên logic cũ)
          if (foundChapter.comicId) {
            const historyKey = `all_read_history_${userId}`;
            let historyList = JSON.parse(localStorage.getItem(historyKey)) || [];
            const newEntry = {
              comicId: foundChapter.comicId,
              chapterId: foundChapter._id,
              chapterNumber: foundChapter.chapterNumber,
              updatedAt: new Date().toISOString()
            };
            historyList = historyList.filter(item => item.comicId !== foundChapter.comicId);
            historyList.unshift(newEntry);
            localStorage.setItem(historyKey, JSON.stringify(historyList.slice(0, 20)));

            localStorage.setItem(`read_history_${userId}_${foundChapter.comicId}`, JSON.stringify({ 
              chapterId: foundChapter._id, 
              chapterNumber: foundChapter.chapterNumber 
            }));
          }
        }
      } catch (err) {
        console.error("Lỗi lấy nội dung chương:", err);
        if (err.response?.status === 403) {
          setError(err.response.data.message || "Chương này hiện đang bị khóa!");
        } else {
          setError("Không tìm thấy nội dung chương!");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchChapter();
  }, [chapterId]);

  if (loading) return <div className="loading">Đang tải nội dung...</div>;
  
  if (error) return (
    <div className="error" style={{ padding: "100px 20px", textAlign: "center" }}>
      <h2 style={{ color: "#e74c3c", marginBottom: "20px" }}>🔒 {error}</h2>
      <Link to="/" style={{ color: "#3498db", textDecoration: "underline" }}>Quay lại trang chủ</Link>
      <br /><br />
      <button onClick={() => window.history.back()} style={{ padding: "10px 20px", background: "#eee", border: "none", borderRadius: "5px", cursor: "pointer" }}>Quay lại</button>
    </div>
  );

  if (!chapter) return (
    <div className="error">
      Không tìm thấy nội dung chương! 
      <br /><Link to="/">Quay lại trang chủ</Link>
    </div>
  );

  return (
    <div className="reading-container">
      <div className={`reading-header ${showNav ? "visible" : "hidden"}`}>
        <div className="nav-top">
          <Link to={`/comic/${chapter.comicId || ""}`} className="back-link">← Quay lại truyện</Link>
          <h2>Chương {chapter.chapterNumber}: {chapter.title || "Không có tiêu đề"}</h2>
        </div>
        <div className="chapter-nav">
          {chapter.prevChapterId ? (
            <Link to={`/reading/${chapter.prevChapterId}`} className="nav-btn">Chương trước</Link>
          ) : (
            <button className="nav-btn disabled" disabled>Chương trước</button>
          )}
          
          {chapter.nextChapterId ? (
            <Link to={`/reading/${chapter.nextChapterId}`} className="nav-btn">Chương sau</Link>
          ) : (
            <button className="nav-btn disabled" disabled>Chương sau</button>
          )}
        </div>
      </div>

      <div className="pages-list">
        {chapter.pages && chapter.pages.map((url, index) => (
          <img key={index} src={url} alt={`Trang ${index + 1}`} className="reading-page-img" loading="lazy" />
        ))}
      </div>

      <div className="reading-footer">
         <p>Đã hết chương {chapter.chapterNumber}</p>
         <div className="footer-nav">
          {chapter.prevChapterId && (
            <Link to={`/reading/${chapter.prevChapterId}`} className="nav-btn">← Chương trước</Link>
          )}
          <Link to={`/comic/${chapter.comicId || ""}`} className="nav-btn">Danh sách chương</Link>
          {chapter.nextChapterId && (
            <Link to={`/reading/${chapter.nextChapterId}`} className="nav-btn">Chương sau →</Link>
          )}
         </div>
      </div>
    </div>
  );
}

export default ReadingPage;