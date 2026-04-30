import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import API from "../services/api";
import "../styles/admin.css";

function AdminComics() {
  const [comics, setComics] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [genres, setGenres] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalComics: 0, totalChapters: 0 });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showChapterForm, setShowChapterForm] = useState(null); 
  const [selectedComic, setSelectedComic] = useState(null); 
  const [editingComic, setEditingComic] = useState(null);
  const location = useLocation();

  const [comicData, setComicData] = useState({
    title: "", author: "", description: "", coverImage: "", genres: []
  });

  const [newChapter, setNewChapter] = useState({
    chapterNumber: 1, title: "", files: [] 
  });

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchComics();
    fetchGenres();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get("/admin/stats");
      setStats(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchComics = async () => {
    try {
      const res = await API.get("/comics");
      setComics(res.data);
      if (selectedComic) {
        const updated = res.data.find(c => c._id === selectedComic._id);
        setSelectedComic(updated);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách truyện:", err);
    }
  };

  const fetchGenres = async () => {
    try {
      const res = await API.get("/genres");
      setGenres(res.data);
    } catch (err) {
      console.error("Lỗi lấy thể loại:", err);
    }
  };

  const handleUploadCover = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      setIsUploading(true);
      const res = await API.post("/upload/comic-cover", formData);
      setComicData({ ...comicData, coverImage: res.data.imageUrl });
      alert("Lưu thành công");
    } catch (err) {
      alert("Lỗi upload!");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitComic = async (e) => {
    e.preventDefault();
    if (!comicData.coverImage) return alert("Vui lòng upload ảnh bìa!");
    try {
      if (editingComic) {
        await API.put(`/comics/${editingComic._id}`, comicData);
      } else {
        await API.post("/upload/create-comic", comicData);
      }
      setShowAddForm(false);
      setEditingComic(null);
      setComicData({ title: "", author: "", description: "", coverImage: "", genres: [] });
      fetchComics();
      fetchStats();
      alert("Lưu thành công");
    } catch (err) {
      alert("Lỗi xử lý truyện!");
    }
  };

  const handleEditComic = (comic) => {
    setEditingComic(comic);
    setComicData({
      title: comic.title,
      author: comic.author,
      description: comic.description,
      coverImage: comic.coverImage,
      genres: comic.genres.map(g => g._id || g)
    });
    setShowAddForm(true);
  };

  const handleDeleteComic = async (id) => {
    if (window.confirm("Xóa bộ truyện này?")) {
      await API.delete(`/comics/${id}`);
      setComics(comics.filter(c => c._id !== id));
      if (selectedComic?._id === id) setSelectedComic(null);
      fetchStats();
      alert("Lưu thành công");
    }
  };

  const handleCreateChapter = async (e) => {
    e.preventDefault();
    if (newChapter.files.length === 0) return alert("Chọn ảnh!");
    
    setIsUploading(true);
    try {
      const files = Array.from(newChapter.files);
      
      // 1. Lấy signature từ Backend (Để upload an toàn)
      const sigRes = await API.get("/upload/signature");
      const { signature, timestamp, cloudName, apiKey } = sigRes.data;

      console.log(`Bắt đầu upload trực tiếp ${files.length} ảnh lên Cloudinary...`);

      // 2. Upload song song tất cả ảnh TRỰC TIẾP lên Cloudinary
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp);
        formData.append("signature", signature);
        formData.append("folder", "comic_web");

        // Gọi trực tiếp API của Cloudinary
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData
        });
        
        const data = await res.json();
        if (data.secure_url) return data.secure_url;
        throw new Error(data.error?.message || "Lỗi upload ảnh");
      });

      const allImageUrls = await Promise.all(uploadPromises);

      console.log("Đã có tất cả link ảnh. Đang lưu chương vào Database...");

      // 3. Gửi danh sách link ảnh về backend để tạo chương
      await API.post("/upload/create-chapter", {
        comicId: showChapterForm,
        chapterNumber: Number(newChapter.chapterNumber),
        title: newChapter.title,
        pages: allImageUrls
      });

      alert("Lưu thành công");
      setShowChapterForm(null);
      setNewChapter({ chapterNumber: 1, title: "", files: [] });
      fetchComics();
      fetchStats();
    } catch (err) {
      console.error("Lỗi:", err);
      alert("Lỗi khi up chương: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (window.confirm("Xóa chương này?")) {
      try {
        await API.delete(`/comics/chapter/${chapterId}`);
        fetchComics();
        fetchStats();
        alert("Lưu thành công");
      } catch (err) {
        alert("Lỗi!");
      }
    }
  };

  // Lọc danh sách theo tìm kiếm
  const filteredComics = comics.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">ADMIN PANEL</div>
        <nav className="sidebar-nav">
          <Link to="/admin" className="sidebar-link">
            <i className="fas fa-chart-line"></i> Tổng quan
          </Link>
          <Link to="/admin/comics" className={`sidebar-link ${location.pathname === "/admin/comics" ? "active" : ""}`}>
            <i className="fas fa-book"></i> Quản lý truyện
          </Link>
          <Link to="/admin/users" className="sidebar-link">
            <i className="fas fa-users"></i> Quản lý người dùng
          </Link>
          <Link to="/admin/genres" className="sidebar-link">
            <i className="fas fa-tags"></i> Quản lý thể loại
          </Link>
          <Link to="/" className="sidebar-link" style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <i className="fas fa-home"></i> Quay lại Web
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Stats on top */}
        <div className="admin-stats-overview">
          <div className="stat-card stat-blue">
            <h3>Người dùng</h3>
            <p>{stats.totalUsers}</p>
          </div>
          <div className="stat-card stat-orange">
            <h3>Bộ truyện</h3>
            <p>{stats.totalComics}</p>
          </div>
          <div className="stat-card stat-green">
            <h3>Chương truyện</h3>
            <p>{stats.totalChapters}</p>
          </div>
          <div className="stat-card" style={{ backgroundColor: "#9b59b6", color: "#fff" }}>
            <h3>Lượt truy cập</h3>
            <p>{stats.visitCount?.toLocaleString() || 0}</p>
          </div>
        </div>

        <div className="admin-content-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ margin: 0 }}>Quản lý truyện</h2>
            <div style={{ display: "flex", gap: "15px" }}>
              <div className="admin-search-box" style={{ position: "relative", width: "250px" }}>
                <input 
                  type="text" 
                  className="admin-input" 
                  placeholder="Tìm tên hoặc tác giả..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: "35px", margin: 0 }}
                />
                <i className="fas fa-search" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#888" }}></i>
              </div>
              <button className="btn-admin btn-add" onClick={() => { setShowAddForm(!showAddForm); setEditingComic(null); setComicData({title: "", author: "", description: "", coverImage: "", genres: []}); }}>
                <i className="fas fa-plus"></i> {showAddForm ? "Đóng Form" : "Thêm truyện mới"}
              </button>
            </div>
          </div>

          {/* Form thêm/sửa */}
          {showAddForm && (
            <form onSubmit={handleSubmitComic} className="admin-form-group" style={{ background: "#f9f9f9", padding: "20px", borderRadius: "8px", marginBottom: "30px" }}>
              <h3>{editingComic ? "Chỉnh sửa truyện" : "Thêm truyện mới"}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <input className="admin-input" type="text" placeholder="Tiêu đề" required value={comicData.title} onChange={e => setComicData({...comicData, title: e.target.value})} />
                <input className="admin-input" type="text" placeholder="Tác giả" required value={comicData.author} onChange={e => setComicData({...comicData, author: e.target.value})} />
              </div>
              <textarea className="admin-input" style={{ marginTop: "15px", minHeight: "100px" }} placeholder="Mô tả" required value={comicData.description} onChange={e => setComicData({...comicData, description: e.target.value})} />
              <div style={{ marginTop: "15px" }}>
                <label>Ảnh bìa: </label>
                <input type="file" onChange={handleUploadCover} accept="image/*" />
              </div>
              <div style={{ marginTop: "15px" }}>
                <label>Thể loại: </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
                  {genres.map(g => (
                    <label key={g._id} style={{ background: "#eee", padding: "5px 10px", borderRadius: "15px", cursor: "pointer", fontSize: "0.85rem" }}>
                      <input type="checkbox" checked={comicData.genres.includes(g._id)} onChange={e => {
                        const selected = [...comicData.genres];
                        if (e.target.checked) selected.push(g._id);
                        else { const idx = selected.indexOf(g._id); if (idx > -1) selected.splice(idx, 1); }
                        setComicData({ ...comicData, genres: selected });
                      }} /> {g.name}
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={isUploading} className="btn-admin btn-add" style={{ marginTop: "20px", width: "100%", justifyContent: "center", padding: "12px" }}>
                {isUploading ? "ĐANG XỬ LÝ..." : "LƯU TRUYỆN"}
              </button>
            </form>
          )}

          {/* Chi tiết truyện (Chương) */}
          {selectedComic && (
            <div style={{ background: "#eef2f7", padding: "20px", borderRadius: "10px", marginBottom: "30px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: "15px" }}>
                  <img src={selectedComic.coverImage} alt="" style={{ width: "80px", height: "110px", objectFit: "cover", borderRadius: "6px" }} />
                  <div>
                    <h3 style={{ margin: 0 }}>{selectedComic.title}</h3>
                    <p style={{ margin: "5px 0" }}>{selectedComic.chapters?.length || 0} chương</p>
                    <button className="btn-admin btn-add" onClick={() => setShowChapterForm(selectedComic._id)}>Thêm chương</button>
                  </div>
                </div>
                <button onClick={() => setSelectedComic(null)} style={{ border: "none", background: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
              </div>
              <div className="admin-list" style={{ marginTop: "20px" }}>
                {selectedComic.chapters?.sort((a,b) => a.chapterNumber - b.chapterNumber).map(chap => (
                  <div key={chap._id} className="admin-list-item" style={{ padding: "10px 15px", background: "#fff" }}>
                    <span>Chương {chap.chapterNumber}: {chap.title}</span>
                    <button className="btn-admin btn-delete" onClick={() => handleDeleteChapter(chap._id)}>Xóa</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Danh sách truyện dạng list dọc */}
          <div className="admin-list">
            {filteredComics.length > 0 ? (
              filteredComics.map((comic) => (
                <div key={comic._id} className="admin-list-item">
                  <div className="item-info">
                    <img src={comic.coverImage} alt="" style={{ width: "45px", height: "60px", objectFit: "cover", borderRadius: "4px" }} />
                    <div>
                      <div className="item-title">{comic.title}</div>
                      <div style={{ fontSize: "0.8rem", color: "#888" }}>{comic.author} • {comic.chapters?.length || 0} chương</div>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button className="btn-admin btn-info" onClick={() => { setSelectedComic(comic); window.scrollTo(0,0); }}>
                      <i className="fas fa-eye"></i> Xem
                    </button>
                    <button className="btn-admin btn-edit" onClick={() => handleEditComic(comic)}>
                      <i className="fas fa-edit"></i> Sửa
                    </button>
                    <button className="btn-admin btn-delete" onClick={() => handleDeleteComic(comic._id)}>
                      <i className="fas fa-trash"></i> Xóa
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: "center", padding: "20px", color: "#888" }}>Không tìm thấy truyện nào.</p>
            )}
          </div>
        </div>
      </main>

      {/* Modal Thêm Chương */}
      {showChapterForm && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <form onSubmit={handleCreateChapter} style={{ background: "#fff", padding: "30px", borderRadius: "10px", width: "450px", display: "grid", gap: "15px" }}>
            <h2>Thêm chương</h2>
            <input className="admin-input" type="number" required placeholder="Số chương" value={newChapter.chapterNumber} onChange={e => setNewChapter({...newChapter, chapterNumber: e.target.value})} />
            <input className="admin-input" type="text" placeholder="Tiêu đề (không bắt buộc)" value={newChapter.title} onChange={e => setNewChapter({...newChapter, title: e.target.value})} />
            <input type="file" multiple accept="image/*" required onChange={e => setNewChapter({...newChapter, files: e.target.files})} />
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" disabled={isUploading} className="btn-admin btn-add" style={{ flex: 1, justifyContent: "center" }}>{isUploading ? "ĐANG LƯU..." : "LƯU CHƯƠNG"}</button>
              <button type="button" onClick={() => setShowChapterForm(null)} className="btn-admin btn-delete" style={{ flex: 1, justifyContent: "center" }}>HỦY</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminComics;