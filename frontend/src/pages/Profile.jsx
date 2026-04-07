import { useEffect, useState } from "react";
import API from "../services/api";

function Profile({ user: propUser }) {
  // Ưu tiên lấy từ prop, sau đó mới đến localStorage
  const [user, setUser] = useState(propUser || JSON.parse(localStorage.getItem("user")));
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ username: "", age: 0, avatar: "" });
  const [uploading, setUploading] = useState(false);
  const [ageError, setAgeError] = useState("");

  const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

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

  const handleAgeChange = (val) => {
    const age = parseInt(val);
    setEditData({ ...editData, age: val });
    
    if (isNaN(age) || age < 6 || age > 100) {
      setAgeError("Tuổi phải từ 6 đến 100");
    } else {
      setAgeError("");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      const res = await API.post("/upload/comic-cover", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setEditData({ ...editData, avatar: res.data.imageUrl });
      alert("Tải ảnh lên thành công! Nhấn 'Lưu thay đổi' để hoàn tất.");
    } catch (err) {
      console.error("Lỗi upload:", err);
      alert("Lỗi khi tải ảnh lên!");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const ageNum = parseInt(editData.age);
    if (isNaN(ageNum) || ageNum < 6 || ageNum > 100) {
      setAgeError("Vui lòng nhập tuổi hợp lệ (6-100) trước khi lưu!");
      return;
    }

    try {
      const res = await API.put("/users/me", {
        ...editData,
        age: ageNum
      });
      
      const updatedUser = res.data;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setIsEditing(false);
      alert("Cập nhật thành công!");
      // Buộc load lại trang để cập nhật đồng bộ cho Navbar nếu cần
      window.location.reload(); 
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
            <img 
              src={isEditing ? (editData.avatar || DEFAULT_AVATAR) : (user.avatar || DEFAULT_AVATAR)} 
              alt="Avatar" 
              onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
              style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", border: "3px solid #3498db" }} 
            />
            {isEditing && (
              <label style={{ position: "absolute", bottom: "5px", right: "5px", background: "#3498db", color: "#fff", padding: "8px", borderRadius: "50%", cursor: "pointer", fontSize: "0.9rem", boxShadow: "0 2px 5px rgba(0,0,0,0.2)" }}>
                📷
                <input type="file" hidden onChange={handleFileChange} accept="image/*" />
              </label>
            )}
          </div>
          <div>
            {isEditing ? (
              <input 
                type="text" 
                value={editData.username} 
                onChange={(e) => setEditData({...editData, username: e.target.value})}
                style={{ fontSize: "1.5rem", padding: "5px 10px", borderRadius: "5px", border: "1px solid #ddd", width: "100%" }}
              />
            ) : (
              <h3 style={{ margin: 0, fontSize: "1.8rem", color: "#2c3e50" }}>{user.username}</h3>
            )}
            <p style={{ color: "#3498db", margin: "5px 0", fontWeight: "bold" }}>{user.role === "admin" ? "Quản trị viên" : "Thành viên"}</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginBottom: "30px" }}>
          <div style={{ padding: "15px", background: "#f8f9fa", borderRadius: "8px" }}>
            <label style={{ color: "#7f8c8d", fontSize: "0.85rem", display: "block", marginBottom: "5px" }}>Email</label>
            <p style={{ margin: 0, fontWeight: "bold", color: "#2c3e50" }}>{user.email || "Chưa cập nhật"}</p>
          </div>
          <div style={{ padding: "15px", background: "#f8f9fa", borderRadius: "8px" }}>
            <label style={{ color: "#7f8c8d", fontSize: "0.85rem", display: "block", marginBottom: "5px" }}>Cấp độ</label>
            <p style={{ margin: 0, fontWeight: "bold", color: "#2c3e50" }}>{user.level || 0}</p>
          </div>
          <div style={{ padding: "15px", background: "#f8f9fa", borderRadius: "8px" }}>
            <label style={{ color: "#7f8c8d", fontSize: "0.85rem", display: "block", marginBottom: "5px" }}>Tuổi</label>
            {isEditing ? (
              <>
                <input 
                  type="number" 
                  value={editData.age} 
                  onChange={(e) => handleAgeChange(e.target.value)}
                  style={{ padding: "8px", borderRadius: "5px", border: ageError ? "1px solid red" : "1px solid #ddd", width: "80px", fontSize: "1rem" }}
                />
                {ageError && <p style={{ color: "red", fontSize: "0.75rem", marginTop: "5px", margin: 0 }}>{ageError}</p>}
              </>
            ) : (
              <p style={{ margin: 0, fontWeight: "bold", color: "#2c3e50" }}>{user.age || "Chưa đặt"}</p>
            )}
          </div>
        </div>

        {isEditing ? (
          <div style={{ display: "flex", gap: "15px" }}>
            <button onClick={handleSave} disabled={uploading || ageError} style={{ flex: 1, padding: "12px", backgroundColor: (uploading || ageError) ? "#bdc3c7" : "#2ecc71", color: "#fff", border: "none", borderRadius: "5px", cursor: (uploading || ageError) ? "not-allowed" : "pointer", fontWeight: "bold", transition: "0.3s" }}>
              {uploading ? "ĐANG TẢI ẢNH..." : "LƯU THAY ĐỔI"}
            </button>
            <button onClick={() => { setIsEditing(false); setAgeError(""); }} style={{ flex: 1, padding: "12px", backgroundColor: "#e74c3c", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", transition: "0.3s" }}>
              HỦY
            </button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} style={{ width: "100%", padding: "12px", backgroundColor: "#3498db", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", transition: "0.3s" }}>
            CHỈNH SỬA THÔNG TIN
          </button>
        )}
      </div>
    </div>
  );
}

export default Profile;