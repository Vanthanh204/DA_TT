import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ComicCard from "../components/ComicCard";
import API from "../services/api";
import "../styles/home.css";

function Home() {
  const [comics, setComics] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [trending, setTrending] = useState({ topComics: [], topGenre: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [comicsRes, trendingRes] = await Promise.all([
          API.get("/comics"),
          API.get("/comics/trending/top")
        ]);
        
        // Đảm bảo lấy đúng mảng truyện từ API
        setComics(Array.isArray(comicsRes.data) ? comicsRes.data : []);
        setTrending(trendingRes.data);

        const token = localStorage.getItem("token");
        if (token) {
          const favRes = await API.get("/users/favorites/list");
          setFavorites(Array.isArray(favRes.data) ? favRes.data : []);
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading">Đang tải truyện...</div>;

  return (
    <div className="home-container">
      <div className="banner">
        <div className="banner-content">
          <h1>Đọc truyện Online miễn phí</h1>
          <p>Hàng ngàn bộ truyện hấp dẫn đang chờ đón bạn!</p>
          <button className="btn-explore">Khám phá ngay</button>
        </div>
      </div>

      <div className="main-content">
        <div className="comic-section">
          {/* TRUYỆN YÊU THÍCH */}
          {favorites.length > 0 && (
            <div className="favorites-section" style={{marginBottom: "40px"}}>
              <div className="section-header">
                <h2 style={{color: "#e74c3c"}}><i className="fas fa-heart"></i> Truyện bạn yêu thích</h2>
              </div>
              <div className="comic-grid">
                {favorites.map((c) => (
                  <ComicCard 
                    key={c._id} 
                    comic={{
                      ...c,
                      image: c.coverImage,
                      chapter: c.chapters?.length || 0
                    }} 
                  />
                ))}
              </div>
              <hr style={{border: "none", borderBottom: "1px solid #eee", margin: "30px 0"}} />
            </div>
          )}

          <div className="section-header">
            <h2>Mới cập nhật</h2>
            <span className="view-all">Xem tất cả</span>
          </div>
          <div className="comic-grid">
            {comics.length > 0 ? (
              comics.map((c) => (
                <ComicCard 
                  key={c._id} 
                  comic={{
                    ...c,
                    image: c.coverImage,
                    chapter: c.chapters?.length || 0
                  }} 
                />
              ))
            ) : (
              <p>Chưa có truyện nào trong hệ thống.</p>
            )}
          </div>
        </div>

        <aside className="sidebar">
          <div className="sidebar-section">
            <h3>Top Trending</h3>
            <div className="top-list">
              {trending.topComics && trending.topComics.map((comic, i) => (
                <Link to={`/comic/${comic._id}`} key={comic._id} className="trending-sidebar-item" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px", textDecoration: "none", color: "inherit" }}>
                  <span className="rank" style={{ fontSize: "1.2rem", fontWeight: "bold", color: i === 0 ? "#f1c40f" : "#95a5a6", width: "25px" }}>{i + 1}</span>
                  <img src={comic.coverImage} alt="" style={{ width: "45px", height: "60px", objectFit: "cover", borderRadius: "4px" }} />
                  <div>
                    <h4 style={{ margin: 0, fontSize: "0.9rem" }}>{comic.title}</h4>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#7f8c8d" }}>{comic.views?.toLocaleString() || 0} lượt xem</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {trending.topGenre && (
            <div className="sidebar-section">
              <h3>Thể loại phổ biến</h3>
              <div className="tags">
                <span style={{ background: "#eee", color: "#333", padding: "8px 15px", borderRadius: "20px", fontWeight: "bold", display: "inline-block" }}>
                  {trending.topGenre.toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default Home;