# 📋 Bảng Công việc Hỗ trợ Nhập liệu Giọng nói (Voice-Assisted Task Board)

<p align="center">
  <b>Hệ thống quản lý công việc (Kanban Board) đa người dùng, tích hợp phân quyền nâng cao (RBAC), nhập liệu bằng giọng nói tiếng Việt và đồng bộ thời gian thực.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/.NET-5C2D91?style=for-the-badge&logo=.net&logoColor=white" alt=".NET Core" />
  <img src="https://img.shields.io/badge/React%2FVite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/SignalR-512BD4?style=for-the-badge&logo=visualstudio&logoColor=white" alt="SignalR" />
</p>

---

## 🚀 Tổng quan Dự án

Dự án này là một nền tảng quản lý công việc dạng bảng Kanban hiện đại, được thiết kế chuyên biệt cho môi trường văn phòng. Điểm nhấn của hệ thống là sự kết hợp giữa **mô hình phân quyền chặt chẽ (RBAC)**, **tính năng điều khiển và nhập liệu bằng giọng nói tiếng Việt (Web Speech API)**, và khả năng **cập nhật thời gian thực (Real-time via SignalR)**.

---

## 🛠 Tech Stack (Công nghệ sử dụng)

- **Database:** PostgreSQL
- **Backend:** .NET Core Web API (Entity Framework Core)
- **Frontend:** Vite (React / Vue), Axios, Recharts, @microsoft/signalr
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
   - Tích hợp SignalR Hub để broadcast mọi thay đổi (thêm, sửa, kéo thả task) tới các thành viên khác trong cùng Project ngay lập tức[cite: 1].
4. **Kiểm soát và Lưu vết (Audit Logging):**
   - Tự động ghi lại lịch sử thay đổi trạng thái kèm thông tin người thực hiện (`ChangedByUserId`)[cite: 1].
   - Tính năng "Dọn bảng/Archive" sử dụng Database Transaction để lưu trữ lịch sử gọn gàng[cite: 1].
5. **Dashboard Thống kê & Export dữ liệu:**
   - Biểu đồ trực quan bằng Recharts cho Manager/Admin và thống kê cá nhân cho Employee[cite: 1].
   - Hỗ trợ xuất dữ liệu báo cáo qua cơ chế Streaming Response[cite: 1].

---
