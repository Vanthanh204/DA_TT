import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminUserHistory() {
  const { id } = useParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get(`/users/${id}/history`);
        setHistory(res.data);
        // Lấy tên user từ lịch sử đầu tiên (nếu có)
        if (res.data.length > 0) {
            // Hoặc fetch thêm thông tin user riêng
        }
      } catch (err) {
        console.error("Lỗi lấy lịch sử:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [id]);

  return (
    <div style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto" }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ marginBottom: "20px", padding: "8px 15px", background: "#eee", border: "none", borderRadius: "5px", cursor: "pointer" }}
      >
        ← Quay lại quản lý người dùng
      </button>

      <h1>Lịch sử đọc của người dùng</h1>
      
      {loading ? (
        <p>Đang tải...</p>
      ) : history.length > 0 ? (
        <div style={{ display: "grid", gap: "15px", marginTop: "20px" }}>
          {history.map((item, index) => (
            <div key={index} style={{ display: "flex", gap: "15px", background: "#fff", padding: "15px", borderRadius: "8px", border: "1px solid #ddd" }}>
              <img src={item.comic?.coverImage} alt="" style={{ width: "60px", height: "80px", objectFit: "cover", borderRadius: "4px" }} />
              <div>
                <h3 style={{ margin: "0 0 5px 0" }}>{item.comic?.title}</h3>
                <p style={{ margin: "0", color: "#666" }}>Đã xem: Chương {item.chapter?.chapterNumber}</p>
                <p style={{ margin: "5px 0 0 0", fontSize: "0.85rem", color: "#999" }}>
                  Thời gian: {new Date(item.readAt).toLocaleString("vi-VN")}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ textAlign: "center", padding: "50px", color: "#999" }}>Người dùng này chưa có lịch sử đọc.</p>
      )}
    </div>
  );
}

export default AdminUserHistory;