import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminComics() {
  const [comics, setComics] = useState([]);
  const [genres, setGenres] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showChapterForm, setShowChapterForm] = useState(null); 
  const [selectedComic, setSelectedComic] = useState(null); 
  const [editingComic, setEditingComic] = useState(null);
  const navigate = useNavigate();

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
  }, []);

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
      alert("Upload thành công!");
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
    window.scrollTo(0, 0);
  };

  const handleDeleteComic = async (id) => {
    if (window.confirm("Xóa bộ truyện này?")) {
      await API.delete(`/comics/${id}`);
      setComics(comics.filter(c => c._id !== id));
      if (selectedComic?._id === id) setSelectedComic(null);
    }
  };

  const handleCreateChapter = async (e) => {
    e.preventDefault();
    if (newChapter.files.length === 0) return alert("Chọn ảnh!");
    setIsUploading(true);
    try {
      const files = Array.from(newChapter.files);
      const chunkSize = 15;
      let allImageUrls = [];
      for (let i = 0; i < files.length; i += chunkSize) {
        const chunk = files.slice(i, i + chunkSize);
        const formData = new FormData();
        chunk.forEach(file => formData.append("images", file));
        const res = await API.post("/upload/chapter-pages", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        allImageUrls = [...allImageUrls, ...res.data.imageUrls];
      }
      await API.post("/upload/create-chapter", {
        comicId: showChapterForm,
        chapterNumber: Number(newChapter.chapterNumber),
        title: newChapter.title,
        pages: allImageUrls
      });
      alert("Thêm chương thành công!");
      setShowChapterForm(null);
      setNewChapter({ chapterNumber: 1, title: "", files: [] });
      fetchComics();
    } catch (err) {
      alert("Lỗi!");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (window.confirm("Xóa chương này?")) {
      try {
        await API.delete(`/comics/chapter/${chapterId}`);
        fetchComics();
      } catch (err) {
        alert("Lỗi!");
      }
    }
  };

  // Logic nút quay lại thông minh
  const handleBack = () => {
    if (selectedComic) {
      setSelectedComic(null); // Đang xem chi tiết thì đóng lại quay về danh sách
    } else if (showAddForm) {
      setShowAddForm(false); // Đang mở form thêm thì đóng form
    } else {
      navigate("/admin"); // Đang ở danh sách thì về Dashboard
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <button 
        onClick={handleBack} 
        style={{ marginBottom: "20px", padding: "10px 15px", background: "#eee", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "1.2rem" }}
      >
        ←
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", alignItems: "center" }}>
        <h1>Quản lý truyện</h1>
        <button onClick={() => { setShowAddForm(!showAddForm); setEditingComic(null); setComicData({title: "", author: "", description: "", coverImage: "", genres: []}); }} style={{ padding: "10px 20px", background: "#27ae60", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
          {showAddForm ? "Hủy" : "+ Thêm truyện mới"}
        </button>
      </div>

      {/* FORM THÊM/SỬA TRUYỆN */}
      {showAddForm && (
        <form onSubmit={handleSubmitComic} style={{ background: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "30px", display: "grid", gap: "15px" }}>
          <h3>{editingComic ? `Sửa: ${editingComic.title}` : "Truyện mới"}</h3>
          <input type="text" placeholder="Tiêu đề" required value={comicData.title} onChange={e => setComicData({...comicData, title: e.target.value})} style={{ padding: "10px" }} />
          <input type="text" placeholder="Tác giả" required value={comicData.author} onChange={e => setComicData({...comicData, author: e.target.value})} style={{ padding: "10px" }} />
          <textarea placeholder="Mô tả" required value={comicData.description} onChange={e => setComicData({...comicData, description: e.target.value})} style={{ padding: "10px", minHeight: "100px" }} />
          <div>
            <label>Ảnh bìa: </label>
            <input type="file" onChange={handleUploadCover} accept="image/*" />
            {comicData.coverImage && <img src={comicData.coverImage} alt="" style={{ width: "100px", marginTop: "10px", display: "block", borderRadius: "4px" }} />}
          </div>
          <div>
            <label>Thể loại: </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
              {genres.map(g => (
                <label key={g._id} style={{ background: "#eee", padding: "5px 10px", borderRadius: "15px", cursor: "pointer", fontSize: "0.9rem" }}>
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
          <button type="submit" disabled={isUploading} style={{ padding: "15px", background: "#3498db", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
            {isUploading ? "ĐANG XỬ LÝ..." : "LƯU TRUYỆN"}
          </button>
        </form>
      )}

      {/* CHI TIẾT TRUYỆN */}
      {selectedComic && (
        <div style={{ background: "#fff", padding: "25px", borderRadius: "10px", border: "2px solid #3498db", marginBottom: "30px", position: "relative" }}>
          <button onClick={() => setSelectedComic(null)} style={{ position: "absolute", top: "10px", right: "10px", border: "none", background: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
          <div style={{ display: "flex", gap: "20px" }}>
            <img src={selectedComic.coverImage} alt="" style={{ width: "120px", height: "160px", objectFit: "cover", borderRadius: "8px" }} />
            <div>
              <h2 style={{ margin: "0 0 10px 0" }}>{selectedComic.title}</h2>
              <p><strong>Tác giả:</strong> {selectedComic.author}</p>
              <button onClick={() => setShowChapterForm(selectedComic._id)} style={{ padding: "10px 20px", background: "#2ecc71", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>+ Thêm chương</button>
            </div>
          </div>
          <h3 style={{ marginTop: "30px", borderTop: "1px solid #eee", paddingTop: "20px" }}>Danh sách chương</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px", marginTop: "15px" }}>
            {selectedComic.chapters?.sort((a,b) => a.chapterNumber - b.chapterNumber).map(chap => (
              <div key={chap._id} style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f9f9f9" }}>
                <span>Chương {chap.chapterNumber}</span>
                <button onClick={() => handleDeleteChapter(chap._id)} style={{ padding: "3px 8px", background: "#e74c3c", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>Xóa</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DANH SÁCH TRUYỆN */}
      <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
        <thead>
          <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
            <th style={{ padding: "15px", border: "1px solid #ddd" }}>Ảnh</th>
            <th style={{ padding: "15px", border: "1px solid #ddd" }}>Tên truyện</th>
            <th style={{ padding: "15px", border: "1px solid #ddd" }}>Tác giả</th>
            <th style={{ padding: "15px", border: "1px solid #ddd", textAlign: "center" }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {comics.map((comic) => (
            <tr key={comic._id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "10px", textAlign: "center", width: "80px" }}>
                <img src={comic.coverImage} alt="" style={{ width: "50px", height: "70px", objectFit: "cover", borderRadius: "4px" }} />
              </td>
              <td 
                style={{ padding: "15px", fontWeight: "bold", color: "#3498db", cursor: "pointer" }}
                onClick={() => { setSelectedComic(comic); window.scrollTo(0, 0); }}
              >
                {comic.title} <span style={{ fontWeight: "normal", color: "#999", fontSize: "0.8rem" }}>({comic.chapters?.length || 0})</span>
              </td>
              <td style={{ padding: "15px" }}>{comic.author}</td>
              <td style={{ padding: "15px", textAlign: "center" }}>
                <button onClick={() => handleEditComic(comic)} style={{ marginRight: "10px", padding: "5px 12px", background: "#f39c12", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>Sửa</button>
                <button onClick={() => handleDeleteComic(comic._id)} style={{ color: "#fff", backgroundColor: "#e74c3c", border: "none", padding: "5px 12px", borderRadius: "4px", cursor: "pointer" }}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL THÊM CHƯƠNG */}
      {showChapterForm && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <form onSubmit={handleCreateChapter} style={{ background: "#fff", padding: "30px", borderRadius: "10px", width: "450px", display: "grid", gap: "15px" }}>
            <h2>Thêm chương</h2>
            <input type="number" required placeholder="Số chương" value={newChapter.chapterNumber} onChange={e => setNewChapter({...newChapter, chapterNumber: e.target.value})} style={{ padding: "10px" }} />
            <input type="text" placeholder="Tiêu đề (không bắt buộc)" value={newChapter.title} onChange={e => setNewChapter({...newChapter, title: e.target.value})} style={{ padding: "10px" }} />
            <input type="file" multiple accept="image/*" required onChange={e => setNewChapter({...newChapter, files: e.target.files})} style={{ padding: "10px" }} />
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" disabled={isUploading} style={{ flex: 1, padding: "12px", background: "#27ae60", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>{isUploading ? "ĐANG LƯU..." : "LƯU CHƯƠNG"}</button>
              <button type="button" onClick={() => setShowChapterForm(null)} style={{ flex: 1, padding: "12px", background: "#e74c3c", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>HỦY</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminComics;