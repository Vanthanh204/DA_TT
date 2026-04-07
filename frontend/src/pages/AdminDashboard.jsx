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
    <div className="admin-dashboard" style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto", backgroundColor: "#f9f9f9", minHeight: "80vh" }}>
      <h1 style={{ marginBottom: "30px", color: "#2c3e50" }}>Bảng Quản Trị</h1>
      
      <div className="stats-container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        <div style={{ padding: "25px", background: "#3498db", color: "#fff", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "1rem", textTransform: "uppercase", opacity: 0.8 }}>Người dùng</h3>
          <p style={{ fontSize: "2.5rem", margin: 0, fontWeight: "bold" }}>{stats.totalUsers}</p>
        </div>
        <div style={{ padding: "25px", background: "#e67e22", color: "#fff", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "1rem", textTransform: "uppercase", opacity: 0.8 }}>Bộ truyện</h3>
          <p style={{ fontSize: "2.5rem", margin: 0, fontWeight: "bold" }}>{stats.totalComics}</p>
        </div>
        <div style={{ padding: "25px", background: "#27ae60", color: "#fff", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "1rem", textTransform: "uppercase", opacity: 0.8 }}>Chương truyện</h3>
          <p style={{ fontSize: "2.5rem", margin: 0, fontWeight: "bold" }}>{stats.totalChapters}</p>
        </div>
      </div>

      <h2 style={{ marginBottom: "20px", color: "#34495e" }}>Quản lý dữ liệu</h2>
      <div className="admin-actions" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
        <Link to="/admin/comics" style={{ padding: "30px", background: "#fff", textDecoration: "none", color: "#333", borderRadius: "10px", textAlign: "center", border: "1px solid #ddd", transition: "0.3s" }}>
          <i className="fas fa-book" style={{ fontSize: "2rem", display: "block", marginBottom: "15px", color: "#3498db" }}></i>
          <strong>Quản lý truyện</strong>
        </Link>
        <Link to="/admin/users" style={{ padding: "30px", background: "#fff", textDecoration: "none", color: "#333", borderRadius: "10px", textAlign: "center", border: "1px solid #ddd", transition: "0.3s" }}>
          <i className="fas fa-users" style={{ fontSize: "2rem", display: "block", marginBottom: "15px", color: "#e67e22" }}></i>
          <strong>Quản lý người dùng</strong>
        </Link>
        <Link to="/admin/genres" style={{ padding: "30px", background: "#fff", textDecoration: "none", color: "#333", borderRadius: "10px", textAlign: "center", border: "1px solid #ddd", transition: "0.3s" }}>
          <i className="fas fa-tags" style={{ fontSize: "2rem", display: "block", marginBottom: "15px", color: "#27ae60" }}></i>
          <strong>Quản lý thể loại</strong>
        </Link>
      </div>
    </div>
  );
}

export default AdminDashboard;