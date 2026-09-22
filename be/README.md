# ⚙️ SOLARIS Backend - Enterprise NestJS API Service

Dịch vụ Backend API cho nền tảng **Solaris Task Board & Workflow Platform**, xây dựng trên nền tảng **NestJS 11**, **Prisma ORM 7** và **PostgreSQL 16**.

---

## 🚀 Tính Năng Backend Cốt Lõi

* **Hệ thống Xác thực & Phân quyền (RBAC)**: JWT Guard, vai trò 3 cấp (`ADMIN`, `MANAGER`, `EMPLOYEE`), mã hóa BCrypt.
* **Module Nhiệm Vụ (Task & Subtask)**: CRUD Task, điều phối việc con, phân quyền sở hữu kéo thả, ghi log lịch sử tác nghiệp (`TaskHistory`).
* **Quản Lý Ca Làm Việc & Đơn Nghỉ Phép (Work Schedule & Leave Requests)**:
  * Tạo đơn xin nghỉ phép/WFH (`LeaveRequest`), phê duyệt/từ chối đơn thời gian thực.
  * Xếp lịch làm việc (`WorkSchedule`) cho từng nhân sự theo ngày/buổi (`MORNING`, `AFTERNOON`, `FULL_DAY`).
* **Quản Lý Dự Án & Thành Viên (Project & Members)**: Quản lý vòng đời dự án, phân quyền quản lý dự án (`ProjectManager`), liên kết phòng ban.
* **Thùng Rác Hệ Thống 14 Ngày (Trash Service)**: Cơ chế Soft-delete, đếm ngược hạn lưu 14 ngày, khôi phục một chạm kèm tự động phục hồi dự án cha.
* **Thông Báo & Realtime Gateway**: Socket.IO Gateway truyền phát sự kiện tức thì đến từng User và từng Phòng Dự Án (Project Room).
* **Strict Type-Safe**: Chuẩn hóa `AuthUserPayload` và `AuthenticatedRequest`, khử hoàn toàn `any`.

---

## 💻 Hướng Dẫn Cài Đặt & Chạy

### 1. Cài đặt thư viện:
```bash
npm install
```

### 2. Cấu hình biến môi trường (`.env`):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/task_board_db?schema=public"
JWT_SECRET="solaris_super_secret_jwt_key_2026"
JWT_EXPIRES_IN="7d"
PORT=3000
```

### 3. Đồng bộ Cơ sở dữ liệu:
```bash
npx prisma db push
```

### 4. Khởi chạy Server:
```bash
# Development (watch mode)
npm run start:dev

# Production Build & Run
npm run build
npm run start:prod
```

API Server sẽ lắng nghe tại cổng `http://localhost:3000/api`.
