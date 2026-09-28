# 🌌 SOLARIS - Enterprise Task Board & Workflow Management Platform

<p align="center">
  <b>Nền tảng Quản trị Tiến độ Dự án, Điều phối Tác nghiệp Đa Chiều, Quản lý Ca & Nghỉ phép chuẩn Doanh nghiệp Hiện đại.</b><br/>
  <i>Tích hợp Phân quyền RBAC 3 cấp, Bảng Kanban Matrix 6 Trạng thái, Lịch Làm Việc & Duyệt Phép Real-time, Trung Tâm Thông Báo Đa Kênh, Thùng Rác Hệ Thống 14 Ngày và Chuẩn hóa Type-Safe 100%.</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11.x-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/Prisma-7.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/TypeScript-Strict_TypeSafe-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Socket.IO-4.x-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO" />
</p>

---

## 🚀 1. Tổng Quan Hệ Thống (Project Overview)

**Solaris Task Board Manager** là giải pháp quản trị toàn diện cho các đội ngũ phát triển phần mềm và doanh nghiệp vận hành theo chuẩn Agile/Scrum. 

Giao diện được thiết kế theo phong cách **Solar Glassmorphism Dark Theme** (`#030712`), hiệu ứng ánh sáng Hổ Phách (`Amber`), chuyển động mượt mà 60 FPS, tối ưu hóa trải nghiệm người dùng từ cấp Nhân viên, Quản lý dự án (Project Manager) đến Ban Giám Đốc (Admin).

---

## 🌟 2. Các Phân Hệ & Tính Năng Trọng Tâm

```
                    ┌────────────────────────────────────────────────────────┐
                    │            🌌 SOLARIS WORKSPACE PLATFORM               │
                    └────────────────────────────────────────────────────────┘
                               │                │                │
            ┌──────────────────┴──┐    ┌────────┴────────┐    ┌──┴──────────────────┐
            │ 📋 TASK & WORKFLOW  │    │ 📅 WORK & LEAVE │    │ 👤 USER & ORG HUB   │
            ├─────────────────────┤    ├─────────────────┤    ├─────────────────────┤
            │ • Kanban Matrix     │    │ • Leave Request │    │ • 1-Click Upload    │
            │ • Pipeline Roadmap  │    │ • Review Modal  │    │ • Real DB Sync      │
            │ • Subtask Approval  │    │ • Direct Shift  │    │ • Org & Department  │
            │ • Task History Log  │    │ • Month/Week UI │    │ • 14-Day Recycle Bin│
            └─────────────────────┘    └─────────────────┘    └─────────────────────┘
```

### 📋 A. Bảng Task Workspace & Ma Trận Kanban (Kanban Matrix)
* **6 Cột Trạng Thái Chuẩn Tác Nghiệp**: `TODO` (Cần Làm), `IN_PROGRESS` (Đang Làm), `PAUSED` (Tạm Dừng), `BLOCKED` (Tắc Nghẽn), `IN_REVIEW` 🔒 (Chờ Duyệt), `DONE` (Hoàn Thành).
* **Kéo thả mượt mà với Fixed Portal Container**: Không chớp nháy thanh cuộn, tích hợp **Quy Tắc Sở Hữu (Drag Ownership Rule)** ngăn chặn kéo thả trái quyền hạn.
* **Phân rã Việc Con (Subtasks/Checklists)**: Gán người phụ trách độc lập cho từng việc con, ước lượng ngày công, cơ chế nộp duyệt hoàn thành (`PENDING` ➔ `APPROVED` / `REJECTED`).
* **Lịch Sử Tác Nghiệp Tự Động (`TaskHistory`)**: Ghi log chi tiết từng hành động di chuyển task, cập nhật tiến độ, chỉnh sửa mô tả.

### 📅 B. Quản Lý Ca Làm Việc & Đơn Xin Nghỉ Phép (Work Schedule & Leave Management)
* **📝 Tạo Đơn Xin Nghỉ Phép / Làm WFH (`CreateLeaveRequestModal`)**:
  * Hỗ trợ đa dạng loại đơn: *Làm từ xa (WFH), Nghỉ phép năm, Nghỉ ốm, Đi công tác / On-site, Việc riêng*.
  * Tùy chọn thời gian linh hoạt: *Buổi Sáng (0.5 ngày), Buổi Chiều (0.5 ngày), Cả Ngày* hoặc khoảng ngày dài hạn kèm kế hoạch bàn giao việc.
* **⚖️ Trung Tâm Duyệt Đơn Thời Gian Thực (`ReviewLeaveRequestsModal`)**:
  * Dành riêng cho Quản lý & Admin, hiển thị huy hiệu đếm số đơn chờ duyệt (`PENDING`).
  * Cho phép phê duyệt, từ chối hoặc điều chỉnh lại ngày/ca trước khi duyệt (`APPROVED_MODIFIED`).
* **👑 Xếp Ca / Chỉ Định Lịch Trực Tiếp (`AssignScheduleModal`)**:
  * Phân công vị trí làm việc cho bất kỳ nhân sự nào trong tổ chức.
* **🗓️ Lịch Trình Tác Nghiệp Đa Chế Độ (`MonthCalendarView`, `SchedulePage`)**:
  * Hiển thị trực quan lịch công việc kết hợp trạng thái có mặt (Văn phòng, WFH, Nghỉ phép, On-site) của từng thành sự.

### 👤 C. Hồ Sơ Cá Nhân & Quản Trị Tổ Chức (Profile & Organization Hub)
* **📸 Tải Ảnh Trực Tiếp 1-Click (No Raw URL)**: Nút chọn tệp ảnh đại diện (Avatar) và ảnh bìa (Cover) trực tiếp từ máy tính kèm xem trước tức thì.
* **🏢 Đồng Bộ Dữ Liệu Thực Tế Từ CSDL**:
  * Hiển thị chính xác Khối Phòng Ban trực thuộc.
  * Tự động tổng hợp danh sách các Dự án thực tế tham gia và vai trò tương ứng (*Chủ dự án, Quản lý, Thành viên*).
* **📍 Cập Nhật Vị Trí Làm Việc Hôm Nay**: Lựa chọn trạng thái làm việc trong ngày (*Tại Văn Phòng, WFH, Đi On-site, Nghỉ phép*).
* **👥 Quản Trị Nhân Sự & Chuyển Giao Phòng Ban (`/admin/users`)**: Phân bổ nhân sự, chuyển phòng ban hàng loạt, thiết lập nghề nghiệp (`DEV`, `TESTER`, `DESIGNER`, `BA`, `DEVOPS`, `PRODUCT_OWNER`...).

### 🗄️ D. Thùng Rác Hệ Thống Lưu Giữ 14 Ngày (`/admin/trash`)
* **Chính sách bảo toàn dữ liệu 14 ngày**: Dự án và Task đã xóa được bảo lưu an toàn.
* **Đếm ngược thời gian thực (Visual Countdown)**: Xanh ngọc (> 7 ngày), Vàng (3-7 ngày), Đỏ (< 3 ngày).
* **Khôi Phục 1-Chạm (One-Click Restore)** & **Tự động mở lại Dự án cha** khi khôi phục Task con.
* **Xóa vĩnh viễn & Dọn sạch thùng rác** bảo vệ dung lượng CSDL.

### 🔔 E. Trung Tâm Thông Báo Thời Gian Thực (Notification Center)
* **Realtime WebSockets (Socket.IO)**: Nhận thông báo tức thì khi được giao task, có yêu cầu duyệt việc con, được duyệt đơn nghỉ phép.
* **Bộ lọc thông minh**: Tab *Tất cả*, *Chưa đọc*, *Khẩn cấp 🔥*.
* **1-Click Navigation**: Bấm vào thông báo sẽ mở ngay Modal chi tiết công việc liên quan.

---

## 🛡️ 3. Chuẩn Hóa Type-Safe & Kiến Trúc Mã Nguồn

* **Backend (NestJS 11 + Prisma 7)**:
  * Khởi tạo `AuthUserPayload` và `AuthenticatedRequest` chuẩn hóa dữ liệu xác thực JWT.
  * Toàn bộ Controllers và Services được định kiểu nghiêm ngặt (Strict TypeScript), loại bỏ hoàn toàn `any`.
  * Giao dịch nguyên tố Atomic Transactions (`prisma.$transaction`) bảo vệ tính toàn vẹn dữ liệu.
* **Frontend (React 19 + TypeScript + Zustand)**:
  * Chuẩn hóa đồng bộ các interfaces: `User`, `TaskItem`, `SubtaskItem`, `Project`, `WorkScheduleRecord`, `LeaveRequestRecord`.
  * Build thành công 100% không cảnh báo (Zero TS Compiler Errors).

---

## 🛠️ 4. Công Nghệ Sử Dụng (Tech Stack)

| Thành Phần | Công Nghệ & Thư Viện |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite 8 |
| **Styling & UI** | TailwindCSS v4, Lucide React Icons |
| **State Management** | Zustand (Global Store, Schedule Store, User Store, Auth Store) |
| **Drag and Drop** | `@hello-pangea/dnd` với Dedicated Fixed Portal Container |
| **Backend Framework** | NestJS 11 (Modular Architecture) |
| **Database & ORM** | PostgreSQL 16, Prisma ORM 7 |
| **Realtime Engine** | Socket.IO 4.x (Gateway Rooms, User-specific broadcasts) |
| **Authentication** | JWT (JSON Web Tokens), Passport, BCrypt |

---

## 💻 5. Hướng Dẫn Cài Đặt & Chạy Dự Án (Quick Start)

### Yêu Cầu Môi Trường:
* **Node.js**: Phiên bản 18+ hoặc 20+ LTS
* **PostgreSQL**: Cổng mặc định `5432`

---

### Bước 1: Khởi Động Backend (NestJS API)

```bash
# Di chuyển vào thư mục backend
cd be

# Cài đặt dependencies
npm install

# Đồng bộ Database Schema với Prisma
npx prisma db push

# Chạy Server Backend (Development Mode)
npm run start:dev
```
> 🚀 **Backend API** sẽ hoạt động tại: `http://localhost:3000` (API Prefix: `/api`)

---

### Bước 2: Khởi Động Frontend (React / Vite)

```bash
# Mở một Terminal mới và di chuyển vào thư mục frontend
cd fe

# Cài đặt dependencies
npm install

# Khởi chạy giao diện người dùng
npm run dev
```
> 🌐 **Frontend UI** sẽ hoạt động tại: `http://localhost:5173`

---

### Bước 3: Kiểm Tra Build Toàn Dự Án

```bash
# Kiểm tra build Frontend
cd fe && npm run build

# Kiểm tra build Backend
cd be && npm run build
```

---

## 👥 6. Tài Khoản Thử Nghiệm Mặc Định (Demo Accounts)

| Email | Mật Khẩu | Vai Trò (Role) | Quyền Hạn Nổi Bật |
| :--- | :---: | :---: | :--- |
| `huydatne@gmail.com` | `admin123` | **ADMIN** | Toàn quyền hệ thống, Duyệt đơn nghỉ phép, Xếp ca, Thùng rác 14 ngày, Quản lý Nhân sự |
| `manager@solaris.io` | `manager123` | **MANAGER** | Quản lý dự án, Duyệt việc con, Duyệt đơn nghỉ phép của nhân viên, Điều phối Task |
| `employee@solaris.io` | `employee123` | **EMPLOYEE** | Nhận Task, Gửi đơn xin nghỉ phép/WFH, Cập nhật tiến độ việc con, Tự chọn vị trí làm việc |

---

<p align="center">
  <b>Developed with ❤️ for High-Performance Agile Teams</b><br/>
  <i>Solaris Task Board & Workflow Platform © 2026. All Rights Reserved.</i>
</p>
