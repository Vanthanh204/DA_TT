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

  const handleAddGenre = async (e) => {
    e.preventDefault();
    if (!newGenreName.trim()) return;
    try {
      const res = await API.post("/genres", { name: newGenreName });
      setGenres([...genres, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewGenreName("");
      alert("Thêm thể loại thành công!");
    } catch (err) {
      console.error("Lỗi thêm thể loại:", err);
      alert("Thể loại đã tồn tại hoặc lỗi!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa thể loại này?")) {
      try {
        await API.delete(`/genres/${id}`);
        setGenres(genres.filter((g) => g._id !== id));
        alert("Xóa thành công!");
      } catch (err) {
        console.error("Lỗi xóa thể loại:", err);
        alert("Lỗi khi xóa!");
      }
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Quản lý thể loại</h1>
      
      <form onSubmit={handleAddGenre} style={{ marginBottom: "30px", display: "flex", gap: "10px" }}>
        <input 
          type="text" 
          placeholder="Tên thể loại mới..." 
          value={newGenreName}
          onChange={(e) => setNewGenreName(e.target.value)}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ddd", flex: 1 }}
        />
        <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#27ae60", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          Thêm mới
        </button>
      </form>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f4f4f4" }}>
            <th style={{ padding: "12px", border: "1px solid #ddd" }}>Tên thể loại</th>
            <th style={{ padding: "12px", border: "1px solid #ddd" }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {genres.map((genre) => (
            <tr key={genre._id}>
              <td style={{ padding: "12px", border: "1px solid #ddd" }}>{genre.name}</td>
              <td style={{ padding: "12px", border: "1px solid #ddd" }}>
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