import { useEffect, useState } from "react";
import API from "../services/api";

function AdminGenres() {
  const [genres, setGenres] = useState([]);
  const [newGenre, setNewGenre] = useState({ name: "", description: "" });
  const [editingGenre, setEditingGenre] = useState(null);

  useEffect(() => {
    fetchGenres();
  }, []);

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
    } catch (err) {
      alert("Lỗi khi xử lý!");
    }
  };

  const handleEdit = (genre) => {
    setEditingGenre(genre);
    setNewGenre({ name: genre.name, description: genre.description || "" });
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa thể loại này?")) {
      try {
        await API.delete(`/genres/${id}`);
        setGenres(genres.filter((g) => g._id !== id));
        alert("Xóa thành công!");
      } catch (err) {
        alert("Lỗi khi xóa!");
      }
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Quản lý thể loại</h1>
      
      <form onSubmit={handleAddOrUpdate} style={{ marginBottom: "30px", display: "flex", flexDirection: "column", gap: "10px", background: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #ddd" }}>
        <h3>{editingGenre ? "Sửa thể loại" : "Thêm thể loại mới"}</h3>
        <input 
          type="text" 
          placeholder="Tên thể loại..." 
          value={newGenre.name}
          onChange={(e) => setNewGenre({...newGenre, name: e.target.value})}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ddd" }}
          required
        />
        <textarea 
          placeholder="Mô tả thể loại..." 
          value={newGenre.description}
          onChange={(e) => setNewGenre({...newGenre, description: e.target.value})}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ddd", minHeight: "80px" }}
        />
        <div style={{ display: "flex", gap: "10px" }}>
          <button type="submit" style={{ flex: 1, padding: "10px", backgroundColor: "#27ae60", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
            {editingGenre ? "Cập nhật" : "Lưu thể loại"}
          </button>
          {editingGenre && (
            <button type="button" onClick={() => { setEditingGenre(null); setNewGenre({ name: "", description: "" }); }} style={{ flex: 1, padding: "10px", backgroundColor: "#7f8c8d", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
              Hủy
            </button>
          )}
        </div>
      </form>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f4f4f4" }}>
            <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Tên thể loại</th>
            <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Mô tả</th>
            <th style={{ padding: "12px", border: "1px solid #ddd", width: "150px" }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {genres.map((genre) => (
            <tr key={genre._id}>
              <td style={{ padding: "12px", border: "1px solid #ddd", fontWeight: "bold" }}>{genre.name}</td>
              <td style={{ padding: "12px", border: "1px solid #ddd", color: "#666" }}>{genre.description || "Không có mô tả"}</td>
              <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>
                <button 
                  onClick={() => handleEdit(genre)}
                  style={{ marginRight: "10px", color: "#fff", backgroundColor: "#f39c12", border: "none", padding: "5px 10px", borderRadius: "3px", cursor: "pointer" }}
                >
                  Sửa
                </button>
                <button 
                  onClick={() => handleDelete(genre._id)}
                  style={{ color: "#fff", backgroundColor: "#e74c3c", border: "none", padding: "5px 10px", borderRadius: "3px", cursor: "pointer" }}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminGenres;