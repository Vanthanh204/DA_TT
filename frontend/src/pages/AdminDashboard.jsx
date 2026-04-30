import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import API from "../services/api";
import "../styles/admin.css";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalComics: 0,
    totalChapters: 0,
    visitCount: 0,
  });
  const [dailyData, setDailyData] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, dailyRes] = await Promise.all([
          API.get("/admin/stats"),
          API.get("/admin/stats/daily")
        ]);
        setStats(statsRes.data);
        setDailyData(dailyRes.data);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu thống kê:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="admin-layout">
      {/* Sidebar bên trái */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">ADMIN PANEL</div>
        <nav className="sidebar-nav">
          <Link to="/admin" className={`sidebar-link ${location.pathname === "/admin" ? "active" : ""}`}>
            <i className="fas fa-chart-line"></i> Tổng quan
          </Link>
          <Link to="/admin/comics" className="sidebar-link">
            <i className="fas fa-book"></i> Quản lý truyện
          </Link>
          <Link to="/admin/users" className="sidebar-link">
            <i className="fas fa-users"></i> Quản lý người dùng
          </Link>
          <Link to="/admin/genres" className="sidebar-link">
            <i className="fas fa-tags"></i> Quản lý thể loại
          </Link>
          <Link to="/" className="sidebar-link" style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <i className="fas fa-home"></i> Quay lại Web
          </Link>
        </nav>
      </aside>

      {/* Nội dung bên phải */}
      <main className="admin-main">
        <h1 style={{ marginBottom: "25px" }}>Tổng quan thống kê</h1>
        
        <div className="admin-stats-overview">
          <div className="stat-card stat-blue">
            <h3>Người dùng</h3>
            <p>{stats.totalUsers}</p>
          </div>
          <div className="stat-card stat-orange">
            <h3>Bộ truyện</h3>
            <p>{stats.totalComics}</p>
          </div>
          <div className="stat-card stat-green">
            <h3>Chương truyện</h3>
            <p>{stats.totalChapters}</p>
          </div>
          <div className="stat-card" style={{ backgroundColor: "#9b59b6", color: "#fff" }}>
            <h3>Lượt truy cập</h3>
            <p>{stats.visitCount?.toLocaleString() || 0}</p>
          </div>
        </div>

        {/* Biểu đồ thống kê */}
        <div className="admin-charts-container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px", marginTop: "30px" }}>
          
          {/* Biểu đồ Lượt truy cập */}
          <div className="admin-content-card" style={{ padding: "20px" }}>
            <h3 style={{ marginBottom: "20px" }}>Lượt truy cập theo ngày (10 ngày gần nhất)</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} tickFormatter={(str) => str.split('-').slice(1).join('/')} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="visitCount" name="Lượt truy cập" stroke="#9b59b6" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Biểu đồ Cập nhật truyện/chương */}
          <div className="admin-content-card" style={{ padding: "20px" }}>
            <h3 style={{ marginBottom: "20px" }}>Truyện & Chương mới cập nhật</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} tickFormatter={(str) => str.split('-').slice(1).join('/')} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="newComics" name="Cập nhật mới" fill="#e67e22" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Ô chào mừng đã được gỡ bỏ theo yêu cầu */}
      </main>
    </div>
  );
}

export default AdminDashboard;