import { Link } from "react-router-dom";
import "../styles/home.css";

function ComicCard({ comic }) {
  // Sắp xếp lấy 2 chương mới nhất
  const sortedChapters = comic.chapters && Array.isArray(comic.chapters) 
    ? [...comic.chapters].sort((a, b) => b.chapterNumber - a.chapterNumber).slice(0, 2)
    : [];

  const formatTimeShort = (dateString) => {
    if (!dateString) return "";
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now - past;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays > 0) return `${diffInDays} ngày trước`;
    
    const diffInHour = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHour > 0) return `${diffInHour} giờ trước`;
    
    const diffInMin = Math.floor(diffInMs / (1000 * 60));
    return `${diffInMin || 0} phút trước`;
  };

  return (
    <Link to={`/comic/${comic._id}`} className="comic-card-link">
      <div className="comic-card">
        <div className="comic-image">
          <img src={comic.coverImage} alt={comic.title} />
        </div>
        <div className="comic-info">
          <h3 className="comic-title">{comic.title}</h3>
          <div className="latest-chapters">
            {sortedChapters.length > 0 ? (
              sortedChapters.map((chap) => (
                <div key={chap._id} className="latest-chapter-item">
                  <span className="chap-num">Chương {chap.chapterNumber}</span>
                  <span className="chap-time">{formatTimeShort(chap.createdAt)}</span>
                </div>
              ))
            ) : (
              <p className="no-chap">Chưa có chương</p>
            )}
          </div>
          <div className="comic-meta">
             <span className="view-count">
              <i className="fas fa-eye"></i> {comic.views?.toLocaleString() || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ComicCard;