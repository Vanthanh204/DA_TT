import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/navbar.css";

function Navbar({ user, onLogout }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [genres, setGenres] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Thêm state cho mobile menu
  const navigate = useNavigate();

  // Đóng menu khi chuyển trang
  useEffect(() => {
    setIsMenuOpen(false);
  }, [navigate]);

  useEffect(() => {
    // Lấy danh sách thể loại cho mục lục
    const fetchGenres = async () => {
      try {
        const res = await API.get("/genres");
        setGenres(res.data);
      } catch (err) {
        console.error("Lỗi lấy thể loại:", err);
      }
    };
    fetchGenres();
  }, []);

  // Xử lý khi nhập tìm kiếm
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim().length > 1) {
      try {
        const res = await API.get(`/comics/search?q=${value}`);
        setSuggestions(res.data.slice(0, 5)); // Lấy tối đa 5 gợi ý
        setShowSuggestions(true);
      } catch (err) {
        console.error("Lỗi lấy gợi ý:", err);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Khi nhấn Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${searchTerm.trim()}`);
    }
  };

  // Khi click vào 1 gợi ý
  const handleSuggestionClick = (comicId) => {
    setShowSuggestions(false);
    setSearchTerm("");
    navigate(`/comic/${comicId}`);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-left">
          <Link to="/" className="logo">
            Comic<span>Web</span>
          </Link>

          <div className="nav-menu-dropdown">
            <button className="dropbtn">
              <i className="fas fa-bars"></i> Mục lục
            </button>
            <div className="dropdown-content">
              <div className="menu-item has-submenu">
                <div className="menu-link">
                  <div className="item-left">
                    <i className="fas fa-tags"></i>
                    <span>Thể loại</span>
                  </div>
                  <i className="fas fa-chevron-right arrow"></i>
                </div>
                <div className="submenu">
                  <div className="submenu-header">Tất cả thể loại</div>
                  <div className="genres-grid-nav">
                    {genres.map(g => (
                      <Link key={g._id} to={`/search?genre=${g._id}&genreName=${g.name}`}>
                        {g.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              
              <Link to="/history" className="menu-item">
                <div className="item-left">
                  <i className="fas fa-history"></i>
                  <span>Lịch sử</span>
                </div>
              </Link>
              <Link to="/favorites" className="menu-item">
                <div className="item-left">
                  <i className="fas fa-heart"></i>
                  <span>Yêu thích</span>
                </div>
              </Link>
              <Link to="/profile" className="menu-item">
                <div className="item-left">
                  <i className="fas fa-layer-group"></i>
                  <span>Cấp độ: {user?.level || 0}</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="search-box">
          <input 
            type="text" 
            placeholder="Tìm truyện..." 
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          <i className="fas fa-search"></i>
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions">
              {suggestions.map(comic => (
                <div 
                  key={comic._id} 
                  className="suggestion-item" 
                  onClick={() => handleSuggestionClick(comic._id)}
                >
                  <img src={comic.coverImage} alt="" />
                  <div className="suggestion-info">
                    <span className="suggestion-title">{comic.title}</span>
                    <span className="suggestion-author">{comic.author}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nút Hamburger cho Mobile */}
        <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <i className={isMenuOpen ? "fas fa-times" : "fas fa-bars"}></i>
        </button>

        <div className={`menu ${isMenuOpen ? "open" : ""}`}>
          <Link to="/">Trang chủ</Link>
          
          {/* Hiển thị link Admin nếu là admin */}
          {user?.role === "admin" && (
            <Link to="/admin" className="admin-link">Quản trị</Link>
          )}

          {user ? (
            <div className="user-info">
              <Link to="/profile" className="username">Chào, {user.username}</Link>
              <button onClick={onLogout} className="btn-logout">Đăng xuất</button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn-login">Đăng nhập</Link>
              <Link to="/register" className="btn-register">Đăng ký</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;