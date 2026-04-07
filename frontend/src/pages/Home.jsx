import { useState, useEffect } from "react";
import ComicCard from "../components/ComicCard";
import API from "../services/api";
import "../styles/home.css";

function Home() {
  const [comics, setComics] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/comics");
        setComics(res.data);

        const token = localStorage.getItem("token");
        if (token) {
          const favRes = await API.get("/users/favorites/list");
          setFavorites(favRes.data);
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const topComics = ["Solo Leveling", "One Piece", "Jujutsu Kaisen"];

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
              <p>Chưa có truyện nào trong database.</p>
            )}
          </div>
        </div>

        <aside className="sidebar">
          <div className="sidebar-section">
            <h3>Top Trending</h3>
            <ul className="top-list">
              {topComics.map((title, i) => (
                <li key={i}>
                  <span className="rank">{i + 1}</span>
                  <span className="top-title">{title}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-section">
            <h3>Thể loại phổ biến</h3>
            <div className="tags">
              <span>Action</span>
              <span>Adventure</span>
              <span>Fantasy</span>
              <span>Comedy</span>
              <span>Horror</span>
              <span>Romance</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Home;