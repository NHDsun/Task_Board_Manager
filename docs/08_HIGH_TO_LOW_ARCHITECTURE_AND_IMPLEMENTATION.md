# 🌌 08. KIẾN TRÚC & PHƯƠNG PHÁP TRIỂN KHAI TỪ BẬC CAO ĐẾN BẬC THẤP
### (HIGH-LEVEL TO LOW-LEVEL ARCHITECTURE & IMPLEMENTATION GUIDE)

> **Dự án:** Solaris Enterprise Workflow & Task Management Platform  
> **Tài liệu kỹ thuật số:** 08  
> **Phiên bản:** 2.0 Enterprise  
> **Stack công nghệ:** NestJS 11 • React 19 • PostgreSQL 16 • Prisma 7  
> **Bản Word (.docx):** [`08_HIGH_TO_LOW_ARCHITECTURE_AND_IMPLEMENTATION.docx`](./08_HIGH_TO_LOW_ARCHITECTURE_AND_IMPLEMENTATION.docx)  

---

## 📑 MỤC LỤC
1. [Tổng Quan & Nguyên Lý Thiết Kế High-to-Low](#1-tổng-quan--nguyên-lý-thiết-kế-high-to-low)
2. [Tầng High-Level (Vĩ Mô) - Kiến Trúc & Quy Trình Hệ Thống](#2-tầng-high-level-vĩ-mô---kiến-trúc--quy-trình-hệ-thống)
   - 2.1. Kiến Trúc 3 Lớp Phân Tách Độc Lập
   - 2.2. Mô Hình Phân Quyền Vai Trò RBAC 3 Cấp
   - 2.3. Cơ Chế Kết Nối Kép: RESTful HTTP + WebSockets Socket.IO
   - 2.4. Ma Trận Kanban 6 Cột & Vòng Đời Trạng Thái Công Việc
3. [Tầng Low-Level (Vi Mô) - Kỹ Thuật Mã Nguồn & Xử Lý 98 Conflicts](#3-tầng-low-level-vi-mô---kỹ-thuật-mã-nguồn--xử-lý-98-conflicts)
   - 3.1. Giao Dịch Nguyên Tố Atomic Transactions (`prisma.$transaction`)
   - 3.2. Chống Gian Lận Tiến Độ & Lách Duyệt Quy Trình (`LC-08` & `LC-10`)
   - 3.3. Cơ Chế Khẩn Cấp Động & Tự Động Kế Thừa Độ Ưu Tiên
   - 3.4. Chống Xung Đột Race Condition & Idempotency
   - 3.5. Dọn Rác Tự Động & Loại Bỏ Thông Báo Ma (`LC-11` & `CC-02`)
4. [Bảng Ma Trận Đối Chiếu High-to-Low](#4-bảng-ma-trận-đối-chiếu-high-to-low)
5. [Bài Học Kinh Nghiệm & Quy Chuẩn Code Doanh Nghiệp](#5-bài-học-kinh-nghiệm--quy-chuẩn-code-doanh-nghiệp)

---

## 1. TỔNG QUAN & NGUYÊN LÝ THIẾT KẾ HIGH-TO-LOW

Trong kỹ nghệ phần mềm chuyên nghiệp, việc xây dựng một hệ thống quy mô lớn đòi hỏi sự liên kết chặt chẽ giữa hai chiều tư duy: **Tầm nhìn Vĩ mô (High-Level Design)** và **Hiện thực Vi mô (Low-Level Implementation)**. 

- Nếu chỉ có bản vẽ High-Level mà thiếu kiểm soát Low-Level, hệ thống sẽ dễ đổ vỡ trước các lỗi Race Condition, rò rỉ bộ nhớ, hoặc xung đột dữ liệu.
- Ngược lại, nếu chỉ cắm đầu viết code Low-Level mà thiếu định hướng High-Level, dự án sẽ nhanh chóng biến thành mớ hỗn độn (Spaghetti Code), rất khó mở rộng và bảo trì.

- **1. Tầng High-Level (Bậc cao / Vĩ mô):** Định hình cấu trúc 3 tầng phân tách (Frontend React 19 - Backend NestJS 11 - PostgreSQL 16), phân quyền vai trò RBAC 3 cấp (`ADMIN`, `MANAGER`, `EMPLOYEE`), quy hoạch 6 cột Kanban, và luồng đồng bộ thời gian thực 2 chiều (REST API + WebSockets Socket.IO).
- **2. Tầng Low-Level (Bậc thấp / Vi mô):** Bảo đảm an toàn giao dịch CSDL qua Atomic Transactions (`prisma.$transaction`), triệt tiêu 98 Xung đột logic & Tình huống biên (Logic Conflicts `LC-01` ➔ `LC-98`), chống spam click qua Idempotency, phòng thủ mảng phía Frontend, và cơ chế tự động dọn rác (Auto-Purge).

> 📌 **TRIẾT LÝ THIẾT KẾ CỐT LÕI CỦA SOLARIS:**  
> Dự án Solaris là minh chứng điển hình cho phương pháp tiếp cận High-to-Low: Mọi quyết định kiến trúc ở tầng vĩ mô đều được hiện thực hóa bằng các chốt chặn nghiêm ngặt trong mã nguồn, giải quyết dứt điểm 98 tình huống xung đột logic nghiệp vụ.

---

## 2. TẦNG HIGH-LEVEL (VĨ MÔ) - KIẾN TRÚC & QUY TRÌNH HỆ THỐNG

### 2.1. Kiến Trúc 3 Lớp Phân Tách Độc Lập (3-Tier Decoupled Architecture)
- **Tầng Trình Diễn (Frontend Layer - `/fe`):** Xây dựng trên nền React 19 và Vite 8, áp dụng phong cách thiết kế Solar Glassmorphism Dark Theme (`#030712`) với hiệu ứng quầng sáng Amber và đổ bóng chiều sâu. Quản lý trạng thái bằng Zustand Store, kéo thả mượt mà 60 FPS với `@hello-pangea/dnd` kết hợp Fixed Portal.
- **Tầng Nghiệp Vụ (Backend Layer - `/be`):** Phát triển trên nền tảng NestJS 11 theo chuẩn Micro-Modules (`AuthModule`, `TaskModule`, `ProjectModule`, `NotificationModule`, `TrashModule`, `SocketModule`, `ProfileModule`). Tiếp nhận qua Controller, kiểm duyệt qua Guard/Interceptor, xử lý nghiệp vụ tại Service và truy xuất CSDL qua Prisma ORM.
- **Tầng Dữ Liệu (Database Layer - PostgreSQL):** Cơ sở dữ liệu quan hệ PostgreSQL 16 quản lý các thực thể: `users`, `projects`, `project_members`, `tasks`, `subtasks`, `task_requests`, `task_comments`, `notifications`. Hỗ trợ toàn vẹn khóa ngoại và Transaction nguyên tố.

### 2.2. Mô Hình Phân Quyền Vai Trò RBAC 3 Cấp (Role-Based Access Control)
- **`ADMIN` (Quản trị viên tối cao):** Nắm toàn quyền quản trị hệ thống, quản lý tài khoản người dùng, xem và quản lý Trung tâm Thùng rác 14 ngày (`/admin/trash`), xóa vĩnh viễn hoặc khôi phục dữ liệu đã xóa, phân bổ thành viên dự án.
- **`MANAGER` (Quản lý dự án):** Tạo và quản trị các dự án được giao, điều chỉnh kế hoạch tổng thể Master Plan & Pipeline Stages, phê duyệt việc con (Subtasks) của nhân viên, chuyển giao công việc (Task Transfer), giám sát tiến độ thành viên.
- **`EMPLOYEE` (Nhân viên tác nghiệp):** Xem các dự án và task được giao, cập nhật tiến độ công việc con (Subtasks) của chính mình, bật cờ Khẩn cấp (`URGENT`) khi gặp vướng mắc, gửi yêu cầu phê duyệt khi hoàn thành việc con.

### 2.3. Cơ Chế Kết Nối Kép: RESTful HTTP + WebSockets Socket.IO
- **1. Kênh Đồng Bộ (RESTful API HTTP):** Sử dụng cho các hành động CRUD dữ liệu có chủ đích (Đăng nhập, Tạo Task, Cập nhật trạng thái, Nộp duyệt). Toàn bộ request được bảo vệ bằng JWT Bearer Token trong Header thông qua Axios Interceptors.
- **2. Kênh Bất Đồng Bộ (Socket.IO Gateway):** Sử dụng `SocketGateway` để lắng nghe và phát broadcast các sự kiện thời gian thực (`task:created`, `task:updated`, `task:moved`, `subtask:toggled`, `notification:new`). Khi bất kỳ nhân sự nào thay đổi dữ liệu, màn hình của các thành viên khác lập tức cập nhật mà không cần F5 / Reload trang.

### 2.4. Ma Trận Kanban 6 Cột & Vòng Đời Trạng Thái Công Việc
1. `TODO` (Cần làm): Task mới được tạo lập, chưa bắt đầu triển khai.
2. `IN_PROGRESS` (Đang làm): Đang trong quá trình triển khai thực tế.
3. `PAUSED` (Tạm dừng): Tạm hoãn do ưu tiên việc khác hoặc chờ phụ thuộc bên ngoài.
4. `BLOCKED` (Tắc nghẽn): Gặp sự cố nghiêm trọng hoặc rào cản kỹ thuật cần can thiệp.
5. `IN_REVIEW` (Chờ duyệt bài): Toàn bộ việc con đã hoàn thành, chờ Quản lý nghiệm thu duyệt bài.
6. `DONE` (Hoàn thành): Đã nghiệm thu hoàn tất, lưu giữ vĩnh viễn trên bảng đối soát.

---

## 3. TẦNG LOW-LEVEL (VI MÔ) - KỸ THUẬT MÃ NGUỒN & XỬ LÝ 98 CONFLICTS

### 3.1. Giao Dịch Nguyên Tố Atomic Transactions (`prisma.$transaction`)
Khi thực hiện các thao tác phức tạp liên quan đến nhiều bảng (như xóa một Dự án gồm hàng chục Task, hàng trăm Subtask và Notification liên quan), việc sử dụng các câu lệnh ghi độc lập sẽ gây ra rủi ro dữ liệu mồ côi nếu xảy ra lỗi giữa chừng. Solaris giải quyết triệt để bằng cách đóng gói toàn bộ logic vào trong `prisma.$transaction`:

```typescript
// Minh họa Atomic Transaction trong Project Service
await this.prisma.$transaction(async (tx) => {
  // 1. Cập nhật cờ xóa mềm (deletedAt) cho toàn bộ Subtasks
  await tx.subtask.updateMany({ where: { taskId: { in: taskIds } }, data: { deletedAt: new Date() } });
  // 2. Chuyển toàn bộ Tasks sang trạng thái lưu thùng rác
  await tx.task.updateMany({ where: { projectId }, data: { deletedAt: new Date() } });
  // 3. Đánh dấu xóa mềm cho Dự án
  await tx.project.update({ where: { id: projectId }, data: { deletedAt: new Date() } });
  // 4. Dọn dẹp toàn bộ thông báo treo liên quan
  await tx.notification.deleteMany({ where: { taskId: { in: taskIds } } });
});
```

### 3.2. Chống Gian Lận Tiến Độ & Lách Duyệt Quy Trình (`LC-08` & `LC-10`)
- **LC-08 (Kanban DONE Drag Block):** Hệ thống kiểm tra: Nếu Task có Subtasks mà còn việc con chưa hoàn thành, hoặc nhân viên chưa gửi duyệt qua IN_REVIEW, Backend sẽ ném lỗi `BadRequestException('Không thể chuyển trực tiếp sang DONE khi chưa được phê duyệt')`. Phía Frontend lập tức bật modal cảnh báo và trả thẻ về vị trí cũ.
- **LC-10 (State Freeze on Paused/Blocked):** Khi Task cha bị chuyển sang trạng thái PAUSED hoặc BLOCKED, toàn bộ các nút bấm check hoàn thành trên việc con (Subtasks) sẽ bị vô hiệu hóa (disabled) ở giao diện và từ chối ở API, ngăn chặn việc cập nhật số liệu ảo khi công việc đang bị đình trệ.

### 3.3. Cơ Chế Khẩn Cấp Động & Tự Động Kế Thừa Độ Ưu Tiên
- **Lan truyền cờ khẩn cấp:** Khi nhân viên bật cờ `isUrgent = true` trên 1 Subtask, Backend tự động kích hoạt trigger nâng mức ưu tiên của Task cha lên `URGENT` và gửi Socket Notification khẩn cấp đến Quản lý.
- **Tự động hạ cờ khi hoàn thành:** Khi Subtask khẩn cấp đó được hoàn thành hoặc bị xóa, hệ thống sẽ tự động quét lại toàn bộ Subtasks còn lại của Task. Nếu không còn Subtask nào khẩn cấp, Task cha tự động hạ mức ưu tiên về trạng thái ban đầu.

### 3.4. Chống Xung Đột Race Condition & Idempotency
- **Idempotency Interceptor:** Đính kèm mã `X-Idempotency-Key` trên các request tạo mới/thao tác quan trọng. Backend lưu cache tạm thời key này trong Redis/Memory, nếu nhận cùng 1 key trong vòng 2 giây sẽ trả về kết quả cũ mà không tạo bản ghi mới.
- **Optimistic UI Progress Lock (`LC-06`):** Khi nhân viên vừa bấm nút "Nộp duyệt", giao diện lập tức khóa nút bấm (Disable + Spinner) và cập nhật thanh tiến độ cục bộ ngay lập tức, ngăn ngừa hiện tượng giật nhấp nháy giao diện khi đang chờ phản hồi từ Server.

### 3.5. Dọn Rác Tự Động & Loại Bỏ Thông Báo Ma (`LC-11` & `CC-02`)
- **Tự động dọn rác 14 ngày (CC-02):** Toàn bộ Dự án và Task bị xóa được chuyển vào Thùng rác với chính sách lưu giữ 14 ngày (14-Day Retention). Tác vụ ngầm (Cron Job) định kỳ 00:00 hàng ngày sẽ tự động xóa vĩnh viễn (Hard Delete) các bản ghi có `deletedAt < NOW() - 14 ngày`.
- **Triệt tiêu Thông báo ma (LC-11):** Khi một Task bị chuyển vào thùng rác, toàn bộ thông báo liên quan đến Task đó sẽ được gắn cờ ẩn hoặc xóa dọn dẹp ngay lập tức (LC-11), ngăn chặn việc người dùng nhấp vào thông báo cũ bị lỗi 404 (Không tìm thấy công việc).

---

## 4. BẢNG MA TRẬN ĐỐI CHIẾU HIGH-TO-LOW

| Hạng Mục Nghiệp Vụ | Thiết Kế High-Level (Vĩ mô) | Hiện Thực Low-Level (Vi mô) |
| :--- | :--- | :--- |
| **Xác thực & Phân quyền** | Mô hình RBAC 3 cấp (Admin, Manager, Employee) bảo vệ an ninh hệ thống. | `JwtAuthGuard` + `RolesGuard` tại NestJS Controller, kết hợp Decorator `@Roles()` và xác thực chữ ký token. |
| **Bảng việc Kanban** | Kéo thả 6 cột trạng thái, cập nhật tiến độ công việc tức thời. | Fixed Portal chống rung giật cuộn chuột (`@hello-pangea/dnd`), chặn kéo lách duyệt (`LC-08`), đồng bộ Zustand store. |
| **Quản lý việc con** | Phân rã Subtasks độc lập cho từng người, tự động tính tổng tiến độ %. | Khóa quyền sửa số ngày (`LC-12`), tự động tính trọng số % hoàn thành và kế thừa cờ URGENT động. |
| **Thao tác dữ liệu** | Xóa/Khôi phục dự án và task an toàn qua Thùng rác 14 ngày. | Bọc toàn bộ trong `prisma.$transaction`, tự khôi phục dự án cha khi phục hồi task con mồ côi (`CC-01`). |
| **Đồng bộ Realtime** | Chuông thông báo phát sáng, Flyout Drawer và Toast báo việc tức thời. | `SocketGateway` broadcast theo room dự án, tự xóa thông báo ma khi task bị xóa (`LC-11`). |
| **Ổn định giao diện** | Hiệu ứng Solar Glassmorphism Dark Theme mượt mà 60 FPS. | Áp dụng mảng phòng thủ `Array.isArray` fallback, Cleanup `useEffect` listeners chống rò rỉ bộ nhớ. |

---

## 5. BÀI HỌC KINH NGHIỆM & QUY CHUẨN CODE DOANH NGHIỆP

1. **Nguyên tắc Zero Trust giữa Frontend và Backend:** Frontend validate để nâng cao trải nghiệm người dùng tức thì; Backend bắt buộc phải validate độc lập để bảo vệ sự sống còn và tính toàn vẹn của CSDL.
2. **Luôn bọc thao tác đa bảng trong Atomic Transaction:** Tuyệt đối không chạy các câu lệnh ghi CSDL rời rạc mà không có cơ chế rollback khi có lỗi phát sinh giữa chừng.
3. **Lập trình phòng thủ đa tầng (Defensive Programming):** Luôn kiểm tra null/undefined, sử dụng toán tử Optional Chaining (`?.`) và gán mảng rỗng mặc định (`[]`) trước khi thực hiện các hàm map/filter.
4. **Văn hóa ghi nhận Logic Conflicts:** Mọi trường hợp lỗi nghiệp vụ hoặc tình huống biên phát hiện trong quá trình dev/test đều phải được ghi nhận vào tài liệu tập trung để kiểm soát chất lượng lâu dài.
