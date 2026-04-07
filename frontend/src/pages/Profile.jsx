import { useEffect, useState } from "react";
import API from "../services/api";

function Profile({ user: propUser }) {
  const [user, setUser] = useState(propUser || JSON.parse(localStorage.getItem("user")));

  if (!user) return <div style={{padding: '100px', textAlign: 'center'}}>Bạn cần đăng nhập để xem trang này.</div>;

  return (
    <div className="profile-page" style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Thông tin cá nhân</h2>
      <div style={{ background: "#fff", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
        <p><strong>Tên người dùng:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email || "Chưa cập nhật"}</p>
        <p><strong>Vai trò:</strong> {user.role === "admin" ? "Quản trị viên" : "Thành viên"}</p>
        <p><strong>Cấp độ:</strong> {user.level || 0}</p>
        <button style={{ padding: "10px 20px", backgroundColor: "#3498db", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          Chỉnh sửa thông tin
        </button>
      </div>
    </div>
  );
}

export default Profile;