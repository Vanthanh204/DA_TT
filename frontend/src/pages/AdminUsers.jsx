import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/admin.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalComics: 0, totalChapters: 0 });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get("/admin/stats");
      setStats(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách người dùng:", err);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await API.patch(`/users/${id}/status`);
      setUsers(users.map(u => u._id === id ? { ...u, isLocked: res.data.isLocked } : u));
      alert(res.data.message);
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      alert("Lỗi khi cập nhật trạng thái!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa người dùng này?")) {
      try {
        await API.delete(`/users/${id}`);
        setUsers(users.filter(u => u._id !== id));
        fetchStats();
        alert("Xóa thành công!");
      } catch (err) {
        console.error("Lỗi xóa người dùng:", err);
        alert("Lỗi khi xóa!");
      }
    }
  };

  const handleUpdateLevel = (id, delta) => {
    setUsers(users.map(u => {
      if (u._id === id) {
        return { ...u, level: Math.max(0, (u.level || 0) + delta), isChanged: true };
      }
      return u;
    }));
  };

  const handleToggleRole = (id) => {
    setUsers(users.map(u => {
      if (u._id === id) {
        return { ...u, role: u.role === "admin" ? "user" : "admin", isChanged: true };
      }
      return u;
    }));
  };

  const handleSaveUser = async (user) => {
    try {
      await API.put(`/users/${user._id}`, { 
        level: user.level, 
        role: user.role 
      });
      setUsers(users.map(u => u._id === user._id ? { ...u, isChanged: false } : u));
      alert(`Đã lưu thay đổi cho ${user.username}!`);
    } catch (err) {
      alert("Lỗi khi lưu thay đổi!");
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">ADMIN PANEL</div>
        <nav className="sidebar-nav">
          <Link to="/admin" className="sidebar-link">
            <i className="fas fa-chart-line"></i> Tổng quan
          </Link>
          <Link to="/admin/comics" className="sidebar-link">
            <i className="fas fa-book"></i> Quản lý truyện
          </Link>
          <Link to="/admin/users" className={`sidebar-link ${location.pathname === "/admin/users" ? "active" : ""}`}>
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

      {/* Main Content */}
      <main className="admin-main">
        {/* Stats */}
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
        </div>

        <div className="admin-content-card">
          <h2>Quản lý người dùng</h2>
          
          <div className="admin-list">
            {users.map((user) => (
              <div key={user._id} className="admin-list-item">
                <div className="item-info">
                  <img 
                    src={user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                    alt="" 
                    style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} 
                  />
                  <div>
                    <div className="item-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {user.username}
                      <span style={{ fontSize: "0.7rem", padding: "2px 6px", background: user.role === "admin" ? "#9b59b6" : "#eee", color: user.role === "admin" ? "#fff" : "#666", borderRadius: "4px" }}>
                        {user.role.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#888" }}>
                      {user.email} • Level: {user.level || 0} • Đã đọc: {user.readCount || 0}
                    </div>
                  </div>
                </div>

                <div className="item-actions">
                  <div style={{ display: "flex", alignItems: "center", background: "#f0f2f5", padding: "2px 8px", borderRadius: "6px", gap: "8px", marginRight: "10px" }}>
                    <button onClick={() => handleUpdateLevel(user._id, -1)} style={{ border: "none", background: "none", cursor: "pointer", fontWeight: "bold" }}>-</button>
                    <span style={{ fontWeight: "bold", fontSize: "0.9rem" }}>Lv.{user.level || 0}</span>
                    <button onClick={() => handleUpdateLevel(user._id, 1)} style={{ border: "none", background: "none", cursor: "pointer", fontWeight: "bold" }}>+</button>
                  </div>
                  
                  <button className="btn-admin btn-info" onClick={() => handleToggleRole(user._id)}>
                    <i className="fas fa-user-tag"></i> {user.role === "admin" ? "Gỡ Admin" : "Lên Admin"}
                  </button>

                  <button 
                    className="btn-admin btn-add" 
                    disabled={!user.isChanged} 
                    onClick={() => handleSaveUser(user)}
                    style={{ opacity: user.isChanged ? 1 : 0.5, cursor: user.isChanged ? "pointer" : "not-allowed" }}
                  >
                    <i className="fas fa-save"></i> Lưu
                  </button>

                  <button className="btn-admin btn-edit" onClick={() => handleToggleStatus(user._id)}>
                    <i className={user.isLocked ? "fas fa-lock-open" : "fas fa-lock"}></i> {user.isLocked ? "Mở khóa" : "Khóa"}
                  </button>

                  <button className="btn-admin btn-delete" onClick={() => handleDelete(user._id)}>
                    <i className="fas fa-trash"></i> Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminUsers;