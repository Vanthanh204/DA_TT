import { useEffect, useState } from "react";
import API from "../services/api";

function Profile({ user: propUser }) {
  const [user, setUser] = useState(propUser || JSON.parse(localStorage.getItem("user")));

  useEffect(() => {
    if (!propUser) {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } else {
      setUser(propUser);
    }
  }, [propUser]);

  if (!user) return <div style={{padding: '100px', textAlign: 'center'}}>Bạn cần đăng nhập để xem trang này.</div>;

  return (
    <div className="profile-page" style={{ padding: "40px", maxWidth: "800px", margin: "0 auto", backgroundColor: "#f4f4f4", minHeight: "80vh" }}>
      <h2 style={{ color: "#333", marginBottom: "20px" }}>Thông tin cá nhân</h2>
      <div style={{ background: "#fff", padding: "30px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px" }}>
          <img src={user.avatar || "https://via.placeholder.com/100"} alt="Avatar" style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", border: "3px solid #3498db" }} />
          <div>
            <h3 style={{ margin: 0, fontSize: "1.5rem" }}>{user.username}</h3>
            <p style={{ color: "#777", margin: "5px 0" }}>{user.role === "admin" ? "Quản trị viên" : "Thành viên"}</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
          <div>
            <label style={{ color: "#999", fontSize: "0.8rem", display: "block" }}>Email</label>
            <p style={{ margin: "5px 0", fontWeight: "bold" }}>{user.email || "Chưa cập nhật"}</p>
          </div>
          <div>
            <label style={{ color: "#999", fontSize: "0.8rem", display: "block" }}>Cấp độ</label>
            <p style={{ margin: "5px 0", fontWeight: "bold" }}>{user.level || 0}</p>
          </div>
        </div>

        <button style={{ width: "100%", padding: "12px", backgroundColor: "#3498db", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
          Chỉnh sửa thông tin
        </button>
      </div>
    </div>
  );
}

export default Profile;