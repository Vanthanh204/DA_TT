import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

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
    <div className="admin-dashboard" style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Bảng Quản Trị</h1>
      
      <div className="stats-container" style={{ display: "flex", gap: "20px", marginBottom: "40px" }}>
        <div style={{ flex: 1, padding: "20px", background: "#3498db", color: "#fff", borderRadius: "10px" }}>
          <h3>Người dùng</h3>
          <p style={{ fontSize: "2rem", margin: 0 }}>{stats.totalUsers}</p>
        </div>
        <div style={{ flex: 1, padding: "20px", background: "#e67e22", color: "#fff", borderRadius: "10px" }}>
          <h3>Bộ truyện</h3>
          <p style={{ fontSize: "2rem", margin: 0 }}>{stats.totalComics}</p>
        </div>
        <div style={{ flex: 1, padding: "20px", background: "#27ae60", color: "#fff", borderRadius: "10px" }}>
          <h3>Chương truyện</h3>
          <p style={{ fontSize: "2rem", margin: 0 }}>{stats.totalChapters}</p>
        </div>
      </div>

      <div className="admin-actions" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
        <Link to="/admin/comics" style={{ padding: "20px", background: "#eee", textDecoration: "none", color: "#333", borderRadius: "8px", textAlign: "center" }}>
          Quản lý truyện
        </Link>
        <Link to="/admin/users" style={{ padding: "20px", background: "#eee", textDecoration: "none", color: "#333", borderRadius: "8px", textAlign: "center" }}>
          Quản lý người dùng
        </Link>
        <Link to="/admin/genres" style={{ padding: "20px", background: "#eee", textDecoration: "none", color: "#333", borderRadius: "8px", textAlign: "center" }}>
          Quản lý thể loại
        </Link>
      </div>
    </div>
  );
}

export default AdminDashboard;