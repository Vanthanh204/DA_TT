import { useEffect, useState } from "react";
import API from "../services/api";

function AdminComics() {
  const [comics, setComics] = useState([]);
  const [genres, setGenres] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showChapterForm, setShowChapterForm] = useState(null); 

  const [newComic, setNewComic] = useState({
    title: "",
    author: "",
    description: "",
    coverImage: "",
    genres: []
  });

  const [newChapter, setNewChapter] = useState({
    chapterNumber: 1,
    title: "",
    files: [] // Lưu danh sách file ảnh chọn từ máy
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
      setNewComic({ ...newComic, coverImage: res.data.imageUrl });
      alert("Upload ảnh bìa thành công!");
    } catch (err) {
      alert("Lỗi upload ảnh bìa!");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateComic = async (e) => {
    e.preventDefault();
    if (!newComic.coverImage) return alert("Vui lòng upload ảnh bìa trước!");
    try {
      await API.post("/upload/create-comic", newComic);
      alert("Tạo truyện thành công!");
      setShowAddForm(false);
      fetchComics();
    } catch (err) {
      alert("Lỗi tạo truyện!");
    }
  };

  const handleCreateChapter = async (e) => {
    e.preventDefault();
    if (newChapter.files.length === 0) return alert("Vui lòng chọn ảnh cho chương!");

    setIsUploading(true);
    try {
      // 1. Upload tất cả ảnh lên Cloudinary
      const formData = new FormData();
      for (let i = 0; i < newChapter.files.length; i++) {
        formData.append("images", newChapter.files[i]);
      }

      const uploadRes = await API.post("/upload/chapter-pages", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const imageUrls = uploadRes.data.imageUrls;

      // 2. Tạo chương với danh sách link ảnh vừa nhận được
      await API.post("/upload/create-chapter", {
        comicId: showChapterForm,
        chapterNumber: newChapter.chapterNumber,
        title: newChapter.title,
        pages: imageUrls
      });

      alert("Thêm chương thành công!");
      setShowChapterForm(null);
      setNewChapter({ chapterNumber: 1, title: "", files: [] });
      fetchComics();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thêm chương!");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa bộ truyện này?")) {
      await API.delete(`/comics/${id}`);
      setComics(comics.filter(c => c._id !== id));
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h1>Quản lý truyện</h1>
        <button onClick={() => setShowAddForm(!showAddForm)} style={{ padding: "10px 20px", background: "#27ae60", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          {showAddForm ? "Hủy" : "Thêm truyện mới"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateComic} style={{ background: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "30px", display: "grid", gap: "15px" }}>
          <h3>Thông tin truyện mới</h3>
          <input type="text" placeholder="Tiêu đề truyện" required onChange={e => setNewComic({...newComic, title: e.target.value})} style={{ padding: "10px" }} />
          <input type="text" placeholder="Tác giả" required onChange={e => setNewComic({...newComic, author: e.target.value})} style={{ padding: "10px" }} />
          <textarea placeholder="Mô tả" required onChange={e => setNewComic({...newComic, description: e.target.value})} style={{ padding: "10px", minHeight: "100px" }} />
          
          <div>
            <label>Ảnh bìa: </label>
            <input type="file" onChange={handleUploadCover} accept="image/*" />
            {newComic.coverImage && <img src={newComic.coverImage} alt="Cover" style={{ width: "100px", marginTop: "10px", display: "block" }} />}
          </div>

          <div>
            <label>Thể loại: </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
              {genres.map(g => (
                <label key={g._id} style={{ background: "#eee", padding: "5px 10px", borderRadius: "15px", cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    value={g._id} 
                    onChange={e => {
                      const selected = [...newComic.genres];
                      if (e.target.checked) selected.push(g._id);
                      else {
                        const index = selected.indexOf(g._id);
                        selected.splice(index, 1);
                      }
                      setNewComic({ ...newComic, genres: selected });
                    }} 
                  /> {g.name}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={isUploading} style={{ padding: "15px", background: "#3498db", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
            {isUploading ? "ĐANG TẢI ẢNH..." : "LƯU TRUYỆN MỚI"}
          </button>
        </form>
      )}

      {showChapterForm && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <form onSubmit={handleCreateChapter} style={{ background: "#fff", padding: "30px", borderRadius: "10px", width: "500px", display: "grid", gap: "15px" }}>
            <h2>Thêm chương mới</h2>
            <div style={{ display: "grid", gap: "5px" }}>
              <label>Chương số:</label>
              <input type="number" required value={newChapter.chapterNumber} onChange={e => setNewChapter({...newChapter, chapterNumber: e.target.value})} style={{ padding: "10px" }} />
            </div>
            <div style={{ display: "grid", gap: "5px" }}>
              <label>Tiêu đề chương:</label>
              <input type="text" placeholder="Ví dụ: Khởi đầu mới" value={newChapter.title} onChange={e => setNewChapter({...newChapter, title: e.target.value})} style={{ padding: "10px" }} />
            </div>
            <div style={{ display: "grid", gap: "5px" }}>
              <label>Chọn các trang truyện (có thể chọn nhiều file):</label>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                required 
                onChange={e => setNewChapter({...newChapter, files: e.target.files})} 
                style={{ padding: "10px", border: "1px dashed #ccc" }} 
              />
              <p style={{ fontSize: "0.8rem", color: "#666" }}>Đã chọn: {newChapter.files.length} ảnh</p>
            </div>
            
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button type="submit" disabled={isUploading} style={{ flex: 1, padding: "12px", background: "#27ae60", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
                {isUploading ? "ĐANG UPLOAD..." : "LƯU CHƯƠNG"}
              </button>
              <button type="button" onClick={() => setShowChapterForm(null)} style={{ flex: 1, padding: "12px", background: "#e74c3c", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                HỦY
              </button>
            </div>
          </form>
        </div>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "8px", overflow: "hidden" }}>
        <thead>
          <tr style={{ backgroundColor: "#f4f4f4" }}>
            <th style={{ padding: "15px", border: "1px solid #ddd" }}>Ảnh</th>
            <th style={{ padding: "15px", border: "1px solid #ddd" }}>Tên truyện</th>
            <th style={{ padding: "15px", border: "1px solid #ddd" }}>Tác giả</th>
            <th style={{ padding: "15px", border: "1px solid #ddd" }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {comics.map((comic) => (
            <tr key={comic._id}>
              <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>
                <img src={comic.coverImage} alt="Cover" style={{ width: "60px", height: "80px", objectFit: "cover", borderRadius: "4px" }} />
              </td>
              <td style={{ padding: "15px", border: "1px solid #ddd", fontWeight: "bold" }}>{comic.title}</td>
              <td style={{ padding: "15px", border: "1px solid #ddd" }}>{comic.author}</td>
              <td style={{ padding: "15px", border: "1px solid #ddd", textAlign: "center" }}>
                <button onClick={() => setShowChapterForm(comic._id)} style={{ marginRight: "10px", padding: "8px 15px", background: "#3498db", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>+ Chương</button>
                <button 
                  onClick={() => handleDelete(comic._id)}
                  style={{ color: "#fff", backgroundColor: "#e74c3c", border: "none", padding: "8px 15px", borderRadius: "4px", cursor: "pointer" }}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminComics;