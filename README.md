# 📋 Bảng Công việc Hỗ trợ Nhập liệu Giọng nói (Voice-Assisted Task Board)

<p align="center">
  <b>Hệ thống quản lý công việc (Kanban Board) đa người dùng, tích hợp phân quyền nâng cao (RBAC), nhập liệu bằng giọng nói tiếng Việt và đồng bộ thời gian thực.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/React%2FVite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO" />
</p>

---

## 🚀 Tổng quan Dự án

Dự án này là một nền tảng quản lý công việc dạng bảng Kanban hiện đại, được thiết kế chuyên biệt cho môi trường văn phòng. Điểm nhấn của hệ thống là sự kết hợp giữa **mô hình phân quyền chặt chẽ (RBAC)**, **tính năng điều khiển và nhập liệu bằng giọng nói tiếng Việt (Web Speech API)**, và khả năng **cập nhật thời gian thực (Real-time via Socket.IO)**.

---

## 🛠 Tech Stack (Công nghệ sử dụng)

- **Database:** PostgreSQL 16
- **Backend:** NestJS 11 (Node.js) + Prisma ORM 7
- **Frontend:** React 19 + Vite 8, Zustand, Axios, Recharts, Socket.IO Client
- **Vận hành & Triển khai:** Docker & Docker Compose

---

## 👥 Phân quyền Hệ thống (RBAC)

Hệ thống phân chia rõ ràng giữa quyền toàn hệ thống (`GlobalRole`) và quyền theo phạm vi từng dự án (`ProjectRole`):

- 🔴 **Admin:** Quản trị toàn hệ thống. Có quyền tạo tài khoản, gán/đổi Role, toàn quyền trên mọi Project.
- 🟡 **Manager:** Quản lý dự án. Tạo/quản lý Project riêng, thêm bớt thành viên, giao việc và xem Dashboard thống kê.
- 🟢 **Employee:** Nhân viên thực thi. Làm việc trong Project được thêm vào, thao tác trên các Task được giao[cite: 1].
- 🏷 **Department:** Phân loại nhân sự theo phòng ban (`Dev`, `Tester`, `Marketing`, `Design`, `Other`) hiển thị trực quan dạng badge[cite: 1].

---

## ✨ Các Tính năng Nổi bật

1. **Bảng Kanban kéo-thả mượt mà:**
   - 3 cột trạng thái chuẩn: _To Do_, _In Progress_, _Done_[cite: 1].
   - Ứng dụng kỹ thuật _Optimistic Update_ giúp giao diện phản hồi tức thì kèm cơ chế Rollback an toàn khi lỗi mạng[cite: 1].
2. **Nhập liệu và Điều khiển bằng Giọng nói (Voice-to-Text):**
   - Sử dụng Web Speech API hỗ trợ tiếng Việt[cite: 1].
   - Tự động bóc tách từ khóa để xác định tiêu đề và mức độ ưu tiên (_Priority_)[cite: 1].
   - Cơ chế bảo mật: Task tạo qua giọng nói tự động gán cho chính người dùng đang thao tác, kèm tính năng _Undo_ thông minh[cite: 1].
3. **Đồng bộ Thời gian thực (Real-time):**
   - Tích hợp Socket.IO (WebSockets) để broadcast mọi thay đổi (thêm, sửa, kéo thả task) tới các thành viên khác trong cùng Project ngay lập tức[cite: 1].
4. **Kiểm soát và Lưu vết (Audit Logging):**
   - Tự động ghi lại lịch sử thay đổi trạng thái kèm thông tin người thực hiện (`ChangedByUserId`)[cite: 1].
   - Tính năng "Dọn bảng/Archive" sử dụng Database Transaction để lưu trữ lịch sử gọn gàng[cite: 1].
5. **Dashboard Thống kê & Export dữ liệu:**
   - Biểu đồ trực quan bằng Recharts cho Manager/Admin và thống kê cá nhân cho Employee[cite: 1].
   - Hỗ trợ xuất dữ liệu báo cáo qua cơ chế Streaming Response[cite: 1].

---

## 💻 Hướng dẫn chạy dự án (Local Development)

Để lập trình và phát triển dự án trên máy cá nhân, khuyến nghị chạy Database qua Docker và chạy Backend/Frontend trực tiếp trên máy để tận dụng tính năng tự động cập nhật code (Hot Reload).

### Bước 1: Khởi động Cơ sở dữ liệu (PostgreSQL)
Yêu cầu: Đã cài đặt và bật [Docker Desktop](https://www.docker.com/products/docker-desktop).
Mở Terminal tại thư mục gốc của dự án và chạy:
```bash
docker-compose up -d postgres_db
```

### Bước 2: Khởi động Backend (NestJS)
Mở một Terminal mới, di chuyển vào thư mục `be` và chạy:
```bash
cd be
npm install
npm run start:dev
```
*(Backend sẽ chạy tại địa chỉ http://localhost:3000)*

### Bước 3: Khởi động Frontend (React/Vite)
Mở một Terminal mới, di chuyển vào thư mục `fe` và chạy:
```bash
cd fe
npm install
npm run dev
```
*(Frontend sẽ chạy tại địa chỉ http://localhost:5173)*

---
**💡 Mẹo chạy nhanh (Chạy toàn bộ trong Docker)**
Nếu bạn chỉ muốn xem kết quả mà không cần lập trình, chạy lệnh sau ở thư mục gốc:
```bash
docker-compose up -d --build
```
