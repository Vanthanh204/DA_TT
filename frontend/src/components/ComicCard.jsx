import { Link } from "react-router-dom";
import "../styles/home.css";

function ComicCard({ comic }) {
  const latestChapter = comic.chapters?.length > 0 
    ? Math.max(...comic.chapters.map(c => c.chapterNumber)) 
    : 0;

  return (
    <Link to={`/comic/${comic._id}`} className="comic-card">
      <div className="comic-image">
        <img src={comic.coverImage} alt={comic.title} />
        {latestChapter > 0 && <span className="chapter-badge">Ch. {latestChapter}</span>}
      </div>
      <div className="comic-info">
        <h3 className="comic-title">{comic.title}</h3>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p className="comic-status">{comic.status || "Đang cập nhật"}</p>
          <span style={{ fontSize: "0.8rem", color: "#7f8c8d" }}>
            <i className="fas fa-eye"></i> {comic.views?.toLocaleString() || 0}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default ComicCard;