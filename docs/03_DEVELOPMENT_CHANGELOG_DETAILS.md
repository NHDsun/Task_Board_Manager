# BÁO CÁO CHI TIẾT CÁC THAY ĐỔI MÃ NGUỒN DỰ ÁN (DEVELOPMENT CHANGELOG DETAILS)

Tài liệu này ghi lại toàn bộ lịch sử can thiệp mã nguồn dự án qua từng bước thực thi.

---

## 01 - 10. Khởi Tạo Cấu Trúc Dự Án Nền Tảng Monorepo (NestJS 11 Backend & Vite 8 Frontend)
- **File 1:** `be/package.json` & `be/tsconfig.json`
  - **Hành động:** `[THÊM MỚI FILE & CẤU HÌNH NESTJS]`.
  - **Chi tiết:** Khởi tạo khung ứng dụng NestJS 11, TypeScript 5.7+, cấu hình module resolution `node16` / `nodenext`.
- **File 2:** `fe/package.json` & `fe/tsconfig.json`
  - **Hành động:** `[THÊM MỚI FILE & CẤU HÌNH VITE]`.
  - **Chi tiết:** Khởi tạo React 19, Vite 8 dev server, TailwindCSS v4 engine và lucide-react icons.
- **File 3:** `.env` & `be/.env`
  - **Hành động:** `[THÊM MỚI BIẾN MÔI TRƯỜNG]`.
  - **Chi tiết:** Cấu hình `DATABASE_URL="postgresql://postgres:password123@localhost:5432/taskboard_db"` và `JWT_SECRET`.

---

## 11 - 20. Khởi Tạo Cơ Sở Dữ Liệu PostgreSQL & Mô Hình CSDL Prisma ORM
- **File 1:** `be/prisma/schema.prisma`
  - **Hành động:** `[THÊM MỚI PRISMA SCHEMA]`.
  - **Chi tiết:** 
    - Khởi tạo provider `postgresql` và client `prisma-client-js`.
    - Định nghĩa các enum `Role` ('ADMIN' | 'MANAGER' | 'EMPLOYEE') và `TaskPriority`.
    - Khởi tạo `model User`, `model Project`, `model Task`, `model Department`, `model Tag` và quan hệ khóa ngoại (Foreign Keys).
- **File 2:** `be/src/prisma/prisma.service.ts` & `be/src/prisma/prisma.module.ts`
  - **Hành động:** `[THÊM MỚI PRISMA SERVICE & MODULE]`.
  - **Chi tiết:** Khai báo Service kết nối PrismaClient toàn cục hỗ trợ Dependency Injection trong NestJS.

---

## 21 - 30. Xây Dựng Hệ Thống Xác Thực Bảo Mật Backend (AuthModule & UserModule)
- **File 1:** `be/src/modules/auth/auth.service.ts` & `be/src/modules/auth/auth.controller.ts`
  - **Hành động:** `[THÊM MỚI AUTH MODULE]`.
  - **Chi tiết:**
    - Xây dựng hàm `login()` xác thực Email/Password, so sánh mật khẩu mã hóa `bcrypt.compare`.
    - Cấu hình JwtService mã hóa Token JWT có thời hạn 7 ngày.
    - Xây dựng hàm `googleLogin()` xác thực Google Token qua Google OAuth2 API `userinfo`.
- **File 2:** `be/src/modules/auth/strategies/jwt.strategy.ts` & `be/src/modules/auth/guards/jwt-auth.guard.ts`
  - **Hành động:** `[THÊM MỚI JWT STRATEGY & GUARD]`.
  - **Chi tiết:** Bảo vệ các API endpoints yêu cầu đăng nhập bằng `JwtAuthGuard` kiểm tra chuỗi `Bearer Token` trong Header.

---

## 31 - 40. Xây Dựng Nghiệp Vụ Quản Lý Dự Án & Công Việc Cốt Lõi (ProjectModule & TaskModule)
- **File 1:** `be/src/modules/project/project.service.ts` & `project.controller.ts`
  - **Hành động:** `[THÊM MỚI PROJECT MODULE]`.
  - **Chi tiết:** Định nghĩa `CreateProjectDto`, `UpdateProjectDto` và các đường dẫn API CRUD dự án `/api/projects`.
- **File 2:** `be/src/modules/task/task.service.ts` & `task.controller.ts`
  - **Hành động:** `[THÊM MỚI TASK MODULE]`.
  - **Chi tiết:** Định nghĩa `CreateTaskDto`, `UpdateTaskStatusDto` và các đường dẫn API CRUD công việc `/api/tasks`, tích hợp sắp xếp ưu tiên `URGENT` lên đầu.

---

## 41. Thực thi Nâng cấp Giao diện Frontend UI - Bước 1: Cấu hình Vite 8 & TailwindCSS v4 Design Tokens
- **File 1:** `fe/vite.config.ts`
  - **Hành động:** `[CHỈNH SỬA CODE]`.
  - **Chi tiết:** Import `@tailwindcss/vite` plugin và thêm `tailwindcss()` vào danh sách `plugins` (`plugins: [react(), tailwindcss()]`).
  - **Mục đích:** Tối ưu hóa trình biên dịch TailwindCSS v4 HMR trực tiếp trên Vite 8.
- **File 2:** `fe/src/index.css`
  - **Hành động:** `[CHỈNH SỬA & DỌN SẠCH COMMENT]`.
  - **Chi tiết:**
    - Nhập font *Plus Jakarta Sans* từ Google Fonts.
    - Nhập `@import "tailwindcss";` cho Tailwind v4 Engine.
    - Định nghĩa các CSS variables cho bảng màu Dark Sun: `--obsidian-void` (`#070A12`), `--eclipse-surface` (`#0F172A`), `--elevated-surface` (`#1E293B`), `--solar-corona` (`#F59E0B`), `--solar-flare` (`#EF4444`), `--eclipse-violet` (`#8B5CF6`), `--emerald-orbit` (`#10B981`), `--solar-border`.
    - Định nghĩa `@keyframes coronaPulse` (xung quầng sáng mặt trời 3s) và `@keyframes accordionExpand` (hiệu ứng mở rộng form 0.35s).
    - Khai báo các utility classes: `.animate-corona-pulse`, `.animate-accordion-expand`, `.solar-glass-card`, `.solar-corona-btn`.
    - Loại bỏ toàn bộ ghi chú comment dư thừa trong file code.
- **Kết quả kiểm tra:** Chạy `npm run build` biên dịch Vite production thành công 100% trong 211ms (0 lỗi, 0 cảnh báo).

---

## 42. Thực thi Nâng cấp Giao diện Frontend UI - Bước 2: TypeScript Types, Axios Client & Zustand Auth Store
- **File 1:** `fe/src/types/auth.ts`
  - **Hành động:** `[THÊM MỚI FILE & TYPESCRIPT INTERFACES]`.
  - **Chi tiết:** Định nghĩa type `GlobalRole` ('ADMIN' | 'MANAGER' | 'EMPLOYEE') và các interfaces `User`, `LoginPayload`, `AuthResponse`.
- **File 2:** `fe/src/services/api.ts`
  - **Hành động:** `[THÊM MỚI FILE & AXIOS CLIENT]`.
  - **Chi tiết:** Khởi tạo Axios client `api` với `baseURL` từ `VITE_API_URL` (fallback `http://localhost:3000/api`) và đính kèm Request Interceptor tự động gửi `Authorization: Bearer <token>`.
- **File 3:** `fe/src/store/useAuthStore.ts`
  - **Hành động:** `[THÊM MỚI FILE & ZUSTAND STORE]`.
  - **Chi tiết:** Khởi tạo Zustand Store `useAuthStore` quản lý trạng thái tài khoản `user`, `token`, `isAuthenticated`, tích hợp hàm `setAuth` và `logout` với `localStorage`, sử dụng cú pháp `import type` tuân thủ TypeScript 6 `verbatimModuleSyntax`.
- **Kết quả kiểm tra:** Chạy `npm run build` biên dịch Vite production thành công 100% trong 230ms (0 lỗi, 0 cảnh báo).

---

## 43. Thực thi Nâng cấp Giao diện Frontend UI - Bước 3: Xây dựng Atomic React 19 Components & Màn hình Đăng Nhập LoginPage
- **File 1:** `fe/src/components/common/DarkSunLogo.tsx`
  - **Hành động:** `[THÊM MỚI FILE & COMPONENT SVG]`.
  - **Chi tiết:** Tạo component SVG đĩa Mặt Trời Đen với vòng hào quang phát sáng Corona kép (Amber Gold `#F59E0B` & Eclipse Violet `#8B5CF6`), tích hợp `animate-corona-pulse`.
- **File 2:** `fe/src/components/auth/GoogleOAuthButton.tsx`
  - **Hành động:** `[THÊM MỚI FILE & GOOGLE OAUTH COMPONENT]`.
  - **Chi tiết:** Tạo component nút đăng nhập 1-Click bằng `@react-oauth/google` dạng Glassmorphism mờ `#1E293B`, icon Google 4 màu vector chuẩn.
- **File 3:** `fe/src/components/auth/EmailLoginForm.tsx`
  - **Hành động:** `[THÊM MỚI FILE & EMAIL FORM COMPONENT]`.
  - **Chi tiết:** Tạo form Email/Password hỗ trợ ẩn/hiện accordion (`animate-accordion-expand`), icons Lucide (`Mail`, `Lock`, `Eye`, `EyeOff`, `Sparkles`), nút bấm `solar-corona-btn` và tích hợp React 19 `useTransition`.
- **File 4:** `fe/src/pages/LoginPage.tsx`
  - **Hành động:** `[THÊM MỚI FILE & TRANG DĂNG NHẬP]`.
  - **Chi tiết:** Ghép nối các component hạt nhân thành khung **Eclipse Portal Card** màu `#0F172A` nổi bật giữa nền Obsidian Void (`#070A12`), quản lý state `isEmailFormOpen`, `isLoading`, `errorMessage` và gọi API đăng nhập backend qua Axios.

---

## 58. Nâng Cấp CSDL Prisma Schema & AuthService Hỗ Trợ User Profile Cá Nhân Mở Rộng
- **File 1:** `be/prisma/schema.prisma`
  - **Hành động:** `[CẬP NHẬT PRISMA SCHEMA]`.
  - **Chi tiết:**
    - Định nghĩa `enum Profession` (`DEV`, `TESTER`, `DESIGNER`, `BA`, `MARKETING`, `DEVOPS`, `PRODUCT_OWNER`) và `enum UserStatusSignal` (`ONLINE`, `BUSY`, `IN_MEETING`, `AWAY`, `OFFLINE`).
    - Bổ sung 7 cột mới vào `model User`: `coverImage`, `profession`, `jobTitle`, `phone`, `bio`, `statusSignal`, `customStatus`.
- **File 2:** `be/src/modules/auth/auth.service.ts`
  - **Hành động:** `[CẬP NHẬT CODE AUTH SERVICE]`.
  - **Chi tiết:** Cập nhật các hàm `login()`, `googleLogin()`, `getProfile()` trả về đầy đủ các trường thông tin Profile mở rộng.
- **File 3:** `fe/src/types/auth.ts`
  - **Hành động:** `[CẬP NHẬT TYPESCRIPT INTERFACES]`.
  - **Chi tiết:** Định nghĩa các types `Profession`, `UserStatusSignal` và bổ sung thuộc tính tương ứng vào interface `User`.
- **File 4:** `be/prisma/seed.ts`
  - **Hành động:** `[CẬP NHẬT SEED DATA]`.
  - **Chi tiết:** Bổ sung dữ liệu Profile mẫu cho tài khoản Admin `huydatne@gmail.com` (`jobTitle: 'System Architect & Lead Admin'`, `profession: DEV`, ảnh Avatar & Cover HD).
- **Kết quả kiểm tra:** Biên dịch `npx prisma generate` thành công 100% trong 736ms; NestJS Backend & Vite Frontend biên dịch thành công 0 lỗi.

---

## 59. Xây Dựng Trang Hồ Sơ Cá Nhân ProfilePage Chuẩn UI UX Pro Max Dark Sun Eclipse
- **File 1:** `fe/src/pages/ProfilePage.tsx`
  - **Hành động:** `[THÊM MỚI FILE & COMPONENT PAGE]`.
  - **Chi tiết:**
    - Xây dựng giao diện Hồ Sơ Cá Nhân lộng lẫy chuẩn UI UX Pro Max: Khung Banner Ảnh Bìa Vũ Trụ (`coverImage`), Avatar HD viền phát sáng nhịp thở 3D (`animate-corona-pulse`).
    - Thẻ Bento Profile Header hiển thị Họ Tên, Chức Danh (`jobTitle`), Badge Quyền Hạn (`globalRole: ADMIN`), Badge Tay Nghề (`profession: DEV`) và Quầng sáng Trạng thái Hiện diện (`statusSignal: ONLINE`).
    - Khối Bento Grid 3 Cột: Thông tin liên hệ (`email`, `phone`, `department`), Tiểu sử Bio/Phương châm làm việc, và Thống kê năng suất thời gian thực (`Task Hoàn Thành`, `Solaris Streak Badge`).
- **File 2:** `fe/src/App.tsx`
  - **Hành động:** `[CẬP NHẬT ROUTING ĐIỀU HƯỚNG MẶC ĐỊNH]`.
  - **Chi tiết:** Đổi luồng hiển thị sau khi Đăng Nhập thành công (`isAuthenticated === true`) sang hiển thị trang `<ProfilePage />`.
- **Kết quả kiểm tra:** Chạy `npm --prefix fe run build` biên dịch sản phẩm production thành công 100% trong **320ms** (0 lỗi, 0 cảnh báo).

---

## 60. Xây Dựng Thanh Menu Sao Băng Duy Trì Trên Mọi Trang & Khôi Phục Hiệu Ứng Chuyển Cảnh Sau Đăng Nhập
- **File 1:** `fe/src/components/navigation/MeteorEdgeMenu.tsx`
  - **Hành động:** `[THÊM MỚI FILE & COMPONENT MENU]`.
  - **Chi tiết:** Xây dựng Thanh Menu Sao Băng Trượt Rìa Màn Hình (`MeteorEdgeMenu`) duy trì hiển thị trên mọi trang/route (`/profile`, `/tasks`, `/meetings`, `/messages`, `/attendance`, `/requests`, `/admin/users`, `/settings`), tích hợp hiệu ứng đuôi sao băng đa sắc khi hover và tự động thu gọn (Auto-Hide Edge Docking) để giải phóng 100% diện tích không gian làm việc.
- **File 2:** `fe/src/components/auth/LoginTransitionWarp.tsx`
  - **Hành động:** `[THÊM MỚI FILE & WARP ANIMATION COMPONENT]`.
  - **Chi tiết:** Xây dựng Component điều phối hiệu ứng chuyển cảnh Vũ Trụ sau Đăng nhập (Pha 1: Bùng nổ quầng sáng Mặt Trời Đen 300ms ➡️ Pha 2: Vệt sao băng quét toàn màn hình 450ms ➡️ Pha 3: Trượt mở MainLayout với Menu Sao Băng & ProfilePage 3D).
- **File 3:** `fe/src/layouts/MainLayout.tsx`
  - **Hành động:** `[THÊM MỚI LAYOUT COMPONENT]`.
  - **Chi tiết:** Tạo Khung Layout bọc toàn bộ các trang, đính kèm `MeteorEdgeMenu` nằm ở lề trái duy trì hiển thị trên mọi trang.
- **File 4:** `fe/src/App.tsx`
  - **Hành động:** `[CẬP NHẬT LUỒNG CHUYỂN CẢNH & NAVIGATION]`.
  - **Chi tiết:** Tích hợp `LoginTransitionWarp` khi vừa đăng nhập thành công và bọc tất cả các view trang trong `MainLayout`.
- **Kết quả kiểm tra:** Chạy `npm --prefix fe run build` biên dịch sản phẩm production thành công 100% trong **312ms** (0 lỗi, 0 cảnh báo).

---

## 61. Cấu Hình Quy Tắc Cộng Tác Adaptable Collaboration Protocol
- **File 1:** `.agents/rules/01_COLLABORATION_RULES.md`
  - **Hành động:** `[THÊM MỚI FILE RULE DỰ ÁN]`.
  - **Chi tiết:** Định nghĩa quy tắc phân chia công việc: Hướng dẫn người dùng tự code các event đơn giản trên FE; tự động thực hiện các khối logic phức tạp hoặc backend.

---

## 62. Tích Hợp Thư Viện `@hello-pangea/dnd` Cho Trang Task Board
- **File 1:** `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[CHỈNH SỬA CODE DRAG & DROP]`.
  - **Chi tiết:** Thay thế HTML5 Native Drag Drop bằng `DragDropContext`, `Droppable`, `Draggable` của `@hello-pangea/dnd`. Tích hợp quy tắc Drag Ownership (EMPLOYEE chỉ được kéo task của mình) và Khóa 2 chiều cột `IN_REVIEW`.

---

## 63. Thêm Bảng Modal Kính Mờ Xác Nhận Khi Kéo Task Sang Cột DONE
- **File 1:** `fe/src/components/common/SolarNotificationModal.tsx`
  - **Hành động:** `[BỔ SUNG PROPS XÁC NHẬN]`.
  - **Chi tiết:** Bổ sung `confirmText` và `onConfirm` hiển thị 2 nút [Hủy Bỏ] và [🚀 Xác Nhận Hoàn Thành].
- **File 2:** `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[KẾT NỐI MODAL XÁC NHẬN DONE]`.
  - **Chi tiết:** Bật Modal xác nhận khi người dùng nhả Task vào cột `DONE` trước khi cập nhật % tiến độ lên 100%.

---

## 64. Thêm Animation 3D Hào Quang Kéo Thả & Khắc Phục Lỗi Che Khuất Qua React Portal
- **File 1:** `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[THÊM ANIMATION 3D & REACT PORTAL]`.
  - **Chi tiết:**
    - Tích hợp hiệu ứng `rotate-2`, `scale-105`, `shadow-[0_0_60px_rgba(245,158,11,0.8)]` khi kéo Card.
    - Sử dụng `ReactDOM.createPortal(cardElement, document.body)` đưa thẻ Card kéo trực tiếp ra ngoài `document.body`, khắc phục dứt điểm 100% lỗi thẻ bị che sau các cột lân cận.
    - Tối ưu hóa hiệu ứng thả rơi lò xo vật lý 60 FPS mượt mà (`transform-gpu`).

---

## 65. Xây Dựng Minisite Xem Chi Tiết Task (`TaskDetailModal.tsx`)
- **File 1:** `fe/src/components/kanban/TaskDetailModal.tsx`
  - **Hành động:** `[THÊM MỚI COMPONENT MINISITE]`.
  - **Chi tiết:** Tạo Minisite Bento Grid hiển thị chi tiết Task (% tiến độ, Assignee, Deadline, Tag, Mô tả nhiệm vụ và Khối Bình luận thời gian thực).
- **File 2:** `fe/src/components/kanban/KanbanCard.tsx` & `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[KẾT NỐI SỰ KIỆN CLICK MỞ MINISITE]`.
  - **Chi tiết:** Gán sự kiện `onCardClick` cho mọi thẻ Task Card mở Minisite xem chi tiết khi người dùng click vào.

---

## 66. Bổ Sung Dữ Liệu Mẫu Thực Tế Trực Tiếp Vào CSDL PostgreSQL (No Static Mock Data Rule)
- **File 1:** `.agents/rules/02_NO_STATIC_MOCK_DATA_RULE.md`
  - **Hành động:** `[THÊM MỚI FILE RULE]`.
  - **Chi tiết:** Cấm khởi tạo dữ liệu giả tĩnh hardcode trong file mã nguồn FE/BE, bắt buộc lưu trữ và nạp qua CSDL PostgreSQL.
- **File 2:** `be/prisma/seed.ts`
  - **Hành động:** `[CẬP NHẬT FILE SEED DỮ LIỆU]`.
  - **Chi tiết:** Seed toàn bộ dữ liệu mẫu thực tế về Departments, Users, Projects, Tasks, Task Requests vào PostgreSQL.
- **File 3:** `be/src/modules/task/task.service.ts` & `task.controller.ts`
  - **Hành động:** `[THÊM API GET /api/tasks]`.
  - **Chi tiết:** Xây dựng hàm `findAll()` truy vấn danh sách Task thực tế từ CSDL PostgreSQL kèm bộ lọc đa tiêu chí.
- **File 4:** `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[XÓA MẢNG MOCK TĨNH & NỐI API]`.
  - **Chi tiết:** Xóa mảng mock tĩnh hardcode, gọi API `GET /api/tasks` và `PATCH /api/tasks/:id/status` đồng bộ trực tiếp với CSDL PostgreSQL.

---

## 67. Bổ Sung Nút Tạo Dự Án Mới & Tạo Task Mới Phân Quyền Vai Trò (Admin & Manager)
- **File 1:** `fe/src/components/kanban/CreateProjectModal.tsx`
  - **Hành động:** `[THÊM MỚI COMPONENT MODAL TẠO DỰ ÁN]`.
  - **Chi tiết:** Tạo Modal khởi tạo Dự Án mới kết nối API `POST /api/projects` lưu trực tiếp vào CSDL PostgreSQL.
- **File 2:** `fe/src/components/kanban/CreateTaskModal.tsx`
  - **Hành động:** `[THÊM MỚI COMPONENT MODAL TẠO TASK]`.
  - **Chi tiết:** Tạo Modal khởi tạo Task mới kết nối API `POST /api/tasks` lưu trực tiếp vào CSDL PostgreSQL.
- **File 3:** `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[TÍCH HỢP NÚT TẠO DỰ ÁN & TẠO TASK VÀI TRÒ ADMIN/MANAGER]`.
  - **Chi tiết:** Hiển thị 2 nút bấm **[+ Tạo Dự Án Mới]** và **[+ Tạo Task Mới]** trên Header Bar phân quyền cho `ADMIN` và `MANAGER`, ẩn tự động với `EMPLOYEE`.
- **Kết quả kiểm tra:** Biên dịch `npm --prefix fe run build` sản phẩm production thành công 100% trong **409ms** (0 lỗi, 0 cảnh báo).

---

## 68. Thêm Tính Năng Xóa Task Phân Quyền Vai Trò (Admin & Manager)
- **File 1:** `be/src/modules/task/task.service.ts` & `task.controller.ts`
  - **Hành động:** `[THÊM API DELETE /api/tasks/:id]`.
  - **Chi tiết:** Xây dựng hàm `deleteTask()` kiểm tra quyền `ADMIN` hoặc `MANAGER` trước khi thực thi xóa Task khỏi CSDL PostgreSQL.
- **File 2:** `fe/src/components/kanban/DeleteTaskConfirmModal.tsx`
  - **Hành động:** `[THÊM MỚI MODAL XÁC NHẬN XÓA]`.
  - **Chi tiết:** Tạo Modal xác nhận xóa Task phong cách Solar Dark Glassmorphic với nút xác nhận xóa vĩnh viễn.
- **File 3:** `fe/src/components/kanban/TaskDetailModal.tsx` & `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[TÍCH HỢP NÚT XÓA VÀ HÀM THỰC THI]`.
  - **Chi tiết:** Thêm nút **[🗑️ Xóa Nhiệm Vụ]** ở footer Minisite phân quyền cho Admin/Manager và kết nối handler xóa Optimistic UI.

---

## 69. Nâng Cấp Tối Ưu Chỉ Mục CSDL PostgreSQL Composite Indexes & Phân Trang
- **File 1:** `be/prisma/schema.prisma`
  - **Hành động:** `[BỔ SUNG COMPOSITE INDEXES]`.
  - **Chi tiết:** Thêm các chỉ mục composite `@@index([projectId, status])`, `@@index([assigneeId, status])`, `@@index([receiverId, status])` tối ưu tốc độ truy vấn CSDL PostgreSQL.
- **File 2:** `be/src/modules/task/dto/query-task-filter.dto.ts` & `task.service.ts`
  - **Hành động:** `[THÊM THAM SỐ PAGE & LIMIT]`.
  - **Chi tiết:** Bổ sung `page` và `limit` vào Query DTO và áp dụng `skip`/`take` trong Prisma query.

---

## 70. Tối Ưu Phản Hồi Kéo Thả 0ms Latency & Hiệu Ứng Solar Drop Snap Animation
- **File 1:** `fe/src/components/kanban/KanbanCard.tsx`
  - **Hành động:** `[TỐI ƯU TRANSITION & REACT.MEMO]`.
  - **Chi tiết:** Chuyển `transition-all` sang `transition-[border-color,box-shadow,background-color] duration-150`, bọc `React.memo` cho Card chống re-render giật lag.
- **File 2:** `fe/src/index.css`
  - **Hành động:** `[THÊM ANIMATION KEYFRAMES]`.
  - **Chi tiết:** Định nghĩa `@keyframes solarDropSnap` và `.animate-solar-drop-snap` tạo hiệu ứng nảy nhún đàn hồi và tỏa ánh hổ phách khi thả Card.
- **File 3:** `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[TỐI ƯU PORTAL CONTAINER & SYNCHRONOUS DRAG END]`.
  - **Chi tiết:** Xây dựng `#solar-dnd-portal` cố định (`inset: 0`, `overflow: hidden`) triệt tiêu 100% hiện tượng bị che bởi cột và giật nảy thanh cuộn màn hình.

---

## 71. Chuẩn Hóa Dữ Liệu Minisite Bàn Giao (Task Transfer Detail)
- **File 1:** `be/src/modules/task/task.service.ts` & `fe/src/components/kanban/KanbanCard.tsx`
  - **Hành động:** `[BỔ SUNG CREATED BY & TYPED REFERENCES]`.
  - **Chi tiết:** Trả về `createdBy` từ backend DTO, định nghĩa lại `TaskItem` interface và hiển thị linh hoạt Badge trạng thái `🔒 IN_REVIEW (CHỜ DUYỆT BÀI)` / `✅ BÀN GIAO THÀNH CÔNG` cùng thông tin Avatar/Tên người chuyển và người nhận.
- **File 2:** `be/prisma/seed.ts`
  - **Hành động:** `[CẬP NHẬT TASK REQUEST SEED]`.
  - **Chi tiết:** Đã tạo bản ghi `TaskRequest` chuẩn nghiệp vụ cho Task Mobile Bento Grid (Sender: Duy Khang -> Receiver: Minh Anh).

---

## 72. Cài Đặt Kiến Trúc Retry Enterprise (Exponential Backoff + Full Jitter + Circuit Breaker + Idempotency Interceptor)
- **File 1:** `fe/src/utils/circuitBreaker.ts`
  - **Hành động:** `[THÊM MỚI UTILITY CIRCUIT BREAKER]`.
  - **Chi tiết:** Xây dựng bộ Cầu dao ngắt tự động 3 trạng thái (`CLOSED`, `OPEN`, `HALF_OPEN`) tự ngắt kết nối 15s nếu gặp 4 lỗi liên tiếp (Fail-Fast).
- **File 2:** `fe/src/utils/apiRetry.ts`
  - **Hành động:** `[THÊM MỚI UTILITY FETCH WITH RETRY]`.
  - **Chi tiết:** Tích hợp lùi thời gian ngẫu nhiên Full Jitter, tự động gắn Header `X-Idempotency-Key` UUID cho các lệnh `POST`, `PATCH`, `PUT`, `DELETE` và kết nối với Circuit Breaker.
- **File 3:** `be/src/common/interceptors/idempotency.interceptor.ts` & `be/src/app.module.ts`
  - **Hành động:** `[THÊM MỚI INTERCEPTOR & ĐĂNG KÝ TOÀN CỤC]`.
  - **Chi tiết:** Xây dựng `IdempotencyInterceptor` trong NestJS Backend đăng ký `APP_INTERCEPTOR` cache kết quả theo Key 5 phút, chặn 100% rủi ro ghi trùng CSDL PostgreSQL khi Retry.

---

## 73. Sửa Lỗi Bảo Mật & Đa Truy VẤN CSDL (Code Audit Bug Fixes)
- **File 1:** `be/src/modules/task/task.service.ts`
  - **Hành động:** `[BỌC PRISMA TRANSACTIONS]`.
  - **Chi tiết:** Bọc toàn bộ các lệnh đa truy vấn CSDL trong `cancelTaskRequest` và `respondToRequest` vào `this.prisma.$transaction(...)` đảm bảo tính nguyên tố Atomic 100%.
- **File 2:** `be/src/modules/task/task.controller.ts` & `project.controller.ts`
  - **Hành động:** `[LOẠI BỎ HARDCODED ADMIN FALLBACK]`.
  - **Chi tiết:** Thay thế chuỗi fallback `'admin-huydat-id'` bằng hàm `extractUserId(req)` quăng `UnauthorizedException` chuẩn mực nếu phiên đăng nhập không hợp lệ.
- **File 3:** `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[TÍCH HỢP PHÂN TRANG FETCH TASKS]`.
  - **Chi tiết:** Thêm `limit=300` vào `GET /api/tasks?limit=300` bảo vệ bộ nhớ RAM trình duyệt.


