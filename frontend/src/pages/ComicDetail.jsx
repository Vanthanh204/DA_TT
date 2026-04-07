import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/comic-detail.css";

function ComicDetail() {
  const { id } = useParams();
  const [comic, setComic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRead, setLastRead] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user ? (user._id || user.id) : "guest";

    const fetchComic = async () => {
      try {
        const res = await API.get(`/comics/${id}`);
        if (res.data) {
          setComic(res.data);
          
          // Kiểm tra lịch sử đọc
          const savedRead = JSON.parse(localStorage.getItem(`read_history_${userId}_${id}`));
          if (savedRead) {
            setLastRead(savedRead);
          }

          // Kiểm tra xem user có yêu thích truyện này chưa
          if (user) {
            const userProfile = await API.get("/users/me");
            if (userProfile.data.favorites.includes(id)) {
              setIsFavorite(true);
            }
          }
        }
      } catch (err) {
        console.error("Lỗi lấy chi tiết truyện:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComic();
  }, [id]);

  const toggleFavorite = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn cần đăng nhập để thực hiện chức năng này!");
      navigate("/login");
      return;
    }
    try {
      const res = await API.post(`/users/favorite/${id}`);
      setIsFavorite(res.data.isFavorite);
    } catch (err) {
      console.error("Lỗi toggle yêu thích:", err);
    }
  };

  if (loading) return <div className="loading-container">Đang tải thông tin truyện...</div>;
  if (!comic) return <div className="error-container">Không tìm thấy truyện!</div>;

  // Kiểm tra an toàn trước khi map chapters
  const chaptersArray = comic.chapters && Array.isArray(comic.chapters) ? comic.chapters : [];
  const sortedChapters = [...chaptersArray].sort((a, b) => a.chapterNumber - b.chapterNumber);
  
  const firstChapter = sortedChapters.length > 0 ? sortedChapters[0] : null;
  const latestChapter = sortedChapters.length > 0 ? sortedChapters[sortedChapters.length - 1] : null;

  const handleRead = (chapterId, chapterNumber) => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user ? (user._id || user.id) : "guest";

    localStorage.setItem(`read_history_${userId}_${id}`, JSON.stringify({ chapterId, chapterNumber }));
    navigate(`/reading/${chapterId}`);
  };

  return (
    <div className="comic-detail-container">
      <div className="comic-info-header">
        <img src={comic.coverImage} alt={comic.title} className="comic-cover-large" />
        <div className="comic-text-info">
          <h1>{comic.title}</h1>
          <p><strong>Tác giả:</strong> {comic.author || "Đang cập nhật"}</p>
          <p><strong>Thể loại:</strong> {comic.genres && comic.genres.length > 0 ? comic.genres.map(g => g.name).join(", ") : "Đang cập nhật"}</p>
          <p><strong>Trạng thái:</strong> {comic.status}</p>
          <div className="comic-desc">{comic.description || "Chưa có mô tả cho truyện này."}</div>
          
          <div className="read-actions">
            {firstChapter && (
              <button className="btn-read" onClick={() => handleRead(firstChapter._id, firstChapter.chapterNumber)}>
                Đọc từ đầu
              </button>
            )}
            
            {lastRead && (
              <button className="btn-continue" onClick={() => handleRead(lastRead.chapterId, lastRead.chapterNumber)}>
                Đọc tiếp (Chương {lastRead.chapterNumber})
              </button>
            )}

            {latestChapter && (
              <button className="btn-latest" onClick={() => handleRead(latestChapter._id, latestChapter.chapterNumber)}>
                Mới nhất
              </button>
            )}

            <button 
              className={`btn-favorite ${isFavorite ? "active" : ""}`} 
              onClick={toggleFavorite}
            >
              <i className={isFavorite ? "fas fa-heart" : "far fa-heart"}></i>
              {isFavorite ? " Đã yêu thích" : " Yêu thích"}
            </button>
          </div>
        </div>
      </div>

      <div className="chapter-list-section">
        <h2>Danh sách chương ({sortedChapters.length})</h2>
        {sortedChapters.length > 0 ? (
          <div className="chapter-grid">
            {sortedChapters.map((chap) => (
              <div key={chap._id} className="chapter-item" onClick={() => handleRead(chap._id, chap.chapterNumber)}>
                Chương {chap.chapterNumber}: {chap.title || `Chapter ${chap.chapterNumber}`}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-chapters">Truyện hiện chưa có chương nào.</p>
        )}
      </div>
    </div>
  );
}

export default ComicDetail;