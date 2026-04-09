import { useEffect, useState } from "react";
import API from "../services/api";

function Profile({ user: propUser, setUser: setGlobalUser }) {
  const [user, setUser] = useState(propUser || JSON.parse(localStorage.getItem("user")));
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ username: "", birthDate: "", avatar: "" });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [validationError, setValidationError] = useState("");

  const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await API.get("/users/me");
        const userData = res.data;
        setUser(userData);
        setEditData({ 
          username: userData.username, 
          birthDate: userData.birthDate ? userData.birthDate.split("T")[0] : "", 
          avatar: userData.avatar || "" 
        });
        if (setGlobalUser) setGlobalUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (err) {
        console.error("Lỗi lấy thông tin user:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [setGlobalUser]);

  const validate = () => {
    // 1. Kiểm tra chuỗi rỗng
    if (!editData.username.trim()) return "Tên đăng nhập không được để trống";
    
    // 2. Kiểm tra độ dài chuỗi
    if (editData.username.length < 3 || editData.username.length > 20) return "Tên đăng nhập từ 3-20 ký tự";

    // 3. Kiểm tra ngày tháng (Birth Date)
    if (!editData.birthDate) return "Vui lòng chọn ngày sinh";
    
    const birthDate = new Date(editData.birthDate);
    const now = new Date();
    
    // Kiểm tra ngày trong tương lai
    if (birthDate > now) return "Ngày sinh không được là ngày trong tương lai";

    // Kiểm tra tuổi (6-100)
    let age = now.getFullYear() - birthDate.getFullYear();
    const m = now.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
        age--;
    }

    if (age < 6) return "Bạn phải ít nhất 6 tuổi";
    if (age > 100) return "Tuổi không được vượt quá 100";

    return "";
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
      alert("Tải ảnh lên thành công!");
    } catch (err) {
      alert("Lỗi khi tải ảnh lên!");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const error = validate();
    if (error) {
      setValidationError(error);
      alert(error);
      return;
    }

    try {
      setIsEditing(false);
      setUploading(true);
      const res = await API.put("/users/me", editData);
      const updatedUser = res.data;
      setUser(updatedUser);
      if (setGlobalUser) setGlobalUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setValidationError("");
      alert("Cập nhật thành công!");
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      setIsEditing(true);
      alert("Lỗi: " + (err.response?.data?.message || "Không thể lưu thông tin"));
    } finally {
      setUploading(false);
    }
  };

  const calculateAge = (dateString) => {
    if (!dateString) return "Chưa đặt";
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; }
    return age;
  };

  if (!user) return <div style={{padding: '100px', textAlign: 'center'}}>Bạn cần đăng nhập.</div>;

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
              <label style={{ position: "absolute", bottom: "5px", right: "5px", background: "#3498db", color: "#fff", padding: "8px", borderRadius: "50%", cursor: "pointer", fontSize: "0.9rem" }}>
                📷<input type="file" hidden onChange={handleFileChange} accept="image/*" />
              </label>
            )}
          </div>
          <div>
            {isEditing ? (
              <input type="text" value={editData.username} onChange={(e) => setEditData({...editData, username: e.target.value})} style={{ fontSize: "1.5rem", padding: "5px 10px", borderRadius: "5px", border: "1px solid #ddd", width: "100%" }} />
            ) : (
              <h3 style={{ margin: 0, fontSize: "1.8rem", color: "#2c3e50" }}>{user.username}</h3>
            )}
            <p style={{ color: "#3498db", margin: "5px 0", fontWeight: "bold" }}>{user.role === "admin" ? "Quản trị viên" : "Thành viên"}</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginBottom: "30px" }}>
          <div style={{ padding: "15px", background: "#f8f9fa", borderRadius: "8px" }}>
            <label style={{ color: "#7f8c8d", fontSize: "0.85rem", display: "block", marginBottom: "5px" }}>Email</label>
            <p style={{ margin: 0, fontWeight: "bold", color: "#2c3e50" }}>{user.email}</p>
          </div>
          <div style={{ padding: "15px", background: "#f8f9fa", borderRadius: "8px" }}>
            <label style={{ color: "#7f8c8d", fontSize: "0.85rem", display: "block", marginBottom: "5px" }}>Ngày sinh</label>
            {isEditing ? (
              <input type="date" value={editData.birthDate} onChange={(e) => setEditData({...editData, birthDate: e.target.value})} style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ddd", width: "100%" }} />
            ) : (
              <p style={{ margin: 0, fontWeight: "bold", color: "#2c3e50" }}>{user.birthDate ? new Date(user.birthDate).toLocaleDateString("vi-VN") : "Chưa đặt"}</p>
            )}
          </div>
          <div style={{ padding: "15px", background: "#f8f9fa", borderRadius: "8px" }}>
            <label style={{ color: "#7f8c8d", fontSize: "0.85rem", display: "block", marginBottom: "5px" }}>Tuổi</label>
            <p style={{ margin: 0, fontWeight: "bold", color: "#2c3e50" }}>{calculateAge(user.birthDate)}</p>
          </div>
          <div style={{ padding: "15px", background: "#f8f9fa", borderRadius: "8px" }}>
            <label style={{ color: "#7f8c8d", fontSize: "0.85rem", display: "block", marginBottom: "5px" }}>Cấp độ</label>
            <p style={{ margin: 0, fontWeight: "bold", color: "#2c3e50" }}>{user.level || 0}</p>
          </div>
        </div>

        {validationError && <p style={{ color: "red", marginBottom: "15px", fontSize: "0.9rem" }}>{validationError}</p>}

        {isEditing ? (
          <div style={{ display: "flex", gap: "15px" }}>
            <button onClick={handleSave} disabled={uploading} style={{ flex: 1, padding: "12px", backgroundColor: "#2ecc71", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>{uploading ? "ĐANG LƯU..." : "LƯU THAY ĐỔI"}</button>
            <button onClick={() => { setIsEditing(false); setValidationError(""); }} style={{ flex: 1, padding: "12px", backgroundColor: "#e74c3c", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>HỦY</button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} style={{ width: "100%", padding: "12px", backgroundColor: "#3498db", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>CHỈNH SỬA THÔNG TIN</button>
        )}
      </div>
    </div>
  );
}

export default Profile;