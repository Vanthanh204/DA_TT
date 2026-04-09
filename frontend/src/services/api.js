import axios from "axios";

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  
  // Nếu đang chạy môi trường phát triển, lấy hostname của máy đang chạy (để hỗ trợ mobile trong cùng mạng LAN)
  const hostname = window.location.hostname;
  return `http://${hostname}:5000/api`;
};

const API = axios.create({
  baseURL: getBaseURL(),
});

// Thêm token vào header mỗi khi gửi request (nếu có)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;