import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "../styles/home.css"; // Tận dụng grid style

function History() {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user ? (user._id || user.id) : "guest";
      
      const historyKey = `all_read_history_${userId}`;
      const savedHistory = JSON.parse(localStorage.getItem(historyKey)) || [];

      if (savedHistory.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const ids = savedHistory.map(item => item.comicId);
        const res = await API.post("/comics/by-ids", { ids });
        
        // Gộp dữ liệu từ API và dữ liệu chương đã đọc từ localStorage
        const enrichedHistory = savedHistory.map(h => {
          const comic = res.data.find(c => c._id === h.comicId);
          return comic ? { ...h, comic } : null;
        }).filter(item => item !== null);

        setHistoryItems(enrichedHistory);
      } catch (err) {
        console.error("Lỗi lấy lịch sử:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const clearHistory = () => {
    if (window.confirm("Bạn có muốn xóa toàn bộ lịch sử đọc truyện?")) {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user ? (user._id || user.id) : "guest";
      localStorage.removeItem(`all_read_history_${userId}`);
      setHistoryItems([]);
    }
  };

  return (
    <div className="home-container">
      <div className="section-header-flex" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h2 className="section-title" style={{margin: 0}}>Lịch sử đọc truyện</h2>
        {historyItems.length > 0 && (
          <button onClick={clearHistory} className="btn-clear-history" style={{background: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer'}}>
            Xóa lịch sử
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading">Đang tải lịch sử...</div>
      ) : historyItems.length > 0 ? (
        <div className="comic-grid">
          {historyItems.map((item) => (
            <div key={item.comicId} className="history-card" style={{background: '#222', borderRadius: '8px', overflow: 'hidden', transition: '0.3s'}}>
              <Link to={`/comic/${item.comicId}`}>
                <img src={item.comic.coverImage} alt={item.comic.title} style={{width: '100%', height: '250px', objectFit: 'cover'}} />
              </Link>
              <div style={{padding: '12px'}}>
                <Link to={`/comic/${item.comicId}`} style={{textDecoration: 'none', color: 'white'}}>
                  <h3 style={{fontSize: '1rem', margin: '0 0 8px 0', height: '2.4rem', overflow: 'hidden'}}>{item.comic.title}</h3>
                </Link>
                <div style={{fontSize: '0.85rem', color: '#3498db', marginBottom: '8px'}}>
                   Đã đọc đến Chương {item.chapterNumber}
                </div>
                <Link to={`/reading/${item.chapterId}`} className="btn-read-now" style={{display: 'block', textAlign: 'center', background: '#3498db', color: 'white', textDecoration: 'none', padding: '6px', borderRadius: '4px', fontSize: '0.9rem'}}>
                  Đọc tiếp
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-results">Bạn chưa đọc bộ truyện nào.</div>
      )}
    </div>
  );
}

export default History;