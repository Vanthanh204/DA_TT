# Dự Án Comic Web (MERN Stack)

Dự án này bao gồm Frontend (React + Vite) và Backend (Node.js + Express).

## 1. Chuẩn bị trước khi Upload lên GitHub

1. **Cài đặt Biến Môi trường:** 
   - Backend: Copy file `backend/.env.example` thành `backend/.env` và điền thông tin của bạn.
   - Frontend: (Tùy chọn) Để local gọi API, copy `frontend/.env.example` thành `frontend/.env`.

2. **Dữ liệu Hình ảnh:** 
   - Thư mục `images/` và `backend/uploads/` đã được đưa vào `.gitignore` để không bị đẩy lên GitHub. 
   - Bạn nên sử dụng **Cloudinary** (đã có cấu hình trong code) để lưu trữ ảnh lâu dài.

## 2. Các bước đưa lên GitHub

1. Mở terminal tại thư mục gốc của dự án (`D:\DA_TT`).
2. Khởi tạo Git:
   ```bash
   git init
   ```
3. Thêm toàn bộ file:
   ```bash
   git add .
   ```
4. Commit lần đầu:
   ```bash
   git commit -m "Initial commit for deployment"
   ```
5. Tạo repository mới trên GitHub.
6. Kết nối repo local với GitHub:
   ```bash
   git remote add origin <URL_REPO_CUA_BAN>
   git branch -M main
   git push -u origin main
   ```

## 3. Deploy Backend (Lên Render.com)

1. Đăng ký/Đăng nhập vào **Render.com**.
2. Chọn **New** -> **Web Service**.
3. Kết nối với repo GitHub của bạn.
4. Cấu hình:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Trong mục **Environment Variables**, thêm các biến từ file `.env.example`.

## 4. Deploy Frontend (Lên Vercel.com)

1. Đăng ký/Đăng nhập vào **Vercel.com**.
2. Chọn **Add New** -> **Project**.
3. Kết nối với repo GitHub.
4. Cấu hình:
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Vite`
5. Trong mục **Environment Variables**, thêm biến:
   - `VITE_API_URL`: Dán link Backend từ Render (thêm `/api` ở cuối). Ví dụ: `https://my-backend.onrender.com/api`
6. Nhấn **Deploy**.

## 5. Cấu hình Database (MongoDB Atlas)

- Đảm bảo bạn đã mở quyền truy cập (Allow Access from Anywhere - `0.0.0.0/0`) trên MongoDB Atlas để Render có thể kết nối.
