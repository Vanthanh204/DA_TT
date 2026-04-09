import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/auth.css";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    // 1. Validation Chuỗi (Username)
    if (!formData.username.trim()) return "Tên đăng nhập không được để trống";
    if (formData.username.length < 3 || formData.username.length > 20) return "Tên đăng nhập từ 3-20 ký tự";
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) return "Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới";

    // 2. Validation Email
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email)) return "Định dạng email không hợp lệ";

    // 3. Validation Mật khẩu
    if (formData.password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
    if (formData.password !== formData.confirmPassword) return "Mật khẩu xác nhận không khớp";

    // 4. Validation Ngày sinh (Tuổi 6-100)
    if (!formData.birthDate) return "Vui lòng chọn ngày sinh";
    const birthDate = new Date(formData.birthDate);
    const now = new Date();
    if (birthDate > now) return "Ngày sinh không được ở tương lai";
    
    let age = now.getFullYear() - birthDate.getFullYear();
    const m = now.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) age--;
    
    if (age < 6) return "Bạn phải ít nhất 6 tuổi để đăng ký";
    if (age > 100) return "Tuổi không được vượt quá 100";

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    try {
      await API.post("/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        birthDate: formData.birthDate
      });
      alert("Đăng ký thành công! Hãy đăng nhập.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi đăng ký tài khoản");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Đăng ký thành viên</h2>
        {error && <p className="error-msg">{error}</p>}
        
        <div className="input-group">
          <label>Tên đăng nhập</label>
          <input 
            type="text" 
            placeholder="3-20 ký tự, không dấu" 
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required 
          />
        </div>

        <div className="input-group">
          <label>Email</label>
          <input 
            type="email" 
            placeholder="example@gmail.com" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required 
          />
        </div>

        <div className="input-group">
          <label>Ngày sinh</label>
          <input 
            type="date" 
            value={formData.birthDate}
            onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
            required 
          />
        </div>

        <div className="input-group">
          <label>Mật khẩu</label>
          <input 
            type="password" 
            placeholder="Ít nhất 6 ký tự" 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required 
          />
        </div>

        <div className="input-group">
          <label>Xác nhận mật khẩu</label>
          <input 
            type="password" 
            placeholder="Nhập lại mật khẩu" 
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            required 
          />
        </div>

        <button type="submit" disabled={loading} className="btn-auth">
          {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ NGAY"}
        </button>

        <p className="auth-link">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;