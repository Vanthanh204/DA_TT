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
      const errorMsg = err.response?.data?.message || "Lỗi khi tải ảnh lên!";
      alert("Lỗi: " + errorMsg);
      console.error("Upload error:", err);
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

      <style dangerouslySetInnerHTML={{ __html: `
        .profile-page-container {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
          min-height: 80vh;
        }
        .profile-card {
          background: #fff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .profile-title {
          color: #333;
          margin-bottom: 25px;
          text-align: center;
        }
        .profile-header-info {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
        }
        .avatar-wrapper {
          position: relative;
          flex-shrink: 0;
        }
        .profile-avatar-img {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #3498db;
        }
        .avatar-upload-label {
          position: absolute;
          bottom: 5px;
          right: 5px;
          background: #3498db;
          color: #fff;
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 0.9rem;
        }
        .user-title-info {
          overflow: hidden;
        }
        .display-username {
          margin: 0;
          font-size: 1.8rem;
          color: #2c3e50;
          word-break: break-all;
        }
        .edit-username-input {
          font-size: 1.2rem;
          padding: 8px;
          width: 100%;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        .user-role-badge {
          color: #3498db;
          margin: 5px 0;
          font-weight: bold;
        }
        .profile-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        .detail-item {
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          overflow: hidden;
        }
        .detail-item label {
          color: #7f8c8d;
          font-size: 0.85rem;
          display: block;
          margin-bottom: 5px;
        }
        .detail-item p {
          margin: 0;
          font-weight: bold;
          color: #2c3e50;
          word-break: break-all;
        }
        .edit-date-input {
          width: 100%;
          padding: 5px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .error-text {
          color: red;
          margin-bottom: 15px;
          font-size: 0.9rem;
        }
        .profile-actions {
          display: flex;
          gap: 15px;
        }
        .btn-save, .btn-cancel, .btn-edit-mode {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
        }
        .btn-save { background: #2ecc71; color: #fff; }
        .btn-cancel { background: #e74c3c; color: #fff; }
        .btn-edit-mode { background: #3498db; color: #fff; width: 100%; }

        @media (max-width: 600px) {
          .profile-page-container {
            padding: 10px;
          }
          .profile-card {
            padding: 15px;
          }
          .profile-header-info {
            flex-direction: column;
            text-align: center;
          }
          .profile-avatar-img {
            width: 100px;
            height: 100px;
          }
          .profile-details-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .display-username {
            font-size: 1.4rem;
          }
          .profile-actions {
            flex-direction: column;
          }
        }
      ` }} />
    </div>
  );
}

export default Profile;