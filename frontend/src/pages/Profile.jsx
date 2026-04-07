import { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/profile.css";

function Profile({ user: propUser }) {
  const [user, setUser] = useState(propUser);
  const [stats, setStats] = useState({
    following: 0,
    read: 12,
    comments: 0,
    favorites: 5
  });

  useEffect(() => {
    if (!propUser) {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } else {
      setUser(propUser);
    }
  }, [propUser]);

  if (!user) return <div className="profile-container"><div className="glass-card">Đang xác thực tài khoản...</div></div>;

  return (
    <div className="profile-container">
      {/* Profile Header Section */}
      <section className="profile-header">
        <div className="avatar-group">
          <img 
            src={user.avatar || "https://via.placeholder.com/180"} 
            alt="Avatar" 
            className="avatar-large"
          />
          <div className="level-badge">LEVEL {user.level || 0}</div>
        </div>
        <div className="user-info-main">
          <h1>{user.username}</h1>
          <div className="tag-group">
            <span className="tag">{user.role === "admin" ? "Quản trị viên" : "Thành viên"}</span>
            <span className="tag">Hội viên từ 2024</span>
          </div>
        </div>
      </section>

      {/* Stats Bento Grid */}
      <section className="stats-grid">
        <div className="glass-card stat-item">
          <span className="stat-value">{stats.following}</span>
          <span className="stat-label">Theo dõi</span>
        </div>
        <div className="glass-card stat-item">
          <span className="stat-value">{stats.read}</span>
          <span className="stat-label">Đã đọc</span>
        </div>
        <div className="glass-card stat-item">
          <span className="stat-value">{stats.comments}</span>
          <span className="stat-label">Bình luận</span>
        </div>
        <div className="glass-card stat-item">
          <span className="stat-value">{stats.favorites}</span>
          <span className="stat-label">Yêu thích</span>
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="dashboard-sections">
        <section className="glass-card">
          <h2 className="section-title">Truyện đang đọc</h2>
          <div className="manga-list">
            {/* Đây là ví dụ mẫu, bạn có thể map từ dữ liệu thật */}
            <div className="manga-mini-card">
              <img src="https://via.placeholder.com/60x85" alt="" className="manga-mini-img" />
              <div style={{flex: 1}}>
                <h4 style={{margin: 0}}>Solo Leveling</h4>
                <p style={{fontSize: '0.8rem', color: '#adaaaa', margin: '5px 0'}}>Chương 156 • 2 ngày trước</p>
                <div className="progress-container">
                  <div className="progress-fill" style={{width: '75%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-card">
          <h2 className="section-title">Thể loại yêu thích</h2>
          <div className="genre-tags">
            <span className="tag">Action</span>
            <span className="tag">Fantasy</span>
            <span className="tag">Adventure</span>
            <span className="tag">Seinen</span>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Profile;