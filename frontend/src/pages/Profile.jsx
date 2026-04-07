import { useEffect, useState } from "react";
import API from "../services/api";

function Profile({ user: propUser }) {
  const [user, setUser] = useState(propUser || JSON.parse(localStorage.getItem("user")));
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ username: "", age: 0, avatar: "" });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const savedUser = propUser || JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      setUser(savedUser);
      setEditData({ 
        username: savedUser.username, 
        age: savedUser.age || 0, 
        avatar: savedUser.avatar || "" 
      });
    }
  }, [propUser]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      // Tạm thời dùng chung route upload ảnh bìa (cần verifyAdmin nếu route đó yêu cầu)
      // Nếu route /upload/comic-cover yêu cầu verifyAdmin, ta nên tạo route riêng hoặc bỏ verifyAdmin ở backend
      const res = await API.post("/upload/comic-cover", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setEditData({ ...editData, avatar: res.data.imageUrl });
      alert("Tải ảnh lên thành công!");
    } catch (err) {
      console.error("Lỗi upload:", err);
      alert("Lỗi khi tải ảnh lên!");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await API.put("/users/me", editData);
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      setIsEditing(false);
      alert("Cập nhật thành công!");
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      alert("Không thể cập nhật thông tin!");
    }
  };

  if (!user) return <div style={{padding: '100px', textAlign: 'center'}}>Bạn cần đăng nhập để xem trang này.</div>;

  return (
    <div className="profile-page" style={{ padding: "40px", maxWidth: "800px", margin: "0 auto", backgroundColor: "#f4f4f4", minHeight: "80vh" }}>
      <h2 style={{ color: "#333", marginBottom: "20px" }}>Thông tin cá nhân</h2>
      <div style={{ background: "#fff", padding: "30px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px" }}>
          <div style={{ position: "relative" }}>
            <img src={isEditing ? (editData.avatar || "https://via.placeholder.com/100") : (user.avatar || "https://via.placeholder.com/100")} alt="Avatar" style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", border: "3px solid #3498db" }} />
            {isEditing && (
              <label style={{ position: "absolute", bottom: 0, right: 0, background: "#3498db", color: "#fff", padding: "5px", borderRadius: "50%", cursor: "pointer", fontSize: "0.8rem" }}>
                <i className="fas fa-camera"></i>
                <input type="file" hidden onChange={handleFileChange} />
              </label>
            )}
          </div>
          <div>
            {isEditing ? (
              <input 
                type="text" 
                value={editData.username} 
                onChange={(e) => setEditData({...editData, username: e.target.value})}
                style={{ fontSize: "1.5rem", padding: "5px", borderRadius: "5px", border: "1px solid #ddd" }}
              />
            ) : (
              <h3 style={{ margin: 0, fontSize: "1.5rem" }}>{user.username}</h3>
            )}
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
          <div>
            <label style={{ color: "#999", fontSize: "0.8rem", display: "block" }}>Tuổi</label>
            {isEditing ? (
              <input 
                type="number" 
                value={editData.age} 
                onChange={(e) => setEditData({...editData, age: e.target.value})}
                style={{ padding: "5px", borderRadius: "5px", border: "1px solid #ddd", width: "60px" }}
              />
            ) : (
              <p style={{ margin: "5px 0", fontWeight: "bold" }}>{user.age || "Chưa đặt"}</p>
            )}
          </div>
        </div>

        {isEditing ? (
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleSave} disabled={uploading} style={{ flex: 1, padding: "12px", backgroundColor: "#2ecc71", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
              {uploading ? "Đang tải ảnh..." : "Lưu thay đổi"}
            </button>
            <button onClick={() => setIsEditing(false)} style={{ flex: 1, padding: "12px", backgroundColor: "#e74c3c", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
              Hủy
            </button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} style={{ width: "100%", padding: "12px", backgroundColor: "#3498db", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
            Chỉnh sửa thông tin
          </button>
        )}
      </div>
    </div>
  );
}

export default Profile;