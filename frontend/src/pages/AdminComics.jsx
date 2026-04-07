import { useEffect, useState } from "react";
import API from "../services/api";

function AdminComics() {
  const [comics, setComics] = useState([]);

  useEffect(() => {
    const fetchComics = async () => {
      try {
        const res = await API.get("/comics");
        setComics(res.data);
      } catch (err) {
        console.error("Lỗi lấy danh sách truyện:", err);
      }
    };
    fetchComics();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bộ truyện này không? Tất cả chương truyện cũng sẽ bị xóa!")) {
      try {
        await API.delete(`/comics/${id}`);
        setComics(comics.filter((comic) => comic._id !== id));
        alert("Xóa thành công!");
      } catch (err) {
        console.error("Lỗi xóa truyện:", err);
        alert("Có lỗi xảy ra khi xóa!");
      }
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Quản lý truyện</h1>
        <button style={{ padding: "10px 20px", backgroundColor: "#27ae60", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          Thêm truyện mới
        </button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f4f4f4" }}>
            <th style={{ padding: "12px", border: "1px solid #ddd" }}>Tên truyện</th>
            <th style={{ padding: "12px", border: "1px solid #ddd" }}>Tác giả</th>
            <th style={{ padding: "12px", border: "1px solid #ddd" }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {comics.map((comic) => (
            <tr key={comic._id}>
              <td style={{ padding: "12px", border: "1px solid #ddd" }}>{comic.title}</td>
              <td style={{ padding: "12px", border: "1px solid #ddd" }}>{comic.author}</td>
              <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                <button style={{ marginRight: "10px", padding: "5px 10px", cursor: "pointer" }}>Sửa</button>
                <button 
                  onClick={() => handleDelete(comic._id)}
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

export default AdminComics;