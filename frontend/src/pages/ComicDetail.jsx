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
  
  // States cho bình luận
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user ? (user._id || user.id) : "guest";

    const fetchData = async () => {
      try {
        // 1. Lấy chi tiết truyện
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
            try {
              const userProfile = await API.get("/users/me");
              if (userProfile.data.favorites.includes(id)) {
                setIsFavorite(true);
              }
            } catch (pErr) { console.error("Lỗi lấy profile:", pErr); }
          }
        }

        // 2. Lấy danh sách bình luận
        const commentRes = await API.get(`/comments/${id}`);
        setComments(commentRes.data);

      } catch (err) {
        console.error("Lỗi lấy dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn cần đăng nhập để bình luận!");
      navigate("/login");
      return;
    }

    if (!commentContent.trim()) return;

    setSubmitting(true);
    try {
      const res = await API.post("/comments", {
        comicId: id,
        content: commentContent
      });
      // Thêm bình luận mới vào đầu danh sách
      setComments([res.data, ...comments]);
      setCommentContent("");
    } catch (err) {
      alert("Lỗi khi đăng bình luận: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

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

  const chaptersArray = comic.chapters && Array.isArray(comic.chapters) ? comic.chapters : [];
  const sortedChapters = [...chaptersArray].sort((a, b) => a.chapterNumber - b.chapterNumber);
  
  // Xác định 3 chương mới nhất (dựa trên chapterNumber lớn nhất)
  const latest3ChapterNumbers = [...sortedChapters]
    .sort((a, b) => b.chapterNumber - a.chapterNumber)
    .slice(0, 3)
    .map(c => c.chapterNumber);

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userLevel = user ? (user.level || 0) : 0;

  const firstChapter = sortedChapters.length > 0 ? sortedChapters[0] : null;
  const latestChapter = sortedChapters.length > 0 ? sortedChapters[sortedChapters.length - 1] : null;
  const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const handleRead = (chapterId, chapterNumber) => {
    if (latest3ChapterNumbers.includes(chapterNumber) && userLevel < 1) {
      alert("Chương này hiện đang khóa. Bạn cần đạt Level 1 để đọc (Đọc đủ 10 chương bất kỳ).");
      return;
    }

    const userId = user ? (user._id || user.id) : "guest";
    localStorage.setItem(`read_history_${userId}_${id}`, JSON.stringify({ chapterId, chapterNumber }));
    navigate(`/reading/${chapterId}`);
  };

  const formatTime = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now - past;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays > 5) {
      return past.toLocaleDateString("vi-VN");
    }

    const diffInSec = Math.floor(diffInMs / 1000);
    const diffInMin = Math.floor(diffInSec / 60);
    const diffInHour = Math.floor(diffInMin / 60);

    if (diffInSec < 60) return `${diffInSec} giây trước`;
    if (diffInMin < 60) return `${diffInMin} phút trước`;
    if (diffInHour < 24) return `${diffInHour} giờ trước`;
    return `${diffInDays} ngày trước`;
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
              <button 
                className="btn-continue" 
                onClick={() => handleRead(lastRead.chapterId, lastRead.chapterNumber)}
                disabled={latest3ChapterNumbers.includes(lastRead.chapterNumber) && userLevel < 1}
                style={{ opacity: (latest3ChapterNumbers.includes(lastRead.chapterNumber) && userLevel < 1) ? 0.5 : 1 }}
              >
                Đọc tiếp (Chương {lastRead.chapterNumber})
              </button>
            )}

            {latestChapter && (
              <button 
                className="btn-latest" 
                onClick={() => handleRead(latestChapter._id, latestChapter.chapterNumber)}
                disabled={latest3ChapterNumbers.includes(latestChapter.chapterNumber) && userLevel < 1}
                style={{ opacity: (latest3ChapterNumbers.includes(latestChapter.chapterNumber) && userLevel < 1) ? 0.5 : 1 }}
              >
                {latest3ChapterNumbers.includes(latestChapter.chapterNumber) && userLevel < 1 ? "🔒 Chương mới nhất" : "Mới nhất"}
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
          <div className="chapter-list">
            <div className="chapter-list-header">
              <span>Số chương</span>
              <span>Cập nhật</span>
              <span style={{ textAlign: "right" }}>Lượt xem</span>
            </div>
            {sortedChapters.reverse().map((chap) => {
              const isLocked = latest3ChapterNumbers.includes(chap.chapterNumber) && userLevel < 1;
              return (
                <div 
                  key={chap._id} 
                  className={`chapter-list-item ${isLocked ? "locked" : ""}`} 
                  onClick={() => handleRead(chap._id, chap.chapterNumber)}
                >
                  <div className="chapter-name">
                    Chương {chap.chapterNumber}{chap.title ? `: ${chap.title}` : ""}
                    {isLocked && <i className="fas fa-lock" style={{ marginLeft: "10px", color: "#e74c3c" }}></i>}
                  </div>
                  <div className="chapter-time">{formatTime(chap.createdAt)}</div>
                  <div className="chapter-views">{chap.views?.toLocaleString() || 0}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="no-chapters">Truyện hiện chưa có chương nào.</p>
        )}
      </div>

      {/* PHẦN BÌNH LUẬN */}
      <div className="comment-section">
        <h2>Bình luận ({comments.length})</h2>
        
        <form className="comment-form" onSubmit={handlePostComment}>
          <textarea 
            placeholder="Viết bình luận của bạn..." 
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            required
          />
          <button type="submit" disabled={submitting}>
            {submitting ? "Đang gửi..." : "Gửi bình luận"}
          </button>
        </form>

        <div className="comment-list">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id} className="comment-item">
                <img 
                  src={comment.user?.avatar || DEFAULT_AVATAR} 
                  alt={comment.user?.username} 
                  className="comment-avatar"
                  onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                />
                <div className="comment-body">
                  <div className="comment-user-info">
                    <span className="comment-username">{comment.user?.username || "Người dùng ẩn danh"}</span>
                    <span className="comment-date">{new Date(comment.createdAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                  <p className="comment-content">{comment.content}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="no-comments">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ComicDetail;