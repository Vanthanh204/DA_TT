import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import "../styles/reading-page.css";

function ReadingPage() {
  const { chapterId } = useParams();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowNav(false);
      } else {
        setShowNav(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    // Reset cuộn trang lên đầu khi chuyển chương
    window.scrollTo(0, 0);
    
    // Lấy userId bên trong useEffect để đảm bảo lấy đúng user hiện tại
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user ? (user._id || user.id) : "guest";

    const fetchChapter = async () => {
      try {
        // GỌI API TRỰC TIẾP LẤY CHƯƠNG
        const res = await API.get(`/comics/chapter/${chapterId}`);
        const foundChapter = res.data;
        
        if (foundChapter) {
          setChapter(foundChapter);
          
          // 👉 Cập nhật danh sách lịch sử đọc tổng quát
          if (foundChapter.comicId) {
            const historyKey = `all_read_history_${userId}`;
            let historyList = JSON.parse(localStorage.getItem(historyKey)) || [];
            
            // Lấy thông tin truyện (vì API chapter hiện tại có trả về comicId nhưng có thể thiếu title/cover)
            // Để tối ưu, ta sẽ lấy thêm info truyện từ API nếu cần hoặc lưu info từ trang detail
            // Ở đây ta cứ lưu ID và Chapter trước, trang History sẽ fetch hoặc dùng info có sẵn
            const newEntry = {
              comicId: foundChapter.comicId,
              chapterId: foundChapter._id,
              chapterNumber: foundChapter.chapterNumber,
              updatedAt: new Date().toISOString()
            };

            // Loại bỏ bản ghi cũ của truyện này nếu có
            historyList = historyList.filter(item => item.comicId !== foundChapter.comicId);
            // Thêm bản ghi mới lên đầu
            historyList.unshift(newEntry);
            // Giới hạn khoảng 20 truyện gần nhất
            localStorage.setItem(historyKey, JSON.stringify(historyList.slice(0, 20)));

            // Vẫn giữ lại lịch sử riêng cho từng truyện để hiện nút "Đọc tiếp"
            localStorage.setItem(`read_history_${userId}_${foundChapter.comicId}`, JSON.stringify({ 
              chapterId: foundChapter._id, 
              chapterNumber: foundChapter.chapterNumber 
            }));
          }
        }
      } catch (err) {
        console.error("Lỗi lấy nội dung chương:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChapter();
  }, [chapterId]);

  if (loading) return <div className="loading">Đang tải nội dung...</div>;
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