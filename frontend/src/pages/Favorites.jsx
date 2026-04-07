import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import ComicCard from "../components/ComicCard";
import "../styles/home.css";

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await API.get("/users/favorites/list");
        setFavorites(res.data);
      } catch (err) {
        console.error("Lỗi lấy danh sách yêu thích:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  return (
    <div className="home-container">
      <h2 className="section-title">
        <i className="fas fa-heart" style={{color: '#e74c3c'}}></i> Truyện đã yêu thích
      </h2>

      {loading ? (
        <div className="loading">Đang tải danh sách...</div>
      ) : favorites.length > 0 ? (
        <div className="comic-grid">
          {favorites.map((comic) => (
            <ComicCard 
              key={comic._id} 
              comic={{
                ...comic,
                image: comic.coverImage,
                chapter: comic.chapters?.length || 0
              }} 
            />
          ))}
        </div>
      ) : (
        <div className="no-results" style={{textAlign: 'center', padding: '50px'}}>
          <p>Bạn chưa yêu thích bộ truyện nào.</p>
          <Link to="/" style={{color: '#3498db', textDecoration: 'none'}}>Khám phá thêm truyện mới</Link>
        </div>
      )}
    </div>
  );
}

export default Favorites;