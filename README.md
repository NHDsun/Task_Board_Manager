# 🌌 SOLARIS - Enterprise Task Board & Workflow Management Platform

<p align="center">
  <b>Hệ thống Quản trị Tiến độ Công việc, Lập Kế hoạch Master Plan & Điều phối Tác nghiệp Đa Dự án chuẩn Doanh nghiệp Hiện đại.</b><br/>
  <i>Tích hợp Phân quyền RBAC 3 cấp, Bảng Kanban 6 Trạng thái, Lịch Làm Việc 3 Chế độ Xem, Trung Tâm Thông Báo Real-time, Thùng Rác Hệ Thống 14 Ngày và Triệt Tiêu 98 Logic Conflicts & Corner Cases.</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11.x-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/Prisma-7.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Socket.IO-4.x-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/Logic_Conflicts-98_Resolved-10B981?style=for-the-badge" alt="Logic Conflicts" />
</p>

---

## 🚀 1. Tổng Quan Hệ Thống (Project Overview)

**Solaris Task Board Manager** là nền tảng quản trị dự án và điều phối công việc thế hệ mới, được thiết kế theo phong cách **Solar Glassmorphism Pro Max UI** với nền tối sâu (`#030712`), quầng sáng hổ phách (`Amber`) và hiệu ứng chuyển động mượt mà 60 FPS.

Hệ thống cung cấp giải pháp toàn diện từ khâu khảo sát, lập kế hoạch lộ trình (Roadmap), phân rã công việc thành các Task con (Subtasks/Minitasks) với người phụ trách độc lập, theo dõi hạn chót trên Lịch làm việc trực quan, quản lý thành viên dự án, đến nghiệm thu và lưu trữ dữ liệu an toàn.

---

## 🌟 2. Các Tính Năng Trọng Tâm (Core Feature Highlights)

### 📊 A. Ma Trận Kanban 6 Cột Chuẩn Tác Nghiệp (Kanban Matrix)
* **6 Cột Trạng Thái Nghiệp Vụ:**
  1. `TODO` — Cần Làm (Xám Khói)
  2. `IN_PROGRESS` — Đang Làm (Vàng Hổ Phách)
  3. `PAUSED` — Tạm Dừng (Xanh Dương)
  4. `BLOCKED` — Tắc Nghẽn (Đỏ Hồng)
  5. `IN_REVIEW` — Chờ Duyệt Bài 🔒 (Tím Thạch Anh)
  6. `DONE` — Hoàn Thành (Xanh Ngọc)
* **Kéo thả mượt mà với `@hello-pangea/dnd` & Fixed Portal** chống chớp giật thanh cuộn.
* **Cơ chế giữ nguyên Task DONE vĩnh viễn** ở cột DONE để dễ dàng theo dõi, đối soát và tổng kết dự án.

### 🌌 B. Kế Hoạch Tổng Thể & Lộ Trình Dự Án (Master Plan & Roadmap)
* Trực quan hóa vòng đời dự án theo các **Giai đoạn Pipeline** (Khảo sát ➔ Thiết kế UI/UX ➔ Lập trình ➔ Kiểm thử QA/QC ➔ Staging ➔ Nghiệm thu).
* **Bộ biên tập giai đoạn tại chỗ (In-Place Stage Editor)** cho phép Quản lý thêm/xóa/đổi tên giai đoạn trực tiếp.
* **Quyền Xóa Dự Án Dành Cho Admin**: Nút xóa dự án trên Master Plan kèm Modal cảnh báo nguy hiểm, đưa toàn bộ dự án và task con vào Thùng Rác lưu giữ 14 ngày.

### 📅 C. Bảng Lịch Làm Việc & Tiến Độ (Schedule & Timeline Dashboard - Pro Max UI)
* **3 Chế Độ Xem Linh Hoạt:**
  - 🗓️ **Lịch Tháng (Month Calendar Grid)**: Lưới 35 ô với chỉ báo màu theo trạng thái và thanh hạn chót.
  - ⚡ **Lịch Tuần (Week Sprint Timeline)**: Trục thời gian 7 ngày với thẻ công việc chi tiết.
  - 🎯 **Lịch Ngày (Day Focus Cockpit)**: Chế độ tập trung cao độ theo từng khung giờ trong ngày.
* Tích hợp bộ lọc đa chiều (Dự án, Nhân sự, Độ ưu tiên) và đồng bộ Socket.IO realtime.

### 🔔 D. Trung Tâm Thông Báo Cá Nhân (Personal Notification Center - Pro Max UI)
* **Chuông thông báo phát sáng** trên thanh Topbar với huy hiệu đếm số lượng chưa đọc real-time.
* **Flyout Drawer đa năng**: Phân loại tab *Tất Cả*, *Chưa Đọc*, *Khẩn Cấp (Urgent)*.
* **Toast Thông Báo Bay Góc Màn Hình** xuất hiện tức thì khi có thông báo mới.
* **1-Click Điều Hướng**: Nhấp vào thông báo sẽ mở trực tiếp Modal chi tiết công việc liên quan.

### 🗄️ E. Thùng Rác Hệ Thống 14 Ngày (14-Day Retention Recycle Bin & Recovery Center)
* **Chính sách lưu giữ an toàn 14 ngày (14-Day Retention Policy)** cho toàn bộ Dự án và Task đã xóa.
* **Trang quản trị dành riêng cho Admin (`/admin/trash`)**:
  - Thanh tiến độ đếm ngược thời gian thực (Xanh ngọc > 7 ngày, Vàng 3-7 ngày, Đỏ < 3 ngày).
  - **Khôi Phục (Restore)** một chạm đưa Dự án và Task trở lại Bảng công việc.
  - **Tự động mở lại Dự án cha** khi khôi phục một Task con mồ côi (`CC-01`).
  - **Cơ chế tự động dọn dẹp (Auto-Purge)** các bản ghi quá hạn 14 ngày (`CC-02`).
  - **Xóa Vĩnh Viễn & Dọn Sạch Thùng Rác** giải phóng triệt để CSDL.

### 👥 F. Phân Rã Việc Con & Điều Phối Độc Lập (Subtasks & Independent Delegation)
* Mỗi Task con (Minitask) có thể gán cho **một người thực hiện riêng biệt**, tính thời gian ước lượng và tính trọng số tiến độ (%) tự động.
* **Cơ chế Khẩn Cấp Động (Dynamic URGENT)**: Bật cờ khẩn cấp trên việc con sẽ tự động nâng Task cha lên `URGENT` và gửi thông báo tức thì đến người nhận; khi việc con hoàn thành hoặc bị xóa, Task cha tự động hạ cờ về bình thường.
* **Admin & Manager có quyền trực tiếp duyệt hoặc bấm hoàn thành việc con** của bất kỳ nhân sự nào.

---

## 🛡️ 3. Triệt Tiêu 98 Logic Conflicts & Corner Cases (`LC-01` ➔ `LC-98`)

Hệ thống được thiết kế với độ tin cậy tuyệt đối, giải quyết trọn vẹn **98 xung đột logic nghiệp vụ và tình huống biên**, bao gồm:
- 🔒 **Giao dịch nguyên tố Atomic Transactions (`prisma.$transaction`)** bảo vệ dữ liệu khi xóa/khôi phục/chuyển giao.
- 🛡️ **Bảo vệ phòng thủ mảng đa tầng** chống lỗi giao diện (`Array.isArray` fallback).
- ⚡ **Chống xung đột Race Condition & Idempotency** khi click thao tác liên tục.
- 🏢 **Cách ly dữ liệu dự án (Project Isolation)**: Không rò rỉ thông báo hoặc dữ liệu cho thành viên đã rời dự án.
- 🧹 **Tự động dọn dẹp thông báo cũ quá 30 ngày** và giới hạn phân trang tối ưu hiệu năng.

> Chi tiết toàn bộ 98 quy tắc nghiệp vụ xem tại: [`docs/05_LOGIC_CONFLICTS_AND_BUSINESS_RULES_LOG.md`](./docs/05_LOGIC_CONFLICTS_AND_BUSINESS_RULES_LOG.md).

---

## 🛠️ 4. Kiến Trúc Kỹ Thuật (Tech Stack & Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT 19 FRONTEND (VITE 8)               │
│  TailwindCSS v4 │ Zustand Store │ Lucide Icons │ Recharts   │
│  @hello-pangea/dnd Fixed Portal │ Socket.IO Client 4.x      │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API + WebSockets
┌──────────────────────────────▼──────────────────────────────┐
│                    NESTJS 11 BACKEND API                    │
│  JWT Auth Guard │ Idempotency Interceptor │ SocketGateway    │
│  Modules: Task, Project, Notification, Trash, Profile, User  │
└──────────────────────────────┬──────────────────────────────┘
                               │ Prisma ORM 7 + Driver Adapter
┌──────────────────────────────▼──────────────────────────────┐
│                   POSTGRESQL 16 DATABASE                    │
│  Tables: users, projects, project_members, tasks, subtasks, │
│          task_requests, task_comments, notifications        │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 5. Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Quick Start)

### Yêu Cầu Tiên Quyết (Prerequisites):
- [Node.js](https://nodejs.org/) (phiên bản 18+ hoặc 20+ LTS)
- [Docker & Docker Desktop](https://www.docker.com/) (để chạy PostgreSQL)

---

### Bước 1: Khởi Động Cơ Sở Dữ Liệu PostgreSQL
Tại thư mục gốc của dự án, mở Terminal và chạy:
```bash
docker-compose up -d postgres_db
```

---

### Bước 2: Cài Đặt & Khởi Động Backend (NestJS)
Mở một Terminal mới, di chuyển vào thư mục `be`:
```bash
cd be
npm install
npx prisma db push
npm run start:dev
```
> Backend API sẽ hoạt động tại: `http://localhost:3000`

---

### Bước 3: Cài Đặt & Khởi Động Frontend (React/Vite)
Mở một Terminal mới, di chuyển vào thư mục `fe`:
```bash
cd fe
npm install
npm run dev
```
> Frontend ứng dụng sẽ hoạt động tại: `http://localhost:5173`

---

### 💡 Khởi Chạy Toàn Bộ Stack Qua Docker (Tuỳ Chọn)
```bash
docker-compose up -d --build
```

---

## 📚 6. Bộ Tài Liệu Kỹ Thuật Hệ Thống (Documentation Suite)

Toàn bộ tài liệu thiết kế kiến trúc, an toàn bảo mật, ma trận trạng thái và nhật ký xung đột logic được lưu trữ đầy đủ ở 2 định dạng Markdown (`.md`) và Microsoft Word (`.docx`):

| STT | Tên Tài Liệu | Bản Markdown | Bản Word (.docx) | Nội Dung Trọng Tâm |
|:---:|:---|:---:|:---:|:---|
| **01** | **Project Architecture & Master Plan** | [`01.md`](./docs/01_PROJECT_ARCHITECTURE_AND_MASTER_PLAN.md) | [`01.docx`](./docs/01_PROJECT_ARCHITECTURE_AND_MASTER_PLAN.docx) | Kiến trúc tổng thể, mô hình micro-modules, luồng nghiệp vụ. |
| **02** | **Infrastructure & Security Audit** | [`02.md`](./docs/02_INFRASTRUCTURE_AND_SECURITY_AUDIT.md) | [`02.docx`](./docs/02_INFRASTRUCTURE_AND_SECURITY_AUDIT.docx) | Kiểm toán bảo mật RBAC, JWT, CORS, Atomic Transactions. |
| **03** | **Development Changelog Details** | [`03.md`](./docs/03_DEVELOPMENT_CHANGELOG_DETAILS.md) | [`03.docx`](./docs/03_DEVELOPMENT_CHANGELOG_DETAILS.docx) | Nhật ký chi tiết toàn bộ các lần phát triển & nâng cấp hệ thống. |
| **04** | **CSS Design System & Guide** | [`04.md`](./docs/04_CSS_DESIGN_SYSTEM_AND_LINE_BY_LINE_GUIDE.md) | [`04.docx`](./docs/04_CSS_DESIGN_SYSTEM_AND_LINE_BY_LINE_GUIDE.docx) | Quy chuẩn Solar Glassmorphism Dark Theme, token màu & hiệu ứng. |
| **05** | **Logic Conflicts & Business Rules** | [`05.md`](./docs/05_LOGIC_CONFLICTS_AND_BUSINESS_RULES_LOG.md) | [`05.docx`](./docs/05_LOGIC_CONFLICTS_AND_BUSINESS_RULES_LOG.docx) | **Chi tiết 98 Logic Conflicts & Corner Cases (`LC-01` ➔ `LC-98`)**. |
| **06** | **ERD & System State Charts** | [`06.md`](./docs/06_ERD_AND_SYSTEM_STATE_CHARTS.md) | [`06.docx`](./docs/06_ERD_AND_SYSTEM_STATE_CHARTS.docx) | Sơ đồ thực thể CSDL (ERD) và biểu đồ chuyển dịch trạng thái Task. |
| **07** | **Project Plan & Roadmap** | [`Roadmap.md`](./docs/PROJECT_PLAN_AND_ROADMAP.md) | [`Roadmap.docx`](./docs/PROJECT_PLAN_AND_ROADMAP.docx) | Lộ trình 15 giai đoạn phát triển toàn diện hệ thống. |

---

## 👥 7. Tài Khoản Mặc Định Thử Nghiệm (Demo Accounts)

| Email | Mật Khẩu | Vai Trò (Role) | Chức Năng |
|:---|:---:|:---:|:---|
| `huydatne@gmail.com` | `admin123` | **ADMIN** | Toàn quyền hệ thống, Thùng rác 14 ngày, Xóa dự án, Phân quyền nhân sự |
| `manager@solaris.io` | `manager123` | **MANAGER** | Quản lý dự án, Phê duyệt việc con, Chuyển giao Task, Điều chỉnh Master Plan |
| `employee@solaris.io` | `employee123` | **EMPLOYEE** | Nhận Task, cập nhật tiến độ việc con, bật cờ Khẩn cấp, gửi yêu cầu |

---

<p align="center">
  <b>Developed with ❤️ for High-Performance Enterprise Teams</b><br/>
  <i>Solaris Task Board Manager © 2026. All Rights Reserved.</i>
</p>
