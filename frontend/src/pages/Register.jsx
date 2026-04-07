import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import "../styles/auth.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validation Chuỗi & Số (Frontend Check)
    if (username.length < 3) return setError("Tên người dùng phải từ 3 ký tự");
    if (password.length < 6) return setError("Mật khẩu phải từ 6 ký tự");
    if (!Number.isInteger(Number(age)) || Number(age) < 6 || Number(age) > 100) {
      return setError("Tuổi phải là số nguyên dương từ 6 đến 100");
    }

    try {
      await API.post("/auth/register", { username, email, password, age: Number(age) });
      alert("Đăng ký thành công! Hãy đăng nhập.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi đăng ký");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleRegister}>
        <h2>Đăng ký</h2>
        {error && <p className="error">{error}</p>}
        <div className="input-group">
          <label>Tên người dùng (Tối thiểu 3 ký tự)</label>
          <input 
            type="text" 
            placeholder="Ví dụ: vanthanh123"
            value={username}
            onChange={(e) => setUsername(e.target.value)} 
            required
            minLength={3}
            maxLength={20}
          />
        </div>
        <div className="input-group">
          <label>Tuổi (Từ 6 đến 100)</label>
          <input 
            type="number" 
            placeholder="Ví dụ: 20"
            value={age}
            onChange={(e) => setAge(e.target.value)} 
            required
            min={6}
            max={100}
          />
        </div>
        <div className="input-group">
          <label>Email</label>
          <input 
            type="email" 
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
        </div>
        <div className="input-group">
          <label>Mật khẩu (Tối thiểu 6 ký tự)</label>
          <input 
            type="password" 
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            required
            minLength={6}
          />
        </div>
        <button type="submit" className="btn-auth">Đăng ký</button>
        <p className="auth-footer">
          Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;