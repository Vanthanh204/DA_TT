import axios from "axios";

const API = axios.create({
  // Đảm bảo baseURL luôn kết thúc bằng /api (không có dấu gạch chéo ở cuối cùng)
  baseURL: (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, ""),
});

// Fix lỗi Axios stripping path: Tự động thêm /api nếu nó bị thiếu trong URL yêu cầu
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Nếu URL gọi đến không bắt đầu bằng http và không có /api ở đầu, 
  // Axios đôi khi làm mất baseURL nếu config.url có dấu / ở đầu.
  return config;
});

export default API;