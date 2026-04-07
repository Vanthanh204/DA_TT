import { useState, useEffect } from "react";
import API from "../services/api";
import "../styles/auth.css"; // Tận dụng style của auth hoặc tạo riêng

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ username: "", age: "" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/users/me");
      setUser(res.data);
      setFormData({ username: res.data.username, age: res.data.age || "" });
    } catch (err) {
      console.error("Lỗi lấy thông tin:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put("/users/me", formData);
      setUser(res.data);
      alert("Cập nhật thành công!");
      setEditing(false);
      // Cập nhật lại localStorage nếu cần
      const localUser = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem("user", JSON.stringify({ ...localUser, username: res.data.username }));
    } catch (err) {
      alert("Lỗi cập nhật!");
    }
  };

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Thông tin tài khoản</h2>
        {!editing ? (
          <div className="profile-info">
            <p><strong>Tên đăng nhập:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Tuổi:</strong> {user.age || "Chưa cập nhật"}</p>
            <p><strong>Vai trò:</strong> {user.role === "admin" ? "Quản trị viên" : "Thành viên"}</p>
            <p><strong>Cấp độ:</strong> {user.level}</p>
            <button onClick={() => setEditing(true)} style={{marginTop: "20px"}}>Chỉnh sửa thông tin</button>
          </div>
        ) : (
          <form onSubmit={handleUpdate}>
            <div className="input-group">
              <label>Tên hiển thị</label>
              <input 
                type="text" 
                value={formData.username} 
                onChange={e => setFormData({...formData, username: e.target.value})} 
                required 
              />
            </div>
            <div className="input-group">
              <label>Tuổi</label>
              <input 
                type="number" 
                value={formData.age} 
                onChange={e => setFormData({...formData, age: e.target.value})} 
              />
            </div>
            <div className="auth-buttons">
              <button type="submit">Lưu thay đổi</button>
              <button type="button" onClick={() => setEditing(false)} className="btn-cancel">Hủy</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile;