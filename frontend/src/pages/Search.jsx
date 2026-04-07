import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import API from "../services/api";
import ComicCard from "../components/ComicCard";
import "../styles/home.css"; // Dùng chung style với Home cho danh sách truyện

function Search() {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Lấy các tham số từ URL
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get("q");
  const genreId = searchParams.get("genre");
  const genreName = searchParams.get("genreName");

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        let url = "/comics/search?";
        if (query) url += `q=${query}`;
        if (genreId) url += `&genre=${genreId}`;
        
        const res = await API.get(url);
        setComics(res.data);
      } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query, genreId]);

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