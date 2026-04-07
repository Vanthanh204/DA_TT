import axios from "axios";

const API = axios.create({
  // 1. Luôn đảm bảo baseURL kết thúc bằng /api/ (CÓ dấu gạch chéo ở cuối)
  baseURL: (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "") + "/api/",
});

// Thêm token và sửa lỗi đường dẫn
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 2. Nếu config.url bắt đầu bằng '/', hãy xóa nó để tránh Axios ghi đè baseURL
  if (config.url && config.url.startsWith("/")) {
    config.url = config.url.substring(1);
  }

  return config;
});

export default API;