import { useState, useEffect } from "react";
import API from "../services/api";
import "../styles/admin.css";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("stats");
  const [stats, setStats] = useState({ totalUsers: 0, totalComics: 0, totalChapters: 0 });
  const [users, setUsers] = useState([]);
  const [comics, setComics] = useState([]);
  const [genres, setGenres] = useState([]);

  // Data for editing/adding
  const [editingUser, setEditingUser] = useState(null);
  const [editingComic, setEditingComic] = useState(null);
  const [editingGenre, setEditingGenre] = useState(null);
  
  const [comicData, setComicData] = useState({ title: "", description: "", author: "", genres: [] });
  const [genreData, setGenreData] = useState({ name: "", description: "" });
  const [coverFile, setCoverFile] = useState(null);
  
  const [chapterData, setChapterData] = useState({ comicId: "", chapterNumber: "", title: "" });
  const [pageFiles, setPageFiles] = useState([]);

  useEffect(() => {
    fetchGenres();
    if (activeTab === "stats") fetchStats();
    if (activeTab === "users") fetchUsers();
    if (activeTab === "comics") fetchComics();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await API.get("/admin/stats");
      setStats(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchComics = async () => {
    try {
      const res = await API.get("/comics");
      setComics(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchGenres = async () => {
    try {
      const res = await API.get("/genres");
      setGenres(res.data);
    } catch (err) { console.error(err); }
  };

  // ---- GENRE ACTIONS ----
  const handleCreateGenre = async (e) => {
    e.preventDefault();
    try {
      await API.post("/genres", genreData);
      alert("Thêm thể loại thành công!");
      setGenreData({ name: "", description: "" });
      fetchGenres();
    } catch (err) { alert("Lỗi thêm thể loại!"); }
  };

  const handleUpdateGenre = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/genres/${editingGenre._id}`, editingGenre);
      alert("Cập nhật thành công!");
      setEditingGenre(null);
      fetchGenres();
    } catch (err) { alert("Lỗi cập nhật!"); }
  };

  const handleDeleteGenre = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thể loại này?")) return;
    try {
      await API.delete(`/genres/${id}`);
      fetchGenres();
    } catch (err) { alert("Lỗi xóa thể loại!"); }
  };

  // ---- USER ACTIONS ----
  const handleUpdateUser = async (userId) => {
    try {
      await API.put(`/users/${userId}`, editingUser);
      alert("Cập nhật người dùng thành công!");
      setEditingUser(null);
      fetchUsers();
    } catch (err) { alert("Lỗi: " + err.message); }
  };

  const handleToggleLock = async (userId) => {
    try {
      const res = await API.patch(`/users/${userId}/status`);
      alert(res.data.message);
      fetchUsers();
    } catch (err) { alert("Lỗi khi khóa/mở khóa!"); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
    try {
      await API.delete(`/users/${userId}`);
      fetchUsers();
      fetchStats();
    } catch (err) { alert("Lỗi: " + err.message); }
  };

  // ---- COMIC ACTIONS ----
  const handleGenreChange = (genreId, isChecked) => {
    if (editingComic) {
      const currentGenres = editingComic.genres || [];
      const updatedGenres = isChecked 
        ? [...currentGenres, genreId]
        : currentGenres.filter(id => (typeof id === 'string' ? id : id._id) !== genreId);
      setEditingComic({ ...editingComic, genres: updatedGenres });
    } else {
      const currentGenres = comicData.genres || [];
      const updatedGenres = isChecked 
        ? [...currentGenres, genreId]
        : currentGenres.filter(id => id !== genreId);
      setComicData({ ...comicData, genres: updatedGenres });
    }
  };

  const handleCreateComic = async (e) => {
    e.preventDefault();
    try {
      let coverUrl = "";
      if (coverFile) {
        const formData = new FormData();
        formData.append("image", coverFile);
        const uploadRes = await API.post("/upload/comic-cover", formData);
        coverUrl = uploadRes.data.imageUrl;
      }
      
      await API.post("/upload/create-comic", { 
        ...comicData, 
        coverImage: coverUrl
      });
      alert("Tạo truyện thành công!");
      setComicData({ title: "", description: "", author: "", genres: [] });
      setCoverFile(null);
      fetchComics();
      fetchStats();
    } catch (err) { alert("Lỗi tạo truyện!"); }
  };

  const handleUpdateComic = async (e) => {
    e.preventDefault();
    try {
      let updateData = { ...editingComic };
      
      if (coverFile) {
        const formData = new FormData();
        formData.append("image", coverFile);
        const uploadRes = await API.post("/upload/comic-cover", formData);
        updateData.coverImage = uploadRes.data.imageUrl;
      }

      // Đảm bảo genres là mảng ID
      updateData.genres = updateData.genres.map(g => typeof g === 'string' ? g : g._id);

      await API.put(`/comics/${editingComic._id}`, updateData);
      alert("Cập nhật truyện thành công!");
      setEditingComic(null);
      setCoverFile(null);
      fetchComics();
    } catch (err) { alert("Lỗi cập nhật!"); }
  };

  const handleDeleteComic = async (id) => {
    if (!window.confirm("Xóa truyện này sẽ xóa TẤT CẢ chương liên quan. Bạn chắc chứ?")) return;
    try {
      await API.delete(`/comics/${id}`);
      fetchComics();
      fetchStats();
    } catch (err) { alert("Lỗi xóa truyện!"); }
  };

  // ---- CHAPTER ACTIONS ----
  const handleCreateChapter = async (e) => {
    e.preventDefault();
    if (!chapterData.comicId) return alert("Vui lòng chọn truyện!");
    try {
      const formData = new FormData();
      for (let i = 0; i < pageFiles.length; i++) formData.append("images", pageFiles[i]);
      
      const uploadRes = await API.post("/upload/chapter-pages", formData);
      const pageUrls = uploadRes.data.imageUrls;
      
      await API.post("/upload/create-chapter", { ...chapterData, pages: pageUrls });
      alert("Tạo chương thành công!");
      setChapterData({ comicId: "", chapterNumber: "", title: "" });
      setPageFiles([]);
      fetchStats();
    } catch (err) { alert("Lỗi tạo chương!"); }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm("Bạn có chắc muốn xóa chương này?")) return;
    try {
      await API.delete(`/comics/chapter/${chapterId}`);
      alert("Xóa chương thành công!");
      fetchComics();
      fetchStats();
    } catch (err) { alert("Lỗi xóa chương!"); }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <h2>Admin Panel</h2>
        <button className={activeTab === "stats" ? "active" : ""} onClick={() => setActiveTab("stats")}>📊 Thống kê</button>
        <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>👥 Người dùng</button>
        <button className={activeTab === "genres" ? "active" : ""} onClick={() => setActiveTab("genres")}>🏷️ Thể loại</button>
        <button className={activeTab === "comics" ? "active" : ""} onClick={() => setActiveTab("comics")}>📚 Quản lý truyện</button>
        <button className={activeTab === "chapters" ? "active" : ""} onClick={() => setActiveTab("chapters")}>📖 Thêm chương</button>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        {activeTab === "stats" && (
          <div className="stats-grid">
            <div className="stat-card"><h3>Người dùng</h3><p>{stats.totalUsers}</p></div>
            <div className="stat-card"><h3>Truyện</h3><p>{stats.totalComics}</p></div>
            <div className="stat-card"><h3>Chương</h3><p>{stats.totalChapters}</p></div>
          </div>
        )}

        {activeTab === "genres" && (
          <div className="admin-section">
            <h2>{editingGenre ? "Sửa Thể Loại" : "Thêm Thể Loại"}</h2>
            <form className="admin-form" onSubmit={editingGenre ? handleUpdateGenre : handleCreateGenre}>
              <input type="text" placeholder="Tên thể loại" 
                value={editingGenre ? editingGenre.name : genreData.name} 
                onChange={e => editingGenre ? setEditingGenre({...editingGenre, name: e.target.value}) : setGenreData({...genreData, name: e.target.value})} required />
              <textarea placeholder="Mô tả" 
                value={editingGenre ? editingGenre.description : genreData.description} 
                onChange={e => editingGenre ? setEditingGenre({...editingGenre, description: e.target.value}) : setGenreData({...genreData, description: e.target.value})} />
              <div className="form-btns">
                <button type="submit">{editingGenre ? "Cập nhật" : "Thêm"}</button>
                {editingGenre && <button type="button" onClick={() => setEditingGenre(null)} className="btn-cancel">Hủy</button>}
              </div>
            </form>

            <h2 style={{marginTop: "40px"}}>Danh sách Thể Loại</h2>
            <table className="admin-table">
              <thead><tr><th>Tên</th><th>Mô tả</th><th>Hành động</th></tr></thead>
              <tbody>
                {genres.map(g => (
                  <tr key={g._id}>
                    <td>{g.name}</td>
                    <td>{g.description}</td>
                    <td>
                      <button onClick={() => setEditingGenre(g)}>Sửa</button>
                      <button onClick={() => handleDeleteGenre(g._id)} className="btn-delete">Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "users" && (
          <div className="admin-section">
            <h2>Quản lý Người dùng</h2>
            <table className="admin-table">
              <thead>
                <tr><th>Tên</th><th>Email</th><th>Role</th><th>Trạng thái</th><th>Hành động</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>
                       <span className={u.isLocked ? "status-locked" : "status-active"}>
                         {u.isLocked ? "Đã khóa" : "Hoạt động"}
                       </span>
                    </td>
                    <td>
                      <button onClick={() => setEditingUser(u)}>Sửa</button>
                      <button onClick={() => handleToggleLock(u._id)} className={u.isLocked ? "btn-unlock" : "btn-lock"}>
                        {u.isLocked ? "Mở khóa" : "Khóa"}
                      </button>
                      <button onClick={() => handleDeleteUser(u._id)} className="btn-delete">Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {editingUser && (
              <div className="edit-modal">
                <div className="modal-content">
                  <h3>Sửa người dùng: {editingUser.username}</h3>
                  <label>Level:</label>
                  <input type="number" value={editingUser.level} onChange={e => setEditingUser({...editingUser, level: e.target.value})} />
                  <label>Quyền:</label>
                  <select value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value})}>
                     <option value="user">User</option>
                     <option value="admin">Admin</option>
                  </select>
                  <div className="modal-btns">
                    <button onClick={() => handleUpdateUser(editingUser._id)}>Lưu</button>
                    <button onClick={() => setEditingUser(null)} className="btn-cancel">Hủy</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "comics" && (
          <div className="admin-section">
             <h2>{editingComic ? "Sửa Truyện" : "Thêm Truyện Mới"}</h2>
             <form className="admin-form" onSubmit={editingComic ? handleUpdateComic : handleCreateComic}>
                <input type="text" placeholder="Tên truyện" 
                  value={editingComic ? editingComic.title : comicData.title} 
                  onChange={e => editingComic ? setEditingComic({...editingComic, title: e.target.value}) : setComicData({...comicData, title: e.target.value})} required />
                
                <textarea placeholder="Mô tả" 
                  value={editingComic ? editingComic.description : comicData.description} 
                  onChange={e => editingComic ? setEditingComic({...editingComic, description: e.target.value}) : setComicData({...comicData, description: e.target.value})} />
                
                <input type="text" placeholder="Tác giả" 
                  value={editingComic ? editingComic.author : comicData.author} 
                  onChange={e => editingComic ? setEditingComic({...editingComic, author: e.target.value}) : setComicData({...comicData, author: e.target.value})} />
                
                <div className="genres-selection">
                  <label>Chọn thể loại:</label>
                  <div className="genres-grid">
                    {genres.map(g => (
                      <label key={g._id} className="genre-checkbox">
                        <input 
                          type="checkbox" 
                          checked={editingComic 
                            ? editingComic.genres.some(genre => (typeof genre === 'string' ? genre : genre._id) === g._id)
                            : comicData.genres.includes(g._id)}
                          onChange={(e) => handleGenreChange(g._id, e.target.checked)}
                        />
                        {g.name}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="file-input">
                  <label>Ảnh bìa (để trống nếu không đổi):</label>
                  <input type="file" onChange={e => setCoverFile(e.target.files[0])} />
                </div>

                <div className="form-btns">
                  <button type="submit">{editingComic ? "Cập nhật" : "Tạo truyện"}</button>
                  {editingComic && <button type="button" onClick={() => {setEditingComic(null); setCoverFile(null);}} className="btn-cancel">Hủy Sửa</button>}
                </div>
             </form>

             <h2 style={{marginTop: "40px"}}>Danh sách Truyện</h2>
             <table className="admin-table">
               <thead><tr><th>Bìa</th><th>Tên truyện</th><th>Thể loại</th><th>Hành động</th></tr></thead>
               <tbody>
                 {comics.map(c => (
                   <tr key={c._id}>
                     <td><img src={c.coverImage} alt="" style={{width: "50px", height: "70px", objectFit: "cover"}} /></td>
                     <td>{c.title}</td>
                     <td>{c.genres?.map(g => g.name).join(", ")}</td>
                     <td>
                       <button onClick={() => setEditingComic({...c, genres: c.genres || []})}>Sửa</button>
                       <button onClick={() => handleDeleteComic(c._id)} className="btn-delete">Xóa</button>
                       <details>
                         <summary>Xem chương</summary>
                         <ul className="chapter-list-admin">
                           {c.chapters?.map(ch => (
                             <li key={ch._id}>
                               Chương {ch.chapterNumber} 
                               <button onClick={() => handleDeleteChapter(ch._id)} className="btn-small-delete">Xóa</button>
                             </li>
                           ))}
                         </ul>
                       </details>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}

        {activeTab === "chapters" && (
          <div className="admin-section">
            <h2>Thêm Chương Mới</h2>
            <form className="admin-form" onSubmit={handleCreateChapter}>
              <select value={chapterData.comicId} onChange={(e) => setChapterData({...chapterData, comicId: e.target.value})} required>
                <option value="">Chọn truyện</option>
                {comics.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
              <input type="number" placeholder="Số chương" value={chapterData.chapterNumber} onChange={(e) => setChapterData({...chapterData, chapterNumber: e.target.value})} required />
              <input type="text" placeholder="Tên chương (tùy chọn)" value={chapterData.title} onChange={(e) => setChapterData({...chapterData, title: e.target.value})} />
              <div className="file-input">
                <label>Chọn các trang truyện (nhiều ảnh):</label>
                <input type="file" multiple onChange={(e) => setPageFiles(e.target.files)} required />
              </div>
              <button type="submit">Tạo chương</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;