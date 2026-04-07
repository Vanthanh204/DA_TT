import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "../styles/admin.css";
import "../styles/profile.css"; // Dùng chung glass-card

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalComics: 0,
    totalChapters: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/admin/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Lỗi lấy thống kê:", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="profile-container"> {/* Dùng container tối chung */}
      <div className="admin-header">
        <h1>Bảng Quản Trị</h1>
        <p style={{color: '#adaaaa'}}>Chào mừng trở lại, Admin. Hệ thống đang hoạt động ổn định.</p>
      </div>

      {/* Thống kê hệ thống */}
      <section className="stats-grid">
        <div className="glass-card stat-item">
          <span className="stat-value">{stats.totalUsers}</span>
          <span className="stat-label">Người dùng</span>
        </div>
        <div className="glass-card stat-item">
          <span className="stat-value">{stats.totalComics}</span>
          <span className="stat-label">Bộ truyện</span>
        </div>
        <div className="glass-card stat-item">
          <span className="stat-value">{stats.totalChapters}</span>
          <span className="stat-label">Chương truyện</span>
        </div>
      </section>

      {/* Các hành động quản trị */}
      <h2 className="section-title">Công cụ quản lý</h2>
      <div className="admin-actions">
        <Link to="/admin/comics" className="glass-card action-card">
          <i className="fas fa-book action-icon"></i>
          <h3>Quản lý truyện</h3>
          <p>Thêm, sửa, xóa các bộ truyện và chương.</p>
        </Link>
        <Link to="/admin/users" className="glass-card action-card">
          <i className="fas fa-users action-icon"></i>
          <h3>Quản lý người dùng</h3>
          <p>Phân quyền và quản lý tài khoản thành viên.</p>
        </Link>
        <Link to="/admin/genres" className="glass-card action-card">
          <i className="fas fa-tags action-icon"></i>
          <h3>Quản lý thể loại</h3>
          <p>Chỉnh sửa các danh mục thể loại truyện.</p>
        </Link>
      </div>
    </div>
  );
}

export default AdminDashboard;