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

        <div className={`menu-sidebar ${isMenuOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <span>Tính Năng Tài Khoản</span>
            <button className="close-btn" onClick={() => setIsMenuOpen(false)}>×</button>
          </div>

          {user ? (
            <div className="sidebar-user-info">
              <div className="sidebar-item">
                <i className="fas fa-user-circle"></i>
                <span>{user.username}</span>
              </div>
              <div className="sidebar-item">
                <i className="fas fa-medal"></i>
                <span>Cấp Độ: {user.level || 0}</span>
              </div>
              <Link to="/profile" className="sidebar-item">
                <i className="fas fa-bell"></i>
                <span>Thông Báo</span>
              </Link>
            </div>
          ) : (
            <div className="sidebar-user-info">
              <Link to="/login" className="sidebar-item">
                <i className="fas fa-sign-in-alt"></i>
                <span>Đăng nhập</span>
              </Link>
              <Link to="/register" className="sidebar-item">
                <i className="fas fa-user-plus"></i>
                <span>Đăng ký</span>
              </Link>
            </div>
          )}

          <hr className="sidebar-divider" />

          <div className="sidebar-menu">
            <Link to="/" className="sidebar-menu-item">
              <i className="fas fa-home"></i>
              <span>Trang Chủ</span>
            </Link>
            <Link to="/history" className="sidebar-menu-item">
              <i className="fas fa-history"></i>
              <span>Lịch Sử</span>
            </Link>
            <Link to="/favorites" className="sidebar-menu-item">
              <i className="fas fa-heart"></i>
              <span>Truyện Theo Dõi</span>
            </Link>
            {user?.role === "admin" && (
              <Link to="/admin" className="sidebar-menu-item admin-item">
                <i className="fas fa-user-shield"></i>
                <span>Quản Trị Viên</span>
              </Link>
            )}
            <div className="sidebar-menu-item">
              <i className="fas fa-question-circle"></i>
              <span>Liên Hệ</span>
            </div>
            <div className="sidebar-menu-item">
              <i className="fas fa-exchange-alt"></i>
              <span>Chuyển Đổi Giao Diện</span>
            </div>
          </div>

          {user && (
            <>
              <hr className="sidebar-divider" />
              <div className="sidebar-logout" onClick={onLogout}>
                <i className="fas fa-door-open"></i>
                <span>Đăng Xuất</span>
              </div>
            </>
          )}
        </div>

        {/* Lớp phủ mờ khi mở sidebar */}
        {isMenuOpen && <div className="sidebar-overlay" onClick={() => setIsMenuOpen(false)}></div>}
      </div>
    </nav>
  );
}

export default Navbar;