import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import API from "../services/api";
import "../styles/admin.css";

function AdminGenres() {
  const [genres, setGenres] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalComics: 0, totalChapters: 0 });
  const [newGenre, setNewGenre] = useState({ name: "", description: "" });
  const [editingGenre, setEditingGenre] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetchGenres();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get("/admin/stats");
      setStats(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchGenres = async () => {
    try {
      const res = await API.get("/genres");
      setGenres(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách thể loại:", err);
    }
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    if (!newGenre.name.trim()) return;
    try {
      if (editingGenre) {
        const res = await API.put(`/genres/${editingGenre._id}`, newGenre);
        setGenres(genres.map(g => g._id === editingGenre._id ? res.data : g));
        alert("Cập nhật thể loại thành công!");
      } else {
        const res = await API.post("/genres", newGenre);
        setGenres([...genres, res.data].sort((a, b) => a.name.localeCompare(b.name)));
        alert("Thêm thể loại thành công!");
      }
      setNewGenre({ name: "", description: "" });
      setEditingGenre(null);
      setShowAddForm(false);
      fetchStats();
    } catch (err) {
      alert("Lỗi khi xử lý!");
    }
  };

  const handleEdit = (genre) => {
    setEditingGenre(genre);
    setNewGenre({ name: genre.name, description: genre.description || "" });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa thể loại này?")) {
      try {
        await API.delete(`/genres/${id}`);
        setGenres(genres.filter((g) => g._id !== id));
        fetchStats();
        alert("Xóa thành công!");
      } catch (err) {
        alert("Lỗi khi xóa!");
      }
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
          <Link to="/admin/users" className="sidebar-link">
            <i className="fas fa-users"></i> Quản lý người dùng
          </Link>
          <Link to="/admin/genres" className={`sidebar-link ${location.pathname === "/admin/genres" ? "active" : ""}`}>
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ margin: 0 }}>Quản lý thể loại</h2>
            <button className="btn-admin btn-add" onClick={() => { setShowAddForm(!showAddForm); setEditingGenre(null); setNewGenre({name:"", description:""}); }}>
              <i className="fas fa-plus"></i> {showAddForm ? "Đóng Form" : "Thêm thể loại"}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddOrUpdate} className="admin-form-group" style={{ background: "#f9f9f9", padding: "20px", borderRadius: "8px", marginBottom: "30px" }}>
              <h3>{editingGenre ? "Sửa thể loại" : "Thêm thể loại mới"}</h3>
              <input 
                className="admin-input"
                type="text" 
                placeholder="Tên thể loại..." 
                value={newGenre.name}
                onChange={(e) => setNewGenre({...newGenre, name: e.target.value})}
                required
              />
              <textarea 
                className="admin-input"
                style={{ marginTop: "15px", minHeight: "80px" }}
                placeholder="Mô tả thể loại..." 
                value={newGenre.description}
                onChange={(e) => setNewGenre({...newGenre, description: e.target.value})}
              />
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button type="submit" className="btn-admin btn-add" style={{ flex: 1, justifyContent: "center", padding: "12px" }}>
                  {editingGenre ? "CẬP NHẬT" : "LƯU THỂ LOẠI"}
                </button>
                {editingGenre && (
                  <button type="button" className="btn-admin btn-delete" onClick={() => { setEditingGenre(null); setShowAddForm(false); }} style={{ flex: 1, justifyContent: "center" }}>
                    HỦY
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="admin-list">
            {genres.map((genre) => (
              <div key={genre._id} className="admin-list-item">
                <div className="item-info">
                  <div>
                    <div className="item-title">{genre.name}</div>
                    <div style={{ fontSize: "0.85rem", color: "#888" }}>{genre.description || "Không có mô tả"}</div>
                  </div>
                </div>
                <div className="item-actions">
                  <button className="btn-admin btn-edit" onClick={() => handleEdit(genre)}>
                    <i className="fas fa-edit"></i> Sửa
                  </button>
                  <button className="btn-admin btn-delete" onClick={() => handleDelete(genre._id)}>
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

export default AdminGenres;