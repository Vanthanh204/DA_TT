import { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/profile.css";

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
    // 1. Kiểm tra chuỗi rỗng cho username
    if (!editData.username || !editData.username.trim()) return "Tên hiển thị không được để trống";
    
    // 2. Kiểm tra độ dài chuỗi
    if (editData.username.length < 3 || editData.username.length > 30) return "Tên hiển thị từ 3-30 ký tự";

    // 3. Kiểm tra ngày tháng (Birth Date) - Chỉ kiểm tra nếu người dùng CÓ nhập
    if (editData.birthDate) {
      const birthDate = new Date(editData.birthDate);
      const now = new Date();
      
      if (isNaN(birthDate.getTime())) return "Ngày sinh không hợp lệ";
      if (birthDate > now) return "Ngày sinh không được là ngày trong tương lai";

      let age = now.getFullYear() - birthDate.getFullYear();
      const m = now.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
          age--;
      }

      if (age < 6) return "Bạn phải ít nhất 6 tuổi";
      if (age > 100) return "Tuổi không được vượt quá 100";
    }

    return "";
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Kiểm tra định dạng file
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn tệp hình ảnh!");
      return;
    }

    // Kiểm tra dung lượng file (giới hạn 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);
    try {
      const res = await API.post("/upload/comic-cover", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setEditData(prev => ({ ...prev, avatar: res.data.imageUrl }));
      alert("Lưu thành công");
    } catch (err) {
      console.error("Lỗi Upload:", err);
      const errorMsg = err.response?.data?.message || "Lỗi khi tải ảnh lên máy chủ!";
      alert("Lỗi: " + errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      setValidationError(error);
      alert(error);
      return;
    }

    setUploading(true);
    try {
      const dataToSend = {
        username: editData.username.trim(),
        birthDate: editData.birthDate || null,
        avatar: editData.avatar
      };

      console.log("Đang gửi dữ liệu cập nhật:", dataToSend);

      const res = await API.put("/users/me", dataToSend);
      const updatedUser = res.data;
      
      setUser(updatedUser);
      if (setGlobalUser) setGlobalUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("storage"));
      
      setIsEditing(false);
      setValidationError("");
      alert("Lưu thành công");
    } catch (err) {
      console.error("Chi tiết lỗi cập nhật Profile:", err);
      let errorMsg = "Không thể kết nối với máy chủ";
      
      if (err.response) {
        // Lỗi từ server trả về (400, 401, 403, 500,...)
        errorMsg = err.response.data.message || err.response.data || JSON.stringify(err.response.data);
      } else if (err.request) {
        // Lỗi do không gửi được request (Network Error)
        errorMsg = "Lỗi mạng: Không thể gửi yêu cầu tới máy chủ. Vui lòng kiểm tra kết nối Internet hoặc Server Backend.";
      }
      
      alert("Lỗi: " + errorMsg);
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
    <div className="profile-page-container">
      <div className="profile-card">
        <h2 className="profile-title">Thông tin cá nhân</h2>
        
        <div className="profile-header-info">
          <div className="avatar-wrapper">
            <img 
              src={isEditing ? (editData.avatar || DEFAULT_AVATAR) : (user.avatar || DEFAULT_AVATAR)} 
              alt="Avatar" 
              onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
              className="profile-avatar-img"
            />
            {isEditing && (
              <label className="avatar-upload-label">
                📷<input 
                    type="file" 
                    name="image"
                    hidden 
                    onChange={handleFileChange} 
                    accept="image/*"
                  />
              </label>
            )}
          </div>
          <div className="user-title-info">
            {isEditing ? (
              <input type="text" value={editData.username} onChange={(e) => setEditData({...editData, username: e.target.value})} className="edit-username-input" />
            ) : (
              <h3 className="display-username">{user.username}</h3>
            )}
            <p className="user-role-badge">{user.role === "admin" ? "Quản trị viên" : "Thành viên"}</p>
          </div>
        </div>

        <div className="profile-details-grid">
          <div className="detail-item">
            <label>Email</label>
            <p>{user.email}</p>
          </div>
          <div className="detail-item">
            <label>Ngày sinh</label>
            {isEditing ? (
              <input type="date" value={editData.birthDate} onChange={(e) => setEditData({...editData, birthDate: e.target.value})} className="edit-date-input" />
            ) : (
              <p>{user.birthDate ? new Date(user.birthDate).toLocaleDateString("vi-VN") : "Chưa đặt"}</p>
            )}
          </div>
          <div className="detail-item">
            <label>Tuổi</label>
            <p>{calculateAge(user.birthDate)}</p>
          </div>
          <div className="detail-item">
            <label>Cấp độ</label>
            <p>{user.level || 0}</p>
          </div>
        </div>

        {validationError && <p className="error-text">{validationError}</p>}

        <div className="profile-actions">
          {isEditing ? (
            <>
              <button onClick={handleSave} disabled={uploading} className="btn-save">{uploading ? "ĐANG LƯU..." : "LƯU THAY ĐỔI"}</button>
              <button onClick={() => { setIsEditing(false); setValidationError(""); }} className="btn-cancel">HỦY</button>
            </>
          ) : (
            <button onClick={() => {
              setEditData({ 
                username: user.username, 
                birthDate: user.birthDate ? user.birthDate.split("T")[0] : "", 
                avatar: user.avatar || "" 
              });
              setIsEditing(true);
            }} className="btn-edit-mode">CHỈNH SỬA THÔNG TIN</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;