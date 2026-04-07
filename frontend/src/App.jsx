import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import ComicDetail from "./pages/ComicDetail";
import ReadingPage from "./pages/ReadingPage";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import History from "./pages/History";
import Favorites from "./pages/Favorites";
import Navbar from "./components/Navbar";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <BrowserRouter>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/comic/:id" element={<ComicDetail />} />
        <Route path="/reading/:chapterId" element={<ReadingPage />} />
        <Route path="/profile" element={<Profile user={user} />} />
        <Route path="/search" element={<Search />} />
        <Route path="/history" element={<History />} />
        <Route path="/favorites" element={<Favorites />} />
        {user?.role === "admin" && (
          <Route path="/admin" element={<AdminDashboard />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;