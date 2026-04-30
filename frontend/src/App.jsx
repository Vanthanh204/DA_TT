import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import AdminComics from "./pages/AdminComics";
import AdminUsers from "./pages/AdminUsers";
import AdminUserHistory from "./pages/AdminUserHistory";
import AdminGenres from "./pages/AdminGenres";
import ComicDetail from "./pages/ComicDetail";
import ReadingPage from "./pages/ReadingPage";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import History from "./pages/History";
import Favorites from "./pages/Favorites";
import Navbar from "./components/Navbar";
import API from "./services/api";

// Component trung gian để dùng hook useLocation
function AppContent({ user, setUser, handleLogout }) {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminPage && <Navbar user={user} onLogout={handleLogout} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/comic/:id" element={<ComicDetail />} />
        <Route path="/reading/:chapterId" element={<ReadingPage />} />
        <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
        <Route path="/search" element={<Search />} />
        <Route path="/history" element={<History />} />
        <Route path="/favorites" element={<Favorites />} />
        {user?.role === "admin" && (
          <>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/comics" element={<AdminComics />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/users/:id/history" element={<AdminUserHistory />} />
            <Route path="/admin/genres" element={<AdminGenres />} />
          </>
        )}
      </Routes>
    </>
  );
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // 👉 Tăng lượt truy cập khi load App
    const trackVisit = async () => {
      try {
        await API.post("/admin/stats/visit");
      } catch (err) {
        console.error("Lỗi tracking visit:", err);
      }
    };
    trackVisit();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <BrowserRouter>
      <AppContent user={user} setUser={setUser} handleLogout={handleLogout} />
    </BrowserRouter>
  );
}

export default App;