import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import API from "../services/api";
import ComicCard from "../components/ComicCard";
import "../styles/home.css"; // Dùng chung style với Home cho danh sách truyện

function Search() {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      // Lấy các tham số từ URL ngay bên trong useEffect
      const searchParams = new URLSearchParams(location.search);
      const queryParam = searchParams.get("q");
      const genreIdParam = searchParams.get("genre");

      try {
        let url = "/comics/search?";
        if (queryParam) url += `q=${encodeURIComponent(queryParam)}`;
        if (genreIdParam) {
          if (queryParam) url += "&";
          url += `genre=${genreIdParam}`;
        }
        
        const res = await API.get(url);
        setComics(res.data);
      } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [location.search]); // Lắng nghe sự thay đổi của toàn bộ URL search

  // Lấy genreName để hiển thị tiêu đề
  const searchParams = new URLSearchParams(location.search);
  const genreName = searchParams.get("genreName");
  const query = searchParams.get("q");

  return (
    <div className="home-container">
      <h2 className="section-title">
        {genreName ? `Thể loại: ${genreName}` : query ? `Kết quả tìm kiếm cho: "${query}"` : "Tất cả truyện"}
      </h2>
      
      {loading ? (
        <div className="loading">Đang tìm kiếm...</div>
      ) : comics.length > 0 ? (
        <div className="comic-grid">
          {comics.map((comic) => (
            <ComicCard key={comic._id} comic={comic} />
          ))}
        </div>
      ) : (
        <div className="no-results">Không tìm thấy bộ truyện nào khớp với yêu cầu của bạn.</div>
      )}
    </div>
  );
}

export default Search;