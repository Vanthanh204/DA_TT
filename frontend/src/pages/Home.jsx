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
      setLoading(true);
      try {
        // Lấy danh sách truyện chính
        const comicsRes = await API.get("/comics");
        if (comicsRes.data && Array.isArray(comicsRes.data)) {
          setComics(comicsRes.data);
        }

        // Lấy dữ liệu trending riêng biệt (không dùng Promise.all để tránh lỗi kéo theo)
        try {
          const trendingRes = await API.get("/comics/trending/top");
          setTrending(trendingRes.data);
        } catch (tErr) {
          console.error("Lỗi lấy trending:", tErr);
        }

        // Lấy danh sách yêu thích nếu có token
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const favRes = await API.get("/users/favorites/list");
            if (Array.isArray(favRes.data)) setFavorites(favRes.data);
          } catch (fErr) {
            console.error("Lỗi lấy yêu thích:", fErr);
          }
        }
      } catch (err) {
        console.error("Lỗi tổng thể:", err);
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
                  <ComicCard key={c._id} comic={c} />
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
                <ComicCard key={c._id} comic={c} />
              ))
            ) : (
              <p style={{ padding: "20px", color: "#666" }}>Chưa có truyện nào trong hệ thống.</p>
            )}
          </div>
        </div>

        <aside className="sidebar">
          {trending.topComics && trending.topComics.length > 0 && (
            <div className="sidebar-section">
              <h3>Top Trending</h3>
              <div className="top-list">
                {trending.topComics.map((comic, i) => (
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
          )}

          {trending.topGenre && (
            <div className="sidebar-section">
              <h3>Thể loại phổ biến</h3>
              <div className="tags">
                <span style={{ background: "#eee", color: "#333", padding: "8px 15px", borderRadius: "20px", fontWeight: "bold", display: "inline-block", fontSize: "0.85rem" }}>
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