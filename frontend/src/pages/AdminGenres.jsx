import { useEffect, useState } from "react";
import API from "../services/api";

function AdminGenres() {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await API.get("/genres");
        setGenres(res.data);
      } catch (err) {
        console.error("Lỗi lấy danh sách thể loại:", err);
      }
    };
    fetchGenres();
  }, []);

  const [newGenreName, setNewGenreName] = useState("");
  const [newGenreDesc, setNewGenreDesc] = useState("");

  const handleAddGenre = async (e) => {
    e.preventDefault();
    if (!newGenreName.trim()) return;
    try {
      const res = await API.post("/genres", { name: newGenreName, description: newGenreDesc });
      setGenres([...genres, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewGenreName("");
      setNewGenreDesc("");
      alert("Thêm thể loại thành công!");
    } catch (err) {
      console.error("Lỗi thêm thể loại:", err);
      alert("Thể loại đã tồn tại hoặc lỗi!");
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Quản lý thể loại</h1>
      
      <form onSubmit={handleAddGenre} style={{ marginBottom: "30px", display: "flex", flexDirection: "column", gap: "10px", background: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #ddd" }}>
        <h3>Thêm thể loại mới</h3>
        <input 
          type="text" 
          placeholder="Tên thể loại..." 
          value={newGenreName}
          onChange={(e) => setNewGenreName(e.target.value)}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ddd" }}
          required
        />
        <textarea 
          placeholder="Mô tả thể loại..." 
          value={newGenreDesc}
          onChange={(e) => setNewGenreDesc(e.target.value)}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ddd", minHeight: "80px" }}
        />
        <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#27ae60", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
          Lưu thể loại
        </button>
      </form>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f4f4f4" }}>
            <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Tên thể loại</th>
            <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Mô tả</th>
            <th style={{ padding: "12px", border: "1px solid #ddd", width: "100px" }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {genres.map((genre) => (
            <tr key={genre._id}>
              <td style={{ padding: "12px", border: "1px solid #ddd", fontWeight: "bold" }}>{genre.name}</td>
              <td style={{ padding: "12px", border: "1px solid #ddd", color: "#666" }}>{genre.description || "Không có mô tả"}</td>
              <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>
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