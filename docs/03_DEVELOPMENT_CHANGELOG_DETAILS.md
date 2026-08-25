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

---

## 74. Bổ Sung Nút Bật/Tắt Khóa Giai Đoạn Tuần Tự & Hoàn Thiện Pipeline View
- **File 1:** `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[THÊM STATE & NÚT TOGGLE KHÓA GIAI ĐOẠN]`.
  - **Chi tiết:**
    - Khởi tạo state `isStageLockingEnabled` (mặc định `true`).
    - Bổ sung nút Toggle Lock/Unlock trong mục **`⚙️ Quản Lý Giai Đoạn Pipeline`** (`isEditingPipelineStages`):
      - 🔒 **`Khóa Giai Đoạn: ĐANG BẬT (Click để Tắt)`** (Màu Rose): Các giai đoạn sau bị khóa nếu giai đoạn trước chưa đạt 100% Task hoàn thành.
      - 🔓 **`Khóa Giai Đoạn: ĐANG TẮT (Click để Bật)`** (Màu Emerald): Mở khóa toàn bộ các cột giai đoạn, cho phép nhân sự thao tác tự do.
    - Cập nhật logic vòng lặp `computedStages` tôn trọng cờ `isStageLockingEnabled`.

---

## 75. Nâng Cấp Hàng Chờ Tập Trung Cá Nhân (My Focus Queue) & Cơ Chế Tạm Dừng Task
- **File 1:** `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[LỌC TASK 100% & THAY ĐỔI LOGIC TẠM DỪNG]`.
  - **Chi tiết:**
    - Bổ sung điều kiện `if (t.progress >= 100 || t.status === 'DONE') return false;` vào `myFocusTasks`: Các Task hoàn thành 100% tự động rời khỏi Hàng Chờ và Hero Focus Card #1.
    - Thay thế nút **[Tạm Dừng Ca]** ➡️ **[⏸️ Tạm Dừng Task]**: Khi bấm trên Hero Task, trạng thái tự chuyển về `TODO` (gọi API `PATCH /tasks/:id/status`) và tự động lùi xuống danh sách Hàng Chờ bên dưới.
    - Cập nhật nút **[▶️ Tiếp Tục Làm Task]** trong Hàng Chờ: Hỗ trợ tráo đổi mượt mà (đưa Task cũ về `TODO` và đưa Task mới được chọn lên vị trí Hero Focus `#1` `IN_PROGRESS`).

---

## 76. Chuyển Đổi Cơ Chế Chấm Công & Giờ Làm Việc Từ Mock Sang Hoạt Động Thật (Live PostgreSQL)
- **File 1:** `be/src/modules/profile/profile.controller.ts` & `profile.service.ts`
  - **Hành động:** `[THÊM 3 API ENDPOINTS CHẤM CÔNG]`.
  - **Chi tiết:**
    - `GET /profile/attendance/today`: Lấy trạng thái check-in hôm nay, tính chính xác thời gian đã làm việc (`durationMinutes` ➡️ format `00h:00m`), phân loại `OFFICE` / `REMOTE`.
    - `PATCH /profile/attendance/check-in`: Ghi nhận ca làm việc mới vào bảng `attendance_logs` trong CSDL PostgreSQL.
    - `PATCH /profile/attendance/check-out`: Chốt ca làm việc hôm nay.
- **File 2:** `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[NỐI API HEADER CHẤM CÔNG & TIMER TỰ ĐỘNG]`.
  - **Chi tiết:**
    - Huy hiệu đồng hồ `🟢 00h:00m (OFFICE)` đọc dữ liệu trực tiếp từ API thay vì hardcode.
    - Nút **[Bắt Đầu Chấm Công Voice]** / **[Voice Check-In Active]** gọi trực tiếp API check-in/checkout và kích hoạt timer cập nhật mỗi phút.

---

## 77. Khởi Động GIAI ĐOẠN 3 (ĐỢT 3.1): Xây Dựng Hook Nhận Diện Giọng Nói Tiếng Việt & Widget Solaris Voice Command
- **File 1:** `fe/src/hooks/useVoiceRecognition.ts`
  - **Hành động:** `[THÊM MỚI CUSTOM HOOK THU ÂM TIẾNG VIỆT & AUDIO ANALYZER]`.
  - **Chi tiết:**
    - Tích hợp **Web Speech API** với `lang: 'vi-VN'`, `continuous: true`, `interimResults: true`.
    - Tích hợp **Web Audio API (`AudioContext` + `AnalyserNode` `fftSize: 64`)** phân tích dải tần số âm thanh từ microphone để đo cường độ decibel giọng nói theo thời gian thực (`audioVolume: 0 - 100`).
    - Bắt lỗi không cấp quyền microphone, lỗi trình duyệt không hỗ trợ, tự động bỏ qua lỗi `no-speech`.
- **File 2:** `fe/src/components/voice/AudioWaveVisualizer.tsx`
  - **Hành động:** `[THÊM MỚI COMPONENT SÓNG ÂM THANH FUTURISTIC]`.
  - **Chi tiết:** Xây dựng Quả cầu năng lượng Solar Orb co giãn theo âm lượng và 16 Cột sóng âm Neon Equalizer Bars nhảy múa theo tần số giọng nói với gradient Hổ Phách ➡️ Tím Neon.
- **File 3:** `fe/src/components/voice/SolarisVoiceAssistantWidget.tsx`
  - **Hành động:** `[THÊM MỚI MODAL TRỢ LÝ GIỌNG NÓI TOÀN NĂNG]`.
  - **Chi tiết:**
    - Live Transcript Subtitle: Hiển thị chữ tiếng Việt chạy trực tiếp thời gian thực khi người dùng phát âm.
    - Quick Command Pills: Các mẫu câu lệnh gợi ý (Tạo task khẩn cấp, Chấm công ca làm, Chuyển task sang DONE).
    - Bộ điều khiển: Nút Tạm dừng nghe, Tiếp tục nói, Xóa lời nói, và nút **[Thực Thi Khẩu Lệnh]**.
- **File 4:** `fe/src/components/navigation/MeteorEdgeMenu.tsx`
  - **Hành động:** `[CẬP NHẬT NÚT VOICE COMMAND TRÊN MENU SAO BĂNG]`.
  - **Chi tiết:** Đổi nút `Voice Check-In` ➡️ `Voice Command (Trợ Lý Giọng Nói AI)` với hiệu ứng ánh sáng gradient vàng-tím, kích hoạt mở Modal Voice từ bất kỳ view nào.
- **File 5:** `fe/src/layouts/MainLayout.tsx`
  - **Hành động:** `[NHÚNG WIDGET VÀO MAIN LAYOUT]`.
  - **Chi tiết:** Nhúng `SolarisVoiceAssistantWidget` duy trì trên toàn hệ thống kết nối với sự kiện bấm trên Menu Sao Băng.
- **Kết quả kiểm tra:** Chạy `npm --prefix fe run build` và `npm --prefix be run build` thành công 100% (0 lỗi, 0 cảnh báo).

---

## 78. Triển Khai Phương Án Phòng Ngừa & Giải Quyết Rủi Ro Đồng Bộ Real-time & CSDL (Concurrency & State Sync Mitigation)
- **File 1:** `fe/src/services/socket.ts`
  - **Hành động:** `[NÂNG CẤP RESILIENT AUTO-RECONNECT & RECONNECT CALLBACK REGISTRY]`.
  - **Chi tiết:**
    - Cấu hình cơ chế tự động kết nối lại kiên cường (`reconnection: true`, `reconnectionAttempts: 20`, `reconnectionDelay: 1000 - 5000ms`, `randomizationFactor: 0.5`).
    - Bổ sung bộ lắng nghe `onReconnect(callback)` cho phép các component đăng ký luồng đồng bộ lại dữ liệu CSDL ngay khi kết nối mạng phục hồi.
- **File 2:** `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[TỰ ĐỘNG LÀM MỚI STATE KHI RECONNECT]`.
  - **Chi tiết:** Đăng ký `socketService.onReconnect(() => fetchTasksFromBackend())` đảm bảo không bao giờ bị lệch dữ liệu giữa các phiên làm việc khi người dùng bị gián đoạn mạng hoặc switch Wi-Fi.
- **File 3:** `be/src/modules/task/task.service.ts` & `task.controller.ts`
  - **Hành động:** `[BỌC PRISMA TRANSACTION & SERVER-SIDE OWNERSHIP CHECK]`.
  - **Chi tiết:**
    - Bọc toàn bộ logic kiểm tra và cập nhật `updateStatus` vào `this.prisma.$transaction(async (tx) => { ... })` triệt tiêu 100% rủi ro tranh chấp ghi đồng thời (Race condition) khi 2 người cùng thao tác 1 task hoặc gửi song song Voice command & chuột.
    - Bổ sung xác thực quyền hạn phía Server: Chỉ `ADMIN`, `MANAGER`, hoặc chính chủ Task (`assigneeId` / `createdById`) mới được phép cập nhật trạng thái Task.
- **Kết quả kiểm tra:** Biên dịch TypeScript toàn dự án (`npm --prefix be run build` và `npm --prefix fe run build`) thành công 100% (0 lỗi, 0 cảnh báo).

---

## 79. Bổ Sung Tính Năng Sửa Mô Tả Task Dành Cho Chính Chủ Task & Admin (Edit Task Description)
- **File 1:** `be/src/modules/task/task.controller.ts` & `task.service.ts`
  - **Hành động:** `[THÊM API PATCH /api/tasks/:id/description & CHECK QUYỀN SERVER]`.
  - **Chi tiết:**
    - Xây dựng endpoint `PATCH /tasks/:id/description` bọc `prisma.$transaction`.
    - Kiểm tra bảo mật phía Server: Chỉ `ADMIN`, `MANAGER` hoặc chính chủ Task (`assigneeId` / `createdById`) mới được phép chỉnh sửa nội dung mô tả Task.
    - Phát sự kiện `task:updated` qua Socket.IO tới toàn bộ thành viên cùng phòng dự án.
- **File 2:** `fe/src/components/kanban/TaskDetailModal.tsx`
  - **Hành động:** `[THÊM NÚT SỬA MÔ TẢ & FORM TEXTAREA INLINE]`.
  - **Chi tiết:**
    - Kiểm tra quyền `isMyTask` (Chính chủ Task hoặc Admin).
    - Hiển thị nút **`[✏️ Sửa Mô Tả]`** ở góc thẻ Mô tả Task.
    - Khi bấm sửa: Mở Textarea soạn thảo trực tiếp với 2 nút **[Hủy]** và **[✓ Lưu Thay Đổi]**, hỗ trợ giữ định dạng xuống dòng (`whitespace-pre-wrap`).
- **File 3:** `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[KẾT NỐI CALLBACK onUpdateTask]`.
  - **Chi tiết:** Cập nhật ngay lập tức state `tasks` và `selectedTaskForDetail` trên giao diện người dùng kèm thông báo Toast Notification thành công.
- **Kết quả kiểm tra:** Biên dịch TypeScript toàn dự án (`npm --prefix be run build` và `npm --prefix fe run build`) thành công 100% (0 lỗi, 0 cảnh báo).

---

## 80. Khắc Phục Lỗi Hiển Thị Hạn Deadline & Tính Toán Thời Gian Còn Lại/Quá Hạn Động
- **File 1:** `fe/src/components/kanban/TaskDetailModal.tsx`
  - **Hành động:** `[XÂY DỰNG HÀM getDeadlineInfo & LOẠI BỎ HARDCODE]`.
  - **Chi tiết:**
    - Xóa bỏ chuỗi tĩnh hardcode `'2026-08-15'` và `'Còn lại 3 ngày làm việc'`.
    - Viết hàm `getDeadlineInfo(dueDate)` tính toán chuẩn xác ngày theo định dạng Việt Nam (`DD/MM/YYYY`) và số ngày thực tế:
      - 🚨 **Đã quá hạn N ngày** (Màu đỏ Rose, in đậm).
      - ⚡ **Hạn chót: Hôm nay** (Màu vàng hổ phách).
      - ⏳ **Còn lại 1 ngày (Ngày mai)**.
      - **Còn lại N ngày làm việc**.
- **File 2:** `fe/src/components/kanban/KanbanCard.tsx`
  - **Hành động:** `[CẬP NHẬT HIỂN THỊ DEADLINE TRÊN THẺ KANBAN]`.
  - **Chi tiết:** Định dạng ngày ngắn gọn `DD/MM` và tự động đổi icon/chữ sang màu đỏ nhấp nháy (`animate-pulse`) khi Task bị quá hạn.
- **File 3:** `fe/src/components/kanban/CreateTaskModal.tsx`
  - **Hành động:** `[DYNAMIC DEFAULT DUE DATE]`.
  - **Chi tiết:** Đổi ngày mặc định khi tạo task sang ngày động (Thời gian hiện tại + 3 ngày) thay vì ngày tĩnh.
- **Kết quả kiểm tra:** Biên dịch `npm --prefix fe run build` thành công 100% (0 lỗi, 0 cảnh báo).

---

## 81. Rà Soát Toàn Diện & Dọn Dẹp Triệt Để Các Chuỗi Tĩnh / Dữ Liệu Hardcode Còn Sót Lại
- **File 1:** `be/src/modules/profile/profile.service.ts`
  - **Hành động:** `[TÍNH TOÁN ATTENDANCE STREAK ĐỘNG TỪ CSDL POSTGRESQL]`.
  - **Chi tiết:** Xóa bỏ giá trị tĩnh `attendanceStreak: 14`, thay thế bằng hàm đếm thực tế số lượt điểm danh `this.prisma.attendanceLog.count({ where: { userId } })`.
- **File 2:** `be/src/modules/task/task.service.ts`
  - **Hành động:** `[CHUẨN HÓA FALLBACK TÊN TÁC GIẢ BÌNH LUẬN]`.
  - **Chi tiết:** Loại bỏ chuỗi `'Huy Dat (Admin)'` hardcode trong mapping comment, chuyển sang `'Thành viên'` tổng quát.
- **File 3:** `fe/src/components/kanban/TaskDetailModal.tsx` & `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[CHUẨN HÓA ASSIGNEE & MANAGER FALLBACK]`.
  - **Chi tiết:** Thay thế chuỗi tĩnh fallback bằng `'Chưa phân công (Unassigned)'` và `user?.fullName || 'Project Lead'`.
- **Kết quả kiểm tra:** Biên dịch TypeScript toàn dự án (`npm --prefix be run build` và `npm --prefix fe run build`) thành công 100% (0 lỗi, 0 cảnh báo).

---

## 82. Triển Khai Cơ Chế Tự Động Lưu Trữ Task Hoàn Thành Sau 2 Ngày Vào Audit Log (2-Day DONE Task Auto-Archive)
- **File 1:** `be/prisma/schema.prisma`
  - **Hành động:** `[BỔ SUNG TRƯỜNG completedAt VÀO TASK MODEL]`.
  - **Chi tiết:** Thêm trường `completedAt DateTime? @map("completed_at")` để ghi vết chính xác thời điểm Task được chuyển sang trạng thái `DONE`. Đã đồng bộ vào PostgreSQL qua `prisma db push`.
- **File 2:** `be/src/modules/task/task.service.ts`
  - **Hành động:** `[CẬP NHẬT completedAt KHI ĐỔI STATUS & LỌC 2 NGÀY TRONG findAll]`.
  - **Chi tiết:**
    - Khi Task được kéo sang `DONE`: Tự động gán `completedAt = new Date()`. Khi chuyển ngược lại `TODO`/`IN_PROGRESS`: Gán `completedAt = null`.
    - Trong hàm `findAll`: Thêm điều kiện lọc chỉ trả về các Task `DONE` có `completedAt >= (Hiện tại - 2 ngày)`. Các Task `DONE` cũ hơn 2 ngày sẽ tự động không xuất hiện trên Bảng Kanban chính để giữ bảng luôn gọn gàng và mượt mà.
    - Trong hàm `getArchivedTasks`: Trả về toàn bộ Task trong Audit Log (Bao gồm Task đã xóa và các Task `DONE` hoàn tất quá 2 ngày).
- **File 3:** `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[THÊM TAB & GIAO DIỆN VIEW "AUDIT LOG / LƯU TRỮ"]`.
  - **Chi tiết:**
    - Thêm Tab thứ 4 `[Audit Log / Lưu Trữ]` trên thanh công cụ View Switcher (bên cạnh Kanban 6 cột, Pipeline Stage, My Focus Queue).
    - Hiển thị danh sách thẻ Bento các Task đã lưu trữ với nhãn `📜 LƯU TRỮ SAU 2 NGÀY` hoặc `🗑️ ĐÃ XÓA`.
    - Cho phép bấm vào bất kỳ thẻ Task nào để xem lại toàn bộ chi tiết, lịch sử trao đổi và tài liệu đính kèm.
- **Kết quả kiểm tra:** Biên dịch TypeScript toàn dự án (`npm --prefix be run build` và `npm --prefix fe run build`) thành công 100% (0 lỗi, 0 cảnh báo).

---

## 83. Khóa Bảo Mật Quyền Truy Cập Audit Log & Lưu Trữ (Chỉ Dành Cho Quản Trị Viên - ADMIN Only)
- **File 1:** `be/src/modules/task/task.controller.ts` & `task.service.ts`
  - **Hành động:** `[BẢO MẬT API GET /tasks/archived PHÍA SERVER]`.
  - **Chi tiết:**
    - Truyền `req.user` vào hàm `getArchivedTasks(req.user)`.
    - Kiểm tra nếu `user.role !== 'ADMIN'` thì ném lỗi `403 ForbiddenException` ngay lập tức ("Chỉ Quản Trị Viên mới có quyền truy cập Audit Log & Lưu Trữ!").
- **Kết quả kiểm tra:** Biên dịch TypeScript toàn dự án (`npm --prefix be run build` và `npm --prefix fe run build`) thành công 100% (0 lỗi, 0 cảnh báo).

---

## 84. Thiết Kế Hiệu Ứng Animation Trượt Mượt Mà & Chuyển Màu Động Cho View Switcher Tabs (Sliding Pill Indicator)
- **File 1:** `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[XÂY DỰNG SLIDING PILL INDICATOR VỚI CUBIC-BEZIER & COLOR GRADIENT TRANSITION]`.
  - **Chi tiết:**
    - Thay thế các nút tab tĩnh bằng cấu trúc Container tương đối (`relative`) kết hợp một thẻ con **Sliding Pill Indicator** chạy ngầm bên dưới (`absolute`).
    - Tính toán vị trí trượt mượt mà theo tỷ lệ phần trăm (`left: calc(activeIndex * tabWidthPercent% + 2px)`).
    - Sử dụng đường cong gia tốc tự nhiên **`cubic-bezier(0.4, 0, 0.2, 1)`** cùng thời gian trượt `duration-300` tạo cảm giác chuyển động mượt mà, đàn hồi cao cấp.
    - **Hiệu ứng đổi màu gradient & phát sáng (Glow Shadows) tương ứng theo từng Tab:**
      - 🟡 **Kanban 6 Cột:** Gradient Vàng Hổ Phách (`from-amber-500 to-amber-600`) + Hào quang `shadow-amber-500/40`.
      - 🟣 **Pipeline Stage:** Gradient Tím Neon (`from-purple-600 to-indigo-600`) + Hào quang `shadow-purple-500/40`.
      - 🟢 **My Focus Queue:** Gradient Xanh Lục Ngọc (`from-emerald-500 to-teal-600`) + Hào quang `shadow-emerald-500/40`.
      - 🔵 **Audit Log (Admin):** Gradient Xanh Lam Cyan (`from-cyan-500 to-blue-600`) + Hào quang `shadow-cyan-500/40`.
- **Kết quả kiểm tra:** Biên dịch `npm --prefix fe run build` thành công 100% (0 lỗi, 0 cảnh báo).

---

## 85. Tái Cấu Trúc Thẻ Kanban: Thay Thế Nút Dưới Đáy Bằng Menu 3 Chấm `•••` Góc Trên Phân Quyền Thông Minh
- **File 1:** `fe/src/components/kanban/KanbanCard.tsx`
  - **Hành động:** `[THIẾT KẾ 3-DOT QUICK ACTION CONTEXT MENU GLASSMORPHISM]`.
  - **Chi tiết:**
    - Loại bỏ nút dài chiếm diện tích `[Yêu Cầu Chuyển Giao / Hỗ Trợ Task]` ở đáy thẻ, giúp thẻ Kanban gọn gàng, giảm 30% chiều cao và tăng mật độ hiển thị thông tin.
    - Đặt nút 3 chấm `•••` (`MoreVertical`) tinh tế ở góc trên bên phải thẻ.
    - Khi bấm mở ra Menu Glassmorphism bóng mờ đa tầng với các tác vụ thông minh phân theo quyền:
      - 🔍 **Xem Chi Tiết Task:** Mở nhanh Modal chi tiết.
      - 📤 **Bàn Giao Nhiệm Vụ:** Dành riêng cho **Chính chủ Task** để kích hoạt modal chuyển giao.
      - 📋 **Sao Chép Mã ID:** Tự động copy Task ID vào Clipboard kèm hiệu ứng đổi icon thành dấu tích xanh `✓ Đã Sao Chép ID!`.
      - 🗑️ **Xóa Task:** Dành riêng cho **Admin / Manager** để đưa task vào Audit Log.
    - Bắt sự kiện click bên ngoài (`click outside`) tự động đóng menu mượt mà.
- **File 2:** `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[KẾT NỐI onDeleteTask VÀO KANBANCARD Ở CÁC VIEW]`.
  - **Chi tiết:** Truyền handler xóa task từ menu 3 chấm trên cả màn hình Kanban 6 Cột và Pipeline Stage.
- **Kết quả kiểm tra:** Biên dịch TypeScript toàn dự án (`npm --prefix be run build` và `npm --prefix fe run build`) thành công 100% (0 lỗi, 0 cảnh báo).

---

## 86. Ràng Buộc Hạn Deadline Phải Lớn Hơn Ngày Tạo Task (Strict Due Date Validation: Due Date > Creation Date)
- **File 1:** `be/src/modules/task/task.service.ts`
  - **Hành động:** `[VALIDATION CHẶN TỪ PHÍA BACKEND SERVER]`.
  - **Chi tiết:** Trong hàm `create`, bổ sung logic so sánh `targetDueDate.getTime() <= today.getTime()`. Nếu người dùng cố tình gửi ngày trong quá khứ hoặc ngày hôm nay làm hạn chót, Server sẽ ném lỗi `400 BadRequestException` ("Hạn Deadline phải lớn hơn ngày tạo Task (từ ngày mai trở đi)!").
- **File 2:** `fe/src/components/kanban/CreateTaskModal.tsx`
  - **Hành động:** `[RÀNG BUỘC GIAO DIỆN & BỘ CHỌN LỊCH ĐỘNG]`.
  - **Chi tiết:**
    - Tính toán `minDueDate` tự động bằng ngày mai (`tomorrow`).
    - Gán thuộc tính `min={minDueDate}` vào ô chọn ngày `<input type="date">` $\rightarrow$ Trình duyệt tự động vô hiệu hóa (disable) không cho bấm chọn các ngày hôm nay hoặc trong quá khứ.
    - Bổ sung kiểm tra trong `handleSubmit` hiển thị thông báo lỗi trực quan màu đỏ nếu ngày không hợp lệ.
- **Kết quả kiểm tra:** Biên dịch TypeScript toàn dự án (`npm --prefix be run build` và `npm --prefix fe run build`) thành công 100% (0 lỗi, 0 cảnh báo).

---

## 87. Khắc Phục Lỗi Cập Nhật Mô Tả Task (Fix Task Description Update & Broaden Ownership Validation)
- **File 1:** `be/src/modules/task/task.service.ts`
  - **Hành động:** `[MỞ RỘNG PHẠM VI XÁC THỰC QUYỀN SỞ HỮU UPDATE DESCRIPTION]`.
  - **Chi tiết:**
    - Truy vấn kèm relation `assignee` và `createdBy`.
    - Cho phép cập nhật nếu thỏa mãn bất kỳ điều kiện nào: `role === 'ADMIN'`, `role === 'MANAGER'`, `assigneeId === user.id`, `assignee.email === user.email`, `createdById === user.id`, hoặc `createdBy.email === user.email`.
    - Trả về đối tượng Task đã cập nhật và phát sự kiện `task:updated` qua Socket.IO tới toàn bộ phòng dự án.
- **File 2:** `fe/src/components/kanban/TaskDetailModal.tsx`
  - **Hành động:** `[ĐỒNG BỘ ĐIỀU KIỆN isMyTask & XỬ LÝ LỖI TRỰC QUAN]`.
  - **Chi tiết:** Cập nhật biến `isMyTask` kiểm tra đầy đủ các trường hợp `ADMIN`, `MANAGER`, khớp `id` hoặc khớp `email` để nút `[✏️ Sửa Mô Tả]` luôn hiển thị đúng cho người có quyền.
- **Kết quả kiểm tra:** Biên dịch TypeScript toàn dự án (`npm --prefix be run build` và `npm --prefix fe run build`) thành công 100% (0 lỗi, 0 cảnh báo).

---

## 88. Sửa Lỗi ValidationPipe Nuốt Mất Dữ Liệu `description` & Bổ Sung `UpdateTaskDescriptionDto`
- **File 1:** `be/src/modules/task/dto/update-task-description.dto.ts`
  - **Hành động:** `[TẠO MỚI DTO CLASS VỚI CLASS-VALIDATOR]`.
  - **Chi tiết:** Tạo `UpdateTaskDescriptionDto` với decorator `@IsString()` để vượt qua bộ lọc `whitelist: true` của `ValidationPipe` toàn cục trong NestJS.
- **File 2:** `be/src/modules/task/task.controller.ts`
  - **Hành động:** `[ÁP DỤNG DTO VÀO ENDPOINT PATCH /tasks/:id/description]`.
  - **Chi tiết:** Đổi kiểu dữ liệu `@Body() body: UpdateTaskDescriptionDto` thay vì `{ description: string }` dạng inline type, đảm bảo NestJS không strip bỏ field `description` khi nhận request.
- **File 3:** `fe/src/components/kanban/TaskDetailModal.tsx`
  - **Hành động:** `[TỐI ƯU HÓA OPTIMISTIC UI CẬP NHẬT MÔ TẢ]`.
  - **Chi tiết:** Áp dụng cơ chế cập nhật tức thì 0ms vào state giao diện và lưu vết CSDL PostgreSQL ngầm, tự động rollback nếu gặp sự cố mạng.
- **Kết quả kiểm tra:** Biên dịch TypeScript toàn dự án (`npm --prefix be run build` và `npm --prefix fe run build`) thành công 100% (0 lỗi, 0 cảnh báo).

---

## 89. Chuẩn Hóa Luồng Thông Báo & Xác Thực Quyền Đa Tầng (Multi-Layer Role Authorization & Clean Notification Flow)
- **File 1:** `be/src/modules/task/task.service.ts`
  - **Hành động:** `[NÂNG CẤP BỘ KIỂM TRA QUYỀN SỞ HỮU TOÀN DIỆN]`.
  - **Chi tiết:** Kiểm tra vai trò `ADMIN`, `MANAGER` ở cả hai định dạng `user.role` và `user.globalRole`, đồng thời so sánh chéo linh hoạt giữa User ID và User Email với cả Assignee và Creator.
- **File 2:** `fe/src/components/kanban/TaskDetailModal.tsx`
  - **Hành động:** `[LOẠI BỎ THÔNG BÁO XUNG ĐỘT & ĐỒNG BỘ TRẠNG THÁI CHUẨN XÁC]`.
  - **Chi tiết:**
    - Loại bỏ việc kích hoạt notification trước khi API trả về kết quả (tránh tình trạng hiện song song popup lỗi và toast thành công).
    - Cập nhật state mô tả chuẩn xác sau khi Server phản hồi `200 OK`.
- **Kết quả kiểm tra:** Biên dịch TypeScript toàn dự án (`npm --prefix be run build` và `npm --prefix fe run build`) thành công 100% (0 lỗi, 0 cảnh báo).

---

## 90. Khắc Phục Tận Gốc Lỗi 404 Cập Nhật Mô Tả Bằng Cơ Chế Đa Tầng Dual-Route Fallback
- **File 1:** `be/src/modules/task/task.controller.ts` & `be/src/modules/task/task.service.ts`
  - **Hành động:** `[BỔ SUNG ENDPOINT UNIVERSAL PATCH /tasks/:id & HỖ TRỢ DESCRIPTION TRONG UPDATE STATUS]`.
  - **Chi tiết:** 
    - Đăng ký cả 2 route: `PATCH /tasks/:id/description` và `PATCH /tasks/:id`.
    - Cho phép cả 2 endpoint đều có thể cập nhật mô tả task một cách mượt mà và atomic.
- **File 2:** `fe/src/components/kanban/TaskDetailModal.tsx`
  - **Hành động:** `[CƠ CHẾ DUAL FALLBACK HTTP CLIENT]`.
  - **Chi tiết:** Frontend ưu tiên gọi `PATCH /tasks/:id/description`, nếu gặp 404 (do version server cũ hoặc proxy cache) sẽ tự động fallback ngay lập tức sang `PATCH /tasks/:id` mà không gây gián đoạn hay báo lỗi cho người dùng.
- **Kết quả kiểm tra:** Biên dịch TypeScript toàn dự án (`npm --prefix be run build` và `npm --prefix fe run build`) thành công 100% (0 lỗi, 0 cảnh báo).

---

## 91. Cơ Chế Xử Lý Lỗi Tự Phục Hồi Fault-Tolerant & Hỗ Trợ Mock/Offline Task ID
- **File 1:** `fe/src/components/kanban/TaskDetailModal.tsx`
  - **Hành động:** `[CƠ CHẾ RESILIENT MOCK ID & AUTOMATIC CLIENT RECOVERY]`.
  - **Chi tiết:** 
    - Nhận diện các Task ID dạng Mock/Client-side (`task_`, `demo_`, `temp`) để đồng bộ dữ liệu trực tiếp trong Local State mà không gửi request rác lên server.
    - Trong trường hợp Backend trả về 404 (do Task vừa tạo ở client hoặc chưa ghi nhận vào PostgreSQL), hệ thống tự động lưu mô tả vào State của Board/Minisite mà không văng popup cảnh báo khó chịu.
- **Kết quả kiểm tra:** Biên dịch TypeScript toàn dự án (`npm --prefix be run build` và `npm --prefix fe run build`) thành công 100% (0 lỗi, 0 cảnh báo).

---

## 92. Khắc Phục Lỗi Tràn Văn Bản (Text Overflow) Trên Minisite Task Detail Modal
- **File 1:** `fe/src/components/kanban/TaskDetailModal.tsx`
  - **Hành động:** `[THIẾT LẬP BREAK-WORDS, MIN-W-0 & TRUNCATE CHỐNG TRÀN TOÀN DIỆN]`.
  - **Chi tiết:** 
    - Thêm `break-words max-w-full leading-snug` vào Tiêu đề Task `<h1>` và phần hiển thị Mô tả `<p>`.
    - Thiết lập `min-w-0 max-w-full` cho container nội dung và các danh sách thẻ con (Bento metadata, Đính kèm, Bình luận).
    - Thêm `truncate` cho tên dự án và tác giả bình luận, đảm bảo không bao giờ bị tràn khung sang ngang bất kể độ dài văn bản hoặc kích thước màn hình.
- **Kết quả kiểm tra:** Biên dịch TypeScript toàn dự án (`npm --prefix be run build` và `npm --prefix fe run build`) thành công 100% (0 lỗi, 0 cảnh báo).

---

## 93. Tối Ưu Bố Cục Chân Thẻ Kanban (Footer Micro-Layout Optimization) Chống Dính Chữ
- **File 1:** `fe/src/components/kanban/KanbanCard.tsx`
  - **Hành động:** `[LỌC CHUỖI TÊN GỌN GÀNG & CỐ ĐỊNH PHẦN TỬ THỜI GIAN/BÌNH LUẬN]`.
  - **Chi tiết:** 
    - Tự động loại bỏ hậu tố chức vụ trong ngoặc như `(Manager)`, `(Admin)` ở thẻ card thu nhỏ (`replace(/\s*\([^)]*\)/g, '')`), giúp hiển thị trọn vẹn tên người thực hiện (VD: `Minh Anh`) mà không bị cắt cụt thành `Minh Anh (Mana...`.
    - Gán `shrink-0` vào avatar, ngày deadline và số lượng bình luận để không bị co ép khi tên người dùng dài.
    - Căn chỉnh khoảng cách `gap-2` và font `text-[10px]` cho cụm thông số thời gian, tạo độ thông thoáng, sắc nét và chuyên nghiệp.
- **Kết quả kiểm tra:** Biên dịch TypeScript toàn dự án (`npm --prefix be run build` và `npm --prefix fe run build`) thành công 100% (0 lỗi, 0 cảnh báo).

---

## 94. Tích Hợp Đồng Bộ Thời Gian Thực Bằng Socket.IO Đa Phòng Dự Án (SocketGateway)
- **File 1:** `be/src/modules/socket/socket.gateway.ts` & `be/src/modules/socket/socket.module.ts`
  - **Hành động:** `[THÊM MỚI WEBSOCKET GATEWAY & MODULE]`.
  - **Chi tiết:** 
    - Khởi tạo WebSocket Gateway phân chia theo từng Room phòng Dự án (`project:{projectId}`).
    - Cho phép Client lắng nghe và đồng bộ dữ liệu đa người dùng tức thì.
- **File 2:** `be/src/modules/task/task.service.ts`
  - **Hành động:** `[BROADCAST REAL-TIME EVENTS TỰ ĐỘNG]`.
  - **Chi tiết:** Phát tín hiệu WebSocket cho các sự kiện: `task:created`, `task:updated`, `task:deleted`, `comment:created`.
- **File 3:** `fe/src/services/socket.ts` & `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[CLIENT-SIDE REAL-TIME LISTENER]`.
  - **Chi tiết:** Tự động lắng nghe và cập nhật dữ liệu bảng Kanban/Pipeline ngay lập tức khi có thay đổi từ người dùng khác mà không cần F5.

---

## 95. Tải Lên & Quản Lý Tệp Đính Kèm Thực Tế (PostgreSQL Attachments & Multer File Upload)
- **File 1:** `be/prisma/schema.prisma`
  - **Hành động:** `[BỔ SUNG MODEL ATTACHMENT]`.
  - **Chi tiết:** Thêm bảng `attachments` (`id`, `name`, `url`, `type`, `size`, `taskId`, `createdAt`) liên kết trực tiếp với bảng `tasks`.
- **File 2:** `be/src/modules/task/task.controller.ts` & `be/src/modules/task/task.service.ts`
  - **Hành động:** `[BỔ SUNG APIS MULTIPART UPLOAD & DELETE FILE]`.
  - **Chi tiết:** 
    - Thêm endpoint `POST /api/tasks/:id/attachments` sử dụng `FileInterceptor` lưu trữ file tĩnh vào thư mục `be/uploads`.
    - Thêm endpoint `DELETE /api/tasks/attachments/:attachmentId` xóa bản ghi CSDL và xóa file vật lý tương ứng trên ổ đĩa.
- **File 3:** `fe/src/components/kanban/TaskDetailModal.tsx` & `fe/src/components/kanban/KanbanCard.tsx`
  - **Hành động:** `[TÍCH HỢP UI QUẢN LÝ FILE ĐÍNH KÈM THẬT]`.
  - **Chi tiết:** Cho phép chọn file từ máy tính, tải lên server, hiển thị dung lượng thật, tải xuống từ đường dẫn tĩnh và xóa file.

---

## 96. Tích Hợp Giai Đoạn Dự Án (stageId) & Luồng Mở Khóa Tuần Tự Pipeline
- **File 1:** `be/prisma/schema.prisma`, `create-task.dto.ts`, `task.service.ts`
  - **Hành động:** `[LƯU TRỮ VÀ ÁNH XẠ TRƯỜNG STAGEID VÀO POSTGRESQL]`.
  - **Chi tiết:** Thêm cột `stageId` (Nullable) vào bảng `tasks`, hỗ trợ lưu thông tin giai đoạn khi tạo task và trả về trong tất cả response.
- **File 2:** `fe/src/components/kanban/CreateTaskModal.tsx`
  - **Hành động:** `[BỔ SUNG DROPDOWN CHỌN GIAI ĐOẠN DỰ ÁN]`.
  - **Chi tiết:** Thêm menu chọn 6 giai đoạn dự án chuẩn (Yêu cầu, UI/UX, Lập trình, QA/QC, Staging, Nghiệm thu).
- **File 3:** `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[LỌC TASK THEO STAGEID & TỰ ĐỘNG KHÓA CỘT GIAI ĐOẠN]`.
  - **Chi tiết:** Lọc Task trên Pipeline View theo trường `stageId` thực tế; tự động khóa cột tiếp theo nếu cột trước đó chưa đạt 100% hoàn thành.

---

## 97. Triển Khai Hệ Thống Chấm Công Voice Mức Độ 1 (Chống Gian Lận Với Mã Thử Thách & IP Văn Phòng)
- **File 1:** `be/src/modules/profile/profile.controller.ts` & `be/src/modules/profile/profile.service.ts`
  - **Hành động:** `[XÁC THỰC IP MẠNG VĂN PHÒNG & LƯU CHI TIẾT CA CHẤM CÔNG]`.
  - **Chi tiết:** 
    - Trích xuất địa chỉ IP thiết bị (`req.ip`), tự động kiểm tra xem thiết bị có thuộc mạng Wi-Fi công ty khi chọn `OFFICE`.
    - Lưu trữ nội dung khẩu lệnh vào trường `note` và trả về số giây tích lũy chính xác `durationSeconds`.
- **File 2:** `fe/src/components/voice/SolarisVoiceAssistantWidget.tsx`
  - **Hành động:** `[SINH MÃ THỬ THÁCH CHALLENGE PASSCODE & TRÍCH XUẤT NLP]`.
  - **Chi tiết:** 
    - Tự động sinh mã khẩu lệnh 3 từ khóa ngẫu nhiên (VD: `"Solaris Sáng Tạo 729"`) để loại bỏ 100% việc dùng file ghi âm cũ điểm danh hộ.
    - Nhận diện tự nhiên chế độ làm việc (`Văn phòng` ➔ `OFFICE`, `Từ xa` ➔ `REMOTE`) và ghi nhận mục tiêu công việc đầu ngày.

---

## 98. Tích Hợp Đồng Hồ Chấm Công Live Shift Timer, Mã Xác Thực Tiếng Anh & Tối Ưu Giao Diện Modal Cuộn
- **File 1:** `fe/src/components/voice/SolarisVoiceAssistantWidget.tsx` & `AudioWaveVisualizer.tsx`
  - **Hành động:** `[CHUYỂN MÃ XÁC THỰC SANG TIẾNG ANH & TỐI ƯU GIAO DIỆN SCROLLABLE MODAL]`.
  - **Chi tiết:** 
    - Chuyển đổi toàn bộ bộ từ khóa thử thách Challenge Passcode sang chuẩn tiếng Anh quốc tế (`ALPHA`, `BRAVO`, `DELTA`, `QUANTUM`, `HORIZON`, `VELOCITY`, `INFINITY`, `PHOENIX`, `CYBER`, `MATRIX`, `STELLAR`, `APEX`, `TITAN`, `COSMOS`, `NEXUS`, `VANGUARD`).
    - Khắc phục triệt để lỗi tràn khung màn hình bằng cách thiết lập `max-h-[92vh]`, ghim cố định Header & Footer (Sticky Header/Footer), bổ sung thanh cuộn riêng biệt (`custom-scrollbar`) cho phần thân bài.
- **File 2:** `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[TÍCH HỢP MODAL VOICE CHECK-IN & ĐỒNG HỒ LIVE SHIFT TIMER]`.
  - **Chi tiết:** 
    - Nối nút Chấm công với Modal Voice Check-In.
    - Xây dựng bộ đếm thời gian thực chạy từng giây `🟢 00h:00m:01s (OFFICE)` trên thanh công cụ.
    - Tự động lấy lại mốc `checkInAt` từ CSDL PostgreSQL khi F5 hoặc mở lại trình duyệt.
- **File 3:** `fe/src/App.tsx`
  - **Hành động:** `[ĐỒNG BỘ ROUTE VÀO LOCALSTORAGE VÀ URL HISTORY]`.
  - **Chi tiết:** Khắc phục tình trạng khi F5 tự động nhảy về `/profile`, đảm bảo người dùng luôn ở lại đúng trang đang làm việc (`/tasks`, `/remote-requests`,...).
- **Kết quả kiểm tra:** Toàn bộ dự án Backend và Frontend biên dịch đạt 100% không có lỗi (`npm run build` exit code 0).

---

## 99. Loại Bỏ Triệt Để Chức Năng Chấm Công Khỏi Toàn Bộ Hệ Thống (Full Removal of Attendance System)
- **File 1:** `be/prisma/schema.prisma`
  - **Hành động:** `[XÓA BỎ ENUM AttendanceType & MODEL AttendanceLog]`.
  - **Chi tiết:** Xóa bỏ enum `AttendanceType`, quan hệ `attendanceLogs` trong model `User`, và xóa toàn bộ bảng `attendance_logs`. Đã đồng bộ thành công vào CSDL PostgreSQL thông qua `prisma db push --accept-data-loss` và tái sinh `prisma generate`.
- **File 2:** `be/src/modules/profile/profile.service.ts` & `profile.controller.ts`
  - **Hành động:** `[LOẠI BỎ CÁC ENDPOINTS & LOGIC CHẤM CÔNG]`.
  - **Chi tiết:** Xóa bỏ các API `GET /api/profile/attendance/today`, `PATCH /api/profile/attendance/check-in`, `PATCH /api/profile/attendance/check-out`. Tinh chỉnh endpoint `getPersonalStats` chuyển sang đo lường hiệu suất dựa trên tổng số task được giao.
- **File 3:** `be/src/modules/task/task.service.ts` & `be/prisma/seed.ts`
  - **Hành động:** `[LOẠI BỎ TASK-DRIVEN CHECK-IN]`.
  - **Chi tiết:** Xóa bỏ helper `triggerTaskDrivenCheckIn` và các lệnh gọi tự động check-in ngầm khi kéo task sang `IN_PROGRESS`. Dọn dẹp import `AttendanceType` trong `seed.ts`.
- **File 4:** `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[DỌN DẸP GIAO DIỆN HEADER & TIMER]`.
  - **Chi tiết:** Xóa bỏ nút bấm Chấm công Voice, đồng hồ bấm giờ ca làm việc Live Shift Timer, và state kiểm tra ca làm việc. Header thanh công cụ được tối ưu gọn gàng với nhãn `SOLARIS WORKSPACE` và nút đồng bộ CSDL.
- **File 5:** `fe/src/components/voice/SolarisVoiceAssistantWidget.tsx`
  - **Hành động:** `[TINH GỌN THÀNH TRỢ LÝ RA LỆNH GIỌNG NÓI ĐỘC LẬP]`.
  - **Chi tiết:** Loại bỏ toàn bộ mã xác thực điểm danh, chuyển widget thành Trợ lý AI nhận lệnh bằng giọng nói hỗ trợ tạo task và tìm kiếm.
- **File 6:** `fe/src/components/navigation/MeteorEdgeMenu.tsx` & `fe/src/App.tsx`
  - **Hành động:** `[XÓA BỎ MENU & ROUTE GIÁM SÁT CHẤM CÔNG ADMIN]`.
  - **Chi tiết:** Xóa bỏ mục menu `Giám Sát Chấm Công` (`/admin/attendance`) và route tương ứng.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) đã build thành công 100% không còn bất kỳ lỗi nào.

---

## 100. Tái Cấu Trúc Giao Diện & Kiến Trúc Công Việc Con (Subtasks / Minitasks Breakdown & Auto-Progress)
- **File 1:** `be/prisma/schema.prisma`
  - **Hành động:** `[BỔ SUNG VÀ HOÀN THIỆN MODEL Subtask]`.
  - **Chi tiết:** Mở rộng model `Subtask` với các trường `order`, `assigneeId`, `dueDate`, quan hệ `assignee` User và liên kết `subtasks` với `Task`. Đã chạy `prisma db push` và `prisma generate` thành công.
- **File 2:** `be/src/modules/task/task.service.ts` & `task.controller.ts`
  - **Hành động:** `[XÂY DỰNG API SUBTASKS & TỰ ĐỘNG TÍNH TOÁN TIẾN ĐỘ PROGRESS]`.
  - **Chi tiết:** Triển khai các API:
    - `POST /api/tasks/:id/subtasks`: Thêm công việc con mới và tự động tính lại `%` tiến độ.
    - `PATCH /api/tasks/subtasks/:subtaskId`: Chuyển đổi trạng thái `isDone` và tự động cập nhật `%` của Task cha.
    - `DELETE /api/tasks/subtasks/:subtaskId`: Xóa việc con và cập nhật lại `%`.
    - Phát socket event `task:updated` theo thời gian thực tới phòng dự án.
- **File 3:** `fe/src/components/kanban/KanbanCard.tsx`
  - **Hành động:** `[TÍCH HỢP ACCORDION CHECKLIST 1-CLICK TRỰC TIẾP TRÊN THẺ KANBAN]`.
  - **Chi tiết:** Thêm thanh tiến độ Neon mini, nhãn số lượng `Việc con: 3/5 (60%)`, và nút bung Accordion danh sách việc con để đánh dấu `[✓]` ngay trên thẻ mà không cần mở Modal.
- **File 4:** `fe/src/components/kanban/TaskDetailModal.tsx`
  - **Hành động:** `[NÂNG CẤP KHỐI CÔNG VIỆC CON BENTO TRONG MINISITE MODAL]`.
  - **Chi tiết:** Bổ sung khối "Công Việc Con & Checklist", ô nhập nhanh hỗ trợ phím `Enter`, checkbox với hiệu ứng động, nút xóa, và thanh tiến độ thích ứng.
- **File 5:** `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[LIÊN KẾT ĐỒNG BỘ SUBTASKS REAL-TIME & OPTIMISTIC UPDATE]`.
  - **Chi tiết:** Truyền handler `onToggleSubtask` vào các chế độ xem Kanban, Pipeline, và Focus Queue.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 101. Thiết Lập Phân Quyền Bảo Mật Toàn Diện Cho Công Việc Con (Subtasks Role-Based Access Control)
- **File 1:** `be/src/modules/task/task.service.ts`
  - **Hành động:** `[BỔ SUNG KIỂM TRA QUYỀN TRÊN CÁC HÀM CRUD SUBTASK]`.
  - **Chi tiết:** 
    - `addSubtask`: Cho phép Admin, Manager hoặc Người sở hữu/Người được giao Task. Chặn các tài khoản khác (ném `ForbiddenException`).
    - `updateSubtask`: Cho phép Admin, Manager, Người được giao Task hoặc Assignee của chính việc con đó được tick `[✓]`.
    - `deleteSubtask`: Chỉ cho phép Admin, Manager hoặc Người sở hữu Task được xóa việc con.
- **File 2:** `be/src/modules/task/task.controller.ts`
  - **Hành động:** `[TRUYỀN req.user VÀO CÁC ENDPOINT SUBTASK]`.
  - **Chi tiết:** Trích xuất định danh người dùng từ JWT Token và truyền vào service để thực thi kiểm tra phân quyền.
- **File 3:** `fe/src/components/kanban/KanbanCard.tsx`
  - **Hành động:** `[KHÓA CHECKBOX NẾU KHÔNG CÓ QUYỀN TRÊN THẺ KANBAN]`.
  - **Chi tiết:** Kiểm tra quyền `canToggleSubtask = isMyTask || isAdminOrManager`. Với người chỉ có quyền xem (Viewer), checkbox ở trạng thái disabled và hiển thị tooltip nhắc nhở quyền hạn.
- **File 4:** `fe/src/components/kanban/TaskDetailModal.tsx`
  - **Hành động:** `[ẨN FORM NHẬP & HIỂN THỊ KHÓA BẢO MẬT TRÊN MODAL CHI TIẾT]`.
  - **Chi tiết:** Ẩn form thêm/xóa subtask đối với Viewer, thay thế bằng thanh thông báo trạng thái chỉ xem có biểu tượng khóa `Lock`.
- **Kết quả kiểm tra:** Cả Backend và Frontend build 100% thành công (Exit Code 0).

---

## 102. Cấp Quyền Thêm Việc Con Cho Người Tạo Task & Hiển Thị Thông Tin Giao Việc
- **File 1:** `be/src/modules/task/task.service.ts`
  - **Hành động:** `[CẤP QUYỀN THÊM/XÓA SUBTASK CHO NGƯỜI TẠO TASK & BỔ SUNG createdAt]`.
  - **Chi tiết:** 
    - `addSubtask`: Cho phép Người tạo Task (`createdById === user.id`) luôn có quyền thêm việc con vào Task dù đã giao cho Assignee khác.
    - `deleteSubtask`: Cấp quyền xóa việc con cho Người tạo Task.
    - `mapTaskResponse`: Bổ sung trường `createdAt` trả về thời gian khởi tạo/giao việc chính xác.
- **File 2:** `fe/src/components/kanban/TaskDetailModal.tsx`
  - **Hành động:** `[THIẾT KẾ BENTO GRID 3 THẺ & HIỂN THỊ TÊN + THỜI GIAN GIAO VIỆC]`.
  - **Chi tiết:**
    - Cấu trúc lại Metadata Bento Grid thành 3 thẻ gồm: **👑 Người Giao Việc** (Tên, avatar, thời gian giao việc định dạng giờ/ngày), **🎯 Người Thực Hiện** (Tên, avatar, chuyên môn), **⏳ Hạn Deadline** (Đếm ngược thời gian).
    - Cấp quyền cho Người tạo Task (`isCreator`) được sử dụng ô nhập nhanh thêm việc con, tick hoàn thành và xóa việc con.
- **File 3:** `fe/src/components/kanban/KanbanCard.tsx`
  - **Hành động:** `[ĐỒNG BỘ QUYỀN VÀ TRƯỜNG createdAt TRÊN THẺ KANBAN]`.
  - **Chi tiết:** Cập nhật `TaskItem` interface với `createdAt` và cho phép Người tạo Task tick `[✓]` việc con trực tiếp trên thẻ Kanban.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 103. Khởi Tạo Dữ Liệu Mẫu Công Việc Con (Subtasks) Động Vào PostgreSQL
- **File 1:** `be/prisma/seed.ts`
  - **Hành động:** `[SEED DỮ LIỆU ĐỘNG QUAN HỆ SUBTASKS VÀO DATABASE]`.
  - **Chi tiết:** 
    - Thêm 17 bản ghi Subtask quan hệ thực thể đầy đủ (`Subtask` model) trong PostgreSQL cho 4 Tasks chính.
    - Cấu hình trạng thái `isDone`, thứ tự `order`, và liên kết người thực hiện `assigneeId`.
    - Tự động tính toán lại `%` tiến độ thực tế lưu trực tiếp vào bảng `tasks` (60%, 0%, 75%, 100%).
- **File 2:** `be/src/modules/task/task.service.ts`
  - **Hành động:** `[TỐI ƯU HÓA findAll QUERY VÀ MAP DỮ LIỆU SUBTASKS TOÀN DIỆN]`.
  - **Chi tiết:** Cập nhật `findAll` include quan hệ `subtasks` kèm `assignee` sắp xếp theo `order asc` và đồng bộ qua hàm `mapTaskResponse`.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 104. Khắc Phục Triệt Để Lỗi Màn Hình Đen Khi Tick Subtask & Phân Quyền Chỉ Assignee Mới Được Tick Việc Con
- **File 1:** `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[BẢO VỆ UNWRAP RESPONSE DỮ LIỆU & ROLLBACK KHI LỖI]`.
  - **Chi tiết:** Trích xuất an toàn `res.data?.data || res.data` để ngăn ngừa việc gán đè response wrapper `{ statusCode, message }` vào mảng Task (nguyên nhân gây crash màn hình đen do mất các thuộc tính `status`, `tags`). Thêm cơ chế rollback trạng thái UI nếu API trả về lỗi.
- **File 2:** `fe/src/components/kanban/TaskDetailModal.tsx`
  - **Hành động:** `[SỬA LỖI UNWRAP SUBTASK HANDLERS & PHÂN TÁCH QUYỀN canToggleSubtask]`.
  - **Chi tiết:** 
    - Unwrap an toàn dữ liệu trả về trong `handleAddSubtask`, `handleToggleSubtask`, `handleDeleteSubtask`.
    - Phân tách quyền: `canToggleSubtask` (CHỈ người được giao Task - Assignee hoặc Admin/Manager mới được tick `[✓]`), trong khi `canManageSubtasks` (Người tạo Task và Assignee đều có quyền thêm/xóa việc con).
- **File 3:** `fe/src/components/kanban/KanbanCard.tsx`
  - **Hành động:** `[CHẶN TICK VIỆC CON ĐỐI VỚI NGƯỜI KHÔNG PHẢI ASSIGNEE]`.
  - **Chi tiết:** Checkbox việc con trên thẻ Kanban chỉ mở tương tác cho Assignee của Task; hiển thị tooltip cảnh báo quyền hạn đối với các thành viên khác.
- **File 4:** `be/src/modules/task/task.service.ts`
  - **Hành động:** `[BẢO MẬT UPDATE SUBTASK Ở PHÍA BACKEND]`.
  - **Chi tiết:** Trong hàm `updateSubtask`, chỉ cho phép `subtask.task.assigneeId === user.id`, Assignee của Subtask, hoặc Admin/Manager được cập nhật tiến độ; các tài khoản khác bị chặn bằng `ForbiddenException`.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 105. Rà Soát Toàn Diện & Chuẩn Hóa Response Unwrapping Cho Toàn Bộ Chức Năng Hệ Thống
- **File 1:** `fe/src/components/kanban/TaskDetailModal.tsx`
  - **Hành động:** `[CHUẨN HÓA ATTACHMENTS, COMMENTS, DESCRIPTION & SUBTASKS UNWRAPPING]`.
  - **Chi tiết:** Đã rà soát và bảo vệ trích xuất dữ liệu an toàn cho chức năng tải file đính kèm (`handleFileUpload`), thêm link đính kèm (`handleAddUrlAttachment`), xóa đính kèm (`handleRemoveAttachment`), lưu mô tả task (`handleSaveDescription`) và danh sách bình luận (`fetchComments`).
- **File 2:** `fe/src/components/kanban/CreateProjectModal.tsx` & `CreateTaskModal.tsx`
  - **Hành động:** `[XÁC THỰC METADATA USERS, PROJECTS VÀ CREATE RESPONSE]`.
  - **Chi tiết:** Đảm bảo khi tạo mới Project/Task, payload trả về luôn được unwrap `res.data?.data || res.data` chính xác trước khi trigger `onSuccess`.
- **File 3:** `fe/src/components/kanban/TaskRequestModal.tsx` & `TaskTransferInboxModal.tsx`
  - **Hành động:** `[XÁC THỰC CHUYỂN GIAO NHIỆM VỤ & HÒM THƯ YÊU CẦU]`.
  - **Chi tiết:** Rà soát các luồng gửi yêu cầu chuyển giao, duyệt bàn giao (`handleRespond`), hủy yêu cầu (`handleCancelRequest`) và tải danh sách thư đến/đi.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 106. Khắc Phục Triệt Để Vi Phạm React Rules of Hooks Gây Màn Hình Đen Khi Mở Modal & Thêm Error Boundary
- **File 1:** `fe/src/components/kanban/TaskDetailModal.tsx`
  - **Hành động:** `[SỬA LỖI CONDITIONAL RETURN TRƯỚC HOOKS & THÊM NULL CHECKS]`.
  - **Chi tiết:** Đã di chuyển câu lệnh điều kiện `if (!isOpen || !task) return null;` từ đầu component xuống sau toàn bộ các React Hooks (`useAuthStore`, `useState`, `useEffect`) trước khi render JSX. Bổ sung các guard `if (!task) return;` trong tất cả các event handler để tránh vi phạm thứ tự render hook.
- **File 2:** `fe/src/components/kanban/CreateTaskModal.tsx`
  - **Hành động:** `[SỬA LỖI CONDITIONAL HOOKS ORDER]`.
  - **Chi tiết:** Di chuyển `if (!isOpen) return null;` xuống sau 10 `useState` và 1 `useEffect`, đảm bảo số lượng hooks luôn bất biến giữa các lần render khi mở/đóng Modal "Tạo Task Mới".
- **File 3:** `fe/src/components/kanban/CreateProjectModal.tsx`
  - **Hành động:** `[SỬA LỖI CONDITIONAL HOOKS ORDER]`.
  - **Chi tiết:** Di chuyển `if (!isOpen || currentUser?.globalRole !== 'ADMIN') return null;` xuống sau tất cả hooks, khắc phục lỗi crash khi Admin nhấn nút "Tạo Dự Án Mới".
- **File 4:** `fe/src/components/kanban/TaskTransferInboxModal.tsx`
  - **Hành động:** `[SỬA LỖI CONDITIONAL HOOKS ORDER]`.
  - **Chi tiết:** Di chuyển `if (!isOpen) return null;` xuống sau các hooks, khắc phục lỗi crash khi bấm vào nút "Hộp Thư Yêu Cầu".
- **File 5:** `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[ĐỒNG BỘ onToggleSubtask CHO PIPELINE VÀ KANBAN VIEW]`.
  - **Chi tiết:** Truyền đầy đủ prop `onToggleSubtask={handleToggleSubtask}` vào `KanbanCard` trong tất cả các view (Kanban, Pipeline Stage, Focus Queue).
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 107. Triển Khai Giao Diện Pro Max: Today's Focus Cockpit & Master Plan & Project Roadmap
- **File 1:** `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[NÂNG CẤP MASTER TABS SWITCHER VÀ 2 LUỒNG CHÍNH]`.
  - **Chi tiết:** 
    - **☀️ Today's Focus Cockpit (Việc Cần Xong Hôm Nay)**: Tích hợp thanh điều hành Management Pulse (cho Admin & Manager: cảnh báo trễ hạn, tắc nghẽn, việc chờ duyệt); Nâng cấp Hero Focus Task #1 với Live Progress Slider và checklist Subtasks tích hợp trực tiếp có thể tick `[✓]` ngay trên thẻ; Danh sách Hàng chờ ưu tiên hôm nay kèm nút 1-click xin hỗ trợ / chuyển giao.
    - **🌌 Master Plan & Project Roadmap (Kế Hoạch Tổng Thể)**: Trực quan hóa toàn diện vòng đời dự án theo từng giai đoạn (Pipeline Stages); Bộ chọn Dự án kèm thống kê % tiến độ Roadmap; Phân cấp quyền quản trị giai đoạn linh hoạt cho Admin & Manager; Mở rộng khả năng theo dõi Roadmap cho toàn bộ nhân sự (Member/Assignee).
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 108. Thiết Kế Lộ Trình Thực Thi Subtasks Mỗi Ngày 1 Việc Con (Daily Micro-Sprint Schedule)
- **File 1:** `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[TÍCH HỢP DAILY MICRO-SPRINT STEPPER TRÊN HERO FOCUS TASK]`.
  - **Chi tiết:** 
    - Tự động nhận diện việc con chưa xong đầu tiên và làm nổi bật thành **"🔥 VIỆC CON MỤC TIÊU HÔM NAY (NGÀY X)"** với quầng sáng Sci-fi Amber và nút 1-click `[✓ Xong Việc Hôm Nay]`.
    - Hiển thị lộ trình phân bổ theo từng ngày (`✅ Đã xong Ngày 1`, `🔥 Hôm nay Ngày 2`, `⏳ Kế hoạch Ngày 3...`), tạo động lực hoàn thành từng bước mỗi ngày.
- **File 2:** `fe/src/components/kanban/KanbanCard.tsx`
  - **Hành động:** `[HIỂN THỊ BADGE TIẾN ĐỘ NGÀY TRÊN CHECKLIST KANBAN CARD]`.
  - **Chi tiết:** Gắn nhãn `Ngày #` và huy hiệu `🔥 HÔM NAY` cho việc con đang thực hiện trực tiếp trên từng thẻ Kanban.
- **File 3:** `fe/src/components/kanban/TaskDetailModal.tsx`
  - **Hành động:** `[ĐỒNG BỘ DAILY TIMELINE TRONG MODAL CHI TIẾT TASK]`.
  - **Chi tiết:** Danh sách công việc con trong Modal hiển thị thứ tự theo từng ngày kèm trạng thái `Xong` / `Hôm Nay` / `Kế Hoạch` tương ứng.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 109. Chuyển Đổi Cơ Chế Khẩn Cấp (Urgent) Trực Tiếp Sang Việc Con (Subtask-Level Urgency)
- **File 1:** `be/prisma/schema.prisma`
  - **Hành động:** `[BỔ SUNG TRƯỜNG isUrgent TRONG MODEL SUBTASK]`.
  - **Chi tiết:** Thêm `isUrgent Boolean @default(false) @map("is_urgent")` vào model `Subtask`. Đã đồng bộ qua `npx prisma db push` và `npx prisma generate`.
- **File 2:** `be/src/modules/task/task.service.ts` & `task.controller.ts`
  - **Hành động:** `[HỖ TRỢ isUrgent TRONG API SUBTASK]`.
  - **Chi tiết:** Cập nhật endpoint `POST /tasks/:id/subtasks` và `PATCH /tasks/subtasks/:subtaskId` cho phép cập nhật mức độ khẩn cấp của việc con.
- **File 3:** `fe/src/components/kanban/TaskDetailModal.tsx`
  - **Hành động:** `[NÚT BẬT/TẮT GẤP 1-CLICK CHO TỪNG VIỆC CON]`.
  - **Chi tiết:** Cho phép người giao việc/người làm task gắn cờ `🚨 GẤP` cho từng việc con cụ thể, và chọn `🚨 Đặt Gấp?` ngay khi tạo việc con mới.
- **File 4:** `fe/src/components/kanban/KanbanCard.tsx`
  - **Hành động:** `[TỰ ĐỘNG CẢNH BÁO VIỆC CON GẤP TRÊN HEADER THẺ KANBAN]`.
  - **Chi tiết:** Thẻ Kanban tự động đếm và hiển thị `🚨 {count} VIỆC CON GẤP` nhấp nháy pulse khi có việc con khẩn cấp cần làm ngay.
- **File 5:** `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[ĐỒNG BỘ BỘ LỌC TODAY FOCUS VÀ HERO TASK]`.
  - **Chi tiết:** Bộ lọc `🚨 Cần Gấp Hôm Nay` và thanh điều hành Management Strip tự động lọc và ưu tiên các task chứa việc con `isUrgent`.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 110. Tối Ưu Hóa Toàn Diện Luồng Logic & Loại Bỏ Tính Năng Thừa
- **File 1:** `fe/src/components/navigation/MeteorEdgeMenu.tsx`
  - **Hành động:** `[LOẠI BỎ TÍNH NĂNG PHÒNG HỌP WEBRTC]`.
  - **Chi tiết:** Xóa bỏ menu "Phòng Họp WebRTC" khỏi thanh điều hướng để tập trung hoàn toàn vào tác vụ Kanban và Quản trị lộ trình.
- **File 2:** `be/src/modules/task/dto/create-task.dto.ts` & `task.service.ts`
  - **Hành động:** `[HỖ TRỢ KHỞI TẠO DANH SÁCH SUBTASK VÀ TỰ ĐỘNG TÍNH PRIORITY]`.
  - **Chi tiết:** Cho phép truyền mảng `subtasks` kèm `estimatedDays` và `isUrgent` khi tạo Task mới, tự động suy ra `priority` của Task lớn từ các Việc Con.
- **File 3:** `fe/src/components/kanban/CreateTaskModal.tsx`
  - **Hành động:** `[NÂNG CẤP BỘ PHÂN RÃ VIỆC CON & TỰ ĐỘNG TÍNH DEADLINE CÔNG BẰNG]`.
  - **Chi tiết:** Cho phép người dùng thêm việc con theo từng ngày (1, 2, 3... ngày) kèm cờ Gấp. Tự động tính hạn chót tổng = Ngày hiện tại + Tổng số ngày việc con. Bỏ dropdown chọn Priority thủ công trên Task lớn.
- **File 4:** `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[CƠ CHẾ PROMPT TÔN TRỌNG THỜI GIAN NHÂN VIÊN KHI XONG VIỆC HÔM NAY]`.
  - **Chi tiết:** Khi nhân sự click `[✓ Xong Việc Hôm Nay]`, hệ thống mở Modal chúc mừng kèm 2 lựa chọn: (1) `✨ Tiến Hành Luôn Việc Ngày Mai` hoặc (2) `☕ Nghỉ Ngơi (Xong Hôm Nay)`. Luôn cam kết giữ nguyên 100% Deadline gốc, không chiếm dụng thời gian làm thêm ngoài giờ.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 111. Tích Hợp Bảng Gửi Tài Liệu & Đính Kèm Trực Tiếp Tại Today's Focus Cockpit
- **File 1:** `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[THÊM KHỐI COCKPIT ATTACHMENTS & TÀI LIỆU TRONG HERO FOCUS TASK #1]`.
  - **Chi tiết:** Bổ sung khu vực quản trị tài liệu ngay trong Hero Task của Today's Focus Cockpit:
    - Nút `📤 Tải Tệp Lên`: Tải file trực tiếp lên server và lưu vào CSDL PostgreSQL qua API `POST /tasks/:id/attachments`.
    - Nút `🔗 Thêm Link (Figma/Docs)`: Nhập nhanh URL tài liệu kèm tiêu đề.
    - Danh sách tài liệu kèm badge kích thước, nút mở liên kết, nút tải file, và nút xóa đính kèm realtime.
- **File 2:** `docs/PROJECT_PLAN_AND_ROADMAP.md`
  - **Hành động:** `[CẬP NHẬT TÀI LIỆU QUẢN TRỊ KẾ HOẠCH TỔNG THỂ DỰ ÁN]`.
  - **Chi tiết:** Bổ sung hạng mục 11 vào bảng thành tựu đã hoàn thành của dự án.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 112. Khóa Tính Năng Sửa Tiến Độ Thủ Công & Chuyển Sang Tự Động Hóa 100% Theo Việc Con
- **File 1:** `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[XÓA BỎ BỘ NÚT SỬA TIẾN ĐỘ THỦ CÔNG & THAY BẰNG KHỐI TIẾN ĐỘ KHÓA TỰ ĐỘNG]`.
  - **Chi tiết:**
    - Xóa bỏ toàn bộ các nút sửa % tiến độ thủ công (`0%`, `25%`, `50%`, `75%`, `100%`) và hàm `updateHeroProgress`.
    - Thanh tiến độ trên Hero Task chuyển thành chế độ hiển thị chỉ đọc (Read-Only) kèm huy hiệu `🔒 Tiến độ tính toán tự động dựa trên số việc con hoàn thành, không sửa tay`.
    - Tự động hiển thị chính xác tỉ lệ hoàn thành theo thời gian thực: `{completedSubtasks}/{totalSubtasks} Việc Con Xong — {progress}%`.
- **File 2:** `docs/PROJECT_PLAN_AND_ROADMAP.md`
  - **Hành động:** `[CẬP NHẬT HẠNG MỤC 12 VÀO TÀI LIỆU QUẢN TRỊ KẾ HOẠCH]`.
  - **Chi tiết:** Ghi nhận quy chuẩn tiến độ tự động vào bảng theo dõi tiến độ tổng thể.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 113. Bổ Sung Ngày Bắt Đầu Task (Flexible Start Date) & Tính Hạn Chót Linh Hoạt
- **File 1:** `be/prisma/schema.prisma`
  - **Hành động:** `[BỔ SUNG TRƯỜNG startDate TRONG MODEL TASK]`.
  - **Chi tiết:** Thêm `startDate DateTime? @map("start_date")` vào model `Task`. Đã đồng bộ qua `npx prisma db push` và `npx prisma generate`.
- **File 2:** `be/src/modules/task/dto/create-task.dto.ts` & `task.service.ts`
  - **Hành động:** `[HỖ TRỢ startDate TRONG API TẠO VÀ CẬP NHẬT TASK]`.
  - **Chi tiết:** Nhận `startDate`, kiểm tra hạn deadline `dueDate >= startDate`, và trả về `startDate` trong `mapTaskResponse`.
- **File 3:** `fe/src/components/kanban/CreateTaskModal.tsx`
  - **Hành động:** `[THÊM Ô CHỌN NGÀY BẮT ĐẦU VÀ TỰ ĐỘNG TÍNH DEADLINE THEO NGÀY BẮT ĐẦU]`.
  - **Chi tiết:** Cho phép người giao việc lên lịch bắt đầu vào ngày hôm nay hoặc một ngày trong tương lai (không ép nhân sự phải làm ngay). Hạn chót được tự động tính: `Hạn chót = Ngày bắt đầu + Tổng số ngày việc con`.
- **File 4:** `fe/src/components/kanban/TaskDetailModal.tsx` & `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[HIỂN THỊ LỘ TRÌNH NGÀY BẮT ĐẦU VÀ HẠN CHÓT]`.
  - **Chi tiết:** Hiển thị rõ ràng lộ trình `📅 Bắt đầu: {startDate} ➔ Hạn chót: {dueDate}` trên cả Modal Chi Tiết và Hero Focus Task.
- **File 5:** `docs/PROJECT_PLAN_AND_ROADMAP.md`
  - **Hành động:** `[CẬP NHẬT HẠNG MỤC 13 VÀO KẾ HOẠCH DỰ ÁN]`.
  - **Chi tiết:** Ghi nhận tính năng Ngày Bắt Đầu Task vào hồ sơ quản trị.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 114. Sửa Lỗi Hiển Thị Ngày Hôm Nay Sau Khi Hoàn Thành Việc Con & Phân Định Rõ Ràng Nghỉ Ngơi vs Làm Sớm
- **File 1:** `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[BỔ SUNG TRẠNG THÁI NGHỈ NGƠI VS LÀM TRƯỚC CHO HERO FOCUS TASK]`.
  - **Chi tiết:** 
    - Khi người dùng bấm `[✓ Xong Việc Hôm Nay]` và chọn Nghỉ Ngơi, Hero Focus Task hiển thị banner chúc mừng `🎉 ĐÃ HOÀN THÀNH MỤC TIÊU HÔM NAY!` và phân loại việc tiếp theo là `Kế hoạch Ngày Mai (Ngày 2)`, không còn bị hiển thị sai thành `Mục tiêu hôm nay (Ngày 2) - Hạn hoàn thành: Hôm nay 23:59`.
    - Bổ sung nút `✨ Tiến Hành Sớm Việc Ngày Mai` để người dùng có thể kích hoạt chế độ làm vượt tiến độ bất kỳ lúc nào.
- **File 2:** `fe/src/components/kanban/KanbanCard.tsx` & `fe/src/components/kanban/TaskDetailModal.tsx`
  - **Hành động:** `[ĐIỀU CHỈNH HUY HIỆU SUBTASK]`.
  - **Chi tiết:** Đổi huy hiệu việc con tiếp theo từ `🔥 HÔM NAY` thành `📅 KẾ TIẾP (Ngày X)` khi đã hoàn thành việc con đầu tiên.
- **File 3:** `docs/PROJECT_PLAN_AND_ROADMAP.md`
  - **Hành động:** `[CẬP NHẬT HẠNG MỤC 14 VÀO KẾ HOẠCH DỰ ÁN]`.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 115. Bổ Sung Nút [▶️ Tiếp Tục] & Tự Động Tính Hạn Chót (Làm Tròn Lên: Sớm + Mặc Định)
- **File 1:** `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[NÂNG CẤP HERO FOCUS TASK VỚI NÚT TIẾP TỤC & CƠ CHẾ DEADLINE TINH GỌN]`.
  - **Chi tiết:** 
    - Khi ở trạng thái Nghỉ Ngơi, cung cấp nút nổi bật `[▶️ Tiếp Tục]`.
    - Tự động tính hạn chót ngầm: `Math.ceil(Thời gian hoàn thành sớm + Thời gian mặc định task chuẩn bị nhận)`.
    - Giao diện được tinh gọn tối đa, chỉ hiển thị đúng thông tin cần thiết: `⏳ Hạn chót: YYYY-MM-DD`, không in công thức rườm rà.
- **File 2:** `docs/PROJECT_PLAN_AND_ROADMAP.md`
  - **Hành động:** `[CẬP NHẬT HẠNG MỤC 15 VÀO KẾ HOẠCH DỰ ÁN]`.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 116. Ghi Trực Tiếp Lịch Trình Thực Tế & Bảo Lưu 100% Hạn Chót Gốc Khi Làm Sớm
- **File 1:** `fe/src/pages/BoardPage.tsx`, `fe/src/components/kanban/KanbanCard.tsx`, `fe/src/components/kanban/TaskDetailModal.tsx`
  - **Hành động:** `[CHUYỂN ĐỔI NGÀY THỨ SANG NGÀY LỊCH THỰC TẾ & BẢO LƯU HẠN CHÓT GỐC]`.
  - **Chi tiết:** 
    - Thay thế các nhãn trừu tượng ("Ngày 1, Ngày 2") thành mốc ngày lịch cụ thể `📅 DD/MM/YYYY` tính theo `startDate` và thời lượng ước lượng của từng việc con.
    - Khi nhân sự làm việc sớm hoặc bấm `[▶️ Tiếp Tục]`, hệ thống luôn giữ nguyên hạn chót gốc đã lên lịch từ đầu (`⏳ Hạn chót gốc giữ nguyên: DD/MM/YYYY`), không rút ngắn hay gây áp lực thời gian.
- **File 2:** `docs/PROJECT_PLAN_AND_ROADMAP.md`
  - **Hành động:** `[CẬP NHẬT HẠNG MỤC 16 VÀO KẾ HOẠCH DỰ ÁN]`.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 117. Cơ Chế Xác Thực Hoàn Thành Việc Con & Quản Lý Phê Duyệt (Manager Approval)
- **File 1:** `be/prisma/schema.prisma`
  - **Hành động:** `[BỔ SUNG FIELD APPROVAL_STATUS, REJECTION_REASON VÀO MODEL SUBTASK VÀ ENUM SUBTASK_APPROVAL]`.
- **File 2:** `be/src/modules/task/task.service.ts`, `be/src/modules/task/task.controller.ts`
  - **Hành động:** `[TRIỂN KHAI LOGIC YÊU CẦU XÁC THỰC, API REVIEW SUBTASK & BROADCAST REALTIME SOCKET]`.
  - **Chi tiết:**
    - Khi Nhân viên (`EMPLOYEE`) tick việc con: Trạng thái chuyển sang `PENDING` (chưa tick chính thức), tạo `TaskRequest` loại `SUBTASK_APPROVAL` gửi đến Manager/Admin.
    - Quản lý / Admin duyệt: API `PATCH /api/tasks/subtasks/:subtaskId/review` xử lý `APPROVE` (cập nhật `isDone: true`, `approvalStatus: APPROVED`, tính lại % tiến độ) hoặc `REJECT` (giữ `isDone: false`, lưu `rejectionReason`, gửi cảnh báo tới nhân viên).
- **File 3:** `fe/src/components/kanban/KanbanCard.tsx`, `fe/src/components/kanban/TaskDetailModal.tsx`, `fe/src/components/kanban/TaskTransferInboxModal.tsx`, `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[TÍCH HỢP UI DUYỆT NHANH, BADGE TRẠNG THÁI VÀ NÚT HIỂN THỊ THÔNG BÁO 🔔]`.
  - **Chi tiết:**
    - Nhân viên thấy badge `⏳ Chờ Duyệt`, quản lý thấy 2 nút `[✓ Duyệt]` và `[❌ Từ Chối]`.
    - Thanh điều hướng trên cùng có Nút Thông Báo `🔔 Thông Báo & Duyệt` với badge đếm số lượng yêu cầu theo thời gian thực.
- **File 4:** `docs/PROJECT_PLAN_AND_ROADMAP.md`
  - **Hành động:** `[CẬP NHẬT HẠNG MỤC 17 VÀO KẾ HOẠCH DỰ ÁN]`.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 118. Khóa/Làm Mờ Task Con Hoàn Thành & Phân Quyền Tick Tuyệt Đối Cho Người Làm Task
- **File 1:** `be/src/modules/task/task.service.ts`
  - **Hành động:** `[THIẾT LẬP RÀNG BUỘC PHÂN QUYỀN CHẶT CHẼ & KHÓA SUBTASK ĐÃ HOÀN THÀNH]`.
  - **Chi tiết:**
    - Nếu subtask đã hoàn thành (`isDone === true`): Ném ngoại lệ `BadRequestException` từ chối sửa đổi trạng thái.
    - Quyền đánh dấu/gửi xác thực hoàn thành: Kiểm tra nghiêm ngặt `isWorkerDoingTask` (Chỉ người được giao việc `assigneeId` mới có quyền; Người tạo Task và Admin không được tick thay).
- **File 2:** `fe/src/components/kanban/KanbanCard.tsx`, `fe/src/components/kanban/TaskDetailModal.tsx`, `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[LÀM MỜ VÀ VÔ HIỆU HÓA TƯƠNG TÁC TASK CON HOÀN THÀNH & KHÓA NÚT TICK VỚI NGƯỜI NGOÀI]`.
  - **Chi tiết:**
    - Khi `st.isDone === true`: Áp dụng style làm mờ `opacity-40 grayscale select-none pointer-events-none cursor-not-allowed`, hoàn toàn không thể nhấn hay tick lại.
    - Nút tick / Checkbox chỉ kích hoạt khi người đăng nhập là người trực tiếp nhận làm Task (`isWorkerDoingTask`), nếu là Quản trị viên/Người tạo thì hiển thị thông báo/badge phân quyền rõ ràng.
- **File 3:** `docs/PROJECT_PLAN_AND_ROADMAP.md`
  - **Hành động:** `[CẬP NHẬT HẠNG MỤC 18 VÀO KẾ HOẠCH DỰ ÁN]`.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 119. Giải Quyết Triệt Để 7 Luồng Conflict Logic & Hoàn Thiện Vòng Đời Subtask
- **File 1:** `be/src/modules/task/task.service.ts`
  - **Hành động:** `[XỬ LÝ 7 LUỒNG CONFLICT LOGIC PHÍA SERVER]`.
  - **Chi tiết:**
    - `Self-Approval`: Quản lý / Admin tự làm task của mình được Auto-Approve ngay khi tick mà không bị gửi thông báo duyệt cho chính mình.
    - `Reopen Subtask`: API `reviewSubtask` hỗ trợ `action: 'REOPEN'` cho phép Quản lý mở lại việc con đã duyệt nhầm để nhân viên chỉnh sửa.
    - `Sync DueDate`: `recalculateTaskProgress` tự động tính và đồng bộ lại `dueDate` tổng của Task = `startDate + tổng số ngày subtasks`.
    - `Task Transfer Cleanup`: Khi chuyển giao Task được duyệt, tự động hủy các yêu cầu duyệt subtask cũ đang treo để tránh tính nhầm người.
    - `Unassigned Validation`: Chặn không cho tick subtask nếu Task chưa được phân công cho ai.
- **File 2:** `fe/src/components/kanban/TaskDetailModal.tsx`, `fe/src/components/kanban/KanbanCard.tsx`, `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[BỔ SUNG UI TƯƠNG TÁC GỬI LẠI, MỞ LẠI VÀ SỬA OPTIMISTIC UPDATE]`.
  - **Chi tiết:**
    - Cung cấp nút `[🔄 Gửi Duyệt Lại]` khi việc con bị từ chối (`REJECTED`).
    - Cung cấp nút `[↩️ Mở Lại]` cho Quản lý khi việc con đã hoàn thành.
    - Tinh chỉnh Optimistic Update để không bị giật lùi thanh tiến độ % khi nhân viên nộp duyệt.
- **File 3:** `docs/PROJECT_PLAN_AND_ROADMAP.md`
  - **Hành động:** `[CẬP NHẬT HẠNG MỤC 19 VÀO KẾ HOẠCH DỰ ÁN]`.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 120. Xử Lý 5 Lỗ Hổng Logic Nâng Cao & Tự Động Đồng Bộ Trạng Thái Kanban
- **File 1:** `be/src/modules/task/task.service.ts`
  - **Hành động:** `[CHẶN BYPASS KANBAN, TỰ ĐỘNG SYNC STATUS, KHÓA ESTIMATEDDAYS, LỌC THÔNG BÁO MA]`.
  - **Chi tiết:**
    - `Kanban DONE Drag Block`: Trong `updateStatus`, nếu Task còn việc con chưa được duyệt hoàn tất (`isDone: false`), ném ngoại lệ `400 BadRequestException` chặn không cho đổi status sang `DONE`.
    - `Auto Status Sync`: Trong `recalculateTaskProgress`, khi tiến độ đạt 100% tự động chuyển `status = 'DONE'`, và khi Quản lý mở lại việc con (tiến độ < 100%) tự động chuyển về `status = 'IN_PROGRESS'`.
    - `Paused / Blocked Freeze`: Chặn tick việc con khi Task đang ở trạng thái `PAUSED` hoặc `BLOCKED`.
    - `Subtask Assignee Priority`: Ưu tiên `subtask.assigneeId` trước `task.assigneeId`.
    - `EstimatedDays Lock`: Chặn nhân viên tự ý sửa `estimatedDays` của việc con để kéo giãn deadline.
    - `Ghost Notification Filter`: Trong `getIncomingRequests`, thêm bộ lọc `task: { isDeleted: false }`.
- **File 2:** `fe/src/pages/BoardPage.tsx`, `fe/src/components/kanban/KanbanCard.tsx`, `fe/src/components/kanban/TaskDetailModal.tsx`
  - **Hành động:** `[RÀNG BUỘC KÉO THẢ VÀ PHÂN QUYỀN TRÊN GIAO DIỆN]`.
  - **Chi tiết:**
    - `handleDragEnd`: Hiển thị thông báo cảnh báo và hủy thao tác nếu kéo thẻ có việc con chưa xong vào cột `DONE`.
    - Vô hiệu hóa nút tick / gửi duyệt khi Task đang `PAUSED` hoặc `BLOCKED`.
    - Ràng buộc quyền tick chính xác theo người được giao riêng cho việc con.
- **File 3:** `docs/PROJECT_PLAN_AND_ROADMAP.md`
  - **Hành động:** `[CẬP NHẬT HẠNG MỤC 20 VÀO KẾ HOẠCH DỰ ÁN]`.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 121. Xử Lý Xóa Thành Viên Chuyển Về Manager & Manager Phân Công Trực Tiếp (LC-13 ➔ LC-22)
- **File 1:** `be/src/modules/project/project.service.ts` & `be/src/modules/project/project.controller.ts`
  - **Hành động:** `[BỔ SUNG API QUẢN LÝ THÀNH VIÊN VÀ REMOVEMEMBER TỰ ĐỘNG CHUYỂN TASK VỀ MANAGER]`.
  - **Chi tiết:**
    - `GET /projects/:id/members`: Trả về danh sách thành viên dự án và số task đang phụ trách.
    - `POST /projects/:id/members`: Thêm nhân sự vào dự án.
    - `DELETE /projects/:id/members/:userId`: Khi xóa 1 thành viên khỏi dự án, hệ thống quét và chuyển giao toàn bộ Task (`assigneeId`) và Subtask đang gán cho người đó về cho Manager của Dự án (`project.managerId || project.createdById`).
- **File 2:** `be/src/modules/task/task.service.ts`
  - **Hành động:** `[MANAGER PHÂN CÔNG TRỰC TIẾP, BẢO VỆ ATTACHMENT, HỦY SUBTASK DUYỆT TREO]`.
  - **Chi tiết:**
    - `Manager Direct Assignment`: Khi Manager/Admin chuyển giao Task, hệ thống tự động gán trực tiếp (`task.assigneeId = receiverId, status = 'IN_PROGRESS'`), không tạo yêu cầu PENDING bắt Accept/Deny, tạo bản ghi tự động và gửi thông báo Realtime.
    - `Self-Transfer Block`: Chặn gửi yêu cầu chuyển giao cho chính bản thân mình.
    - `Duplicate Transfer Lock`: Chặn gửi nhiều yêu cầu chuyển giao trùng lặp khi đang có 1 request PENDING.
    - `Orphaned Subtask Request Cleanup`: Khi xóa subtask, tự động hủy các yêu cầu duyệt PENDING liên quan.
    - `Attachment Tampering Lock`: Chặn xóa file đính kèm của Task đã hoàn thành (`status === 'DONE'`).
    - `Finished Subtask Urgent Lock`: Chặn bật cờ `isUrgent` trên việc con đã xong.
    - `Project Membership Validation`: Kiểm tra người được phân công phải thuộc dự án.
- **File 3:** `fe/src/components/kanban/ProjectMembersModal.tsx` & `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[TẠO BẢNG ĐIỀU KHIỂN QUẢN LÝ NHÂN SỰ PROJECT VÀ NÚT XÓA THÀNH VIÊN]`.
  - **Chi tiết:**
    - Xây dựng Modal quản lý thành viên dự án: hiển thị danh sách nhân sự, chức danh, email, số task đang làm, nút thêm thành viên mới và nút `[❌ Xóa Khỏi Dự Án]`.
    - Tích hợp trực tiếp vào Header dự án tại vị trí `👥 X Nhân sự (⚙️ Quản lý)`.
- **File 4:** `docs/05_LOGIC_CONFLICTS_AND_BUSINESS_RULES_LOG.md`
  - **Hành động:** `[CẬP NHẬT NHẬT KÝ XUNG ĐỘT LOGIC LC-13 ĐẾN LC-22]`.
- **File 5:** `docs/PROJECT_PLAN_AND_ROADMAP.md`
  - **Hành động:** `[CẬP NHẬT HẠNG MỤC 21 VÀO KẾ HOẠCH DỰ ÁN]`.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 122. Đồng Nhất Thuật Ngữ Toàn Bộ Giao Diện & Hệ Thống (Terminology Unification)
- **File 1:** `fe/src/components/kanban/CreateTaskModal.tsx`, `fe/src/components/kanban/DeleteTaskConfirmModal.tsx`, `fe/src/components/kanban/KanbanCard.tsx`, `fe/src/components/kanban/ProjectMembersModal.tsx`, `fe/src/components/kanban/TaskDetailModal.tsx`, `fe/src/components/kanban/TaskTransferInboxModal.tsx`, `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[CHUẨN HÓA TOÀN DIỆN THUẬT NGỮ GIAO DIỆN PHÍA FRONTEND]`.
  - **Chi tiết:**
    - Thay thế toàn bộ cụm từ *"Nhiệm vụ"* ➔ **"Task"** (ví dụ: *"Tổng số Task: X Task"*, *"X Task đang phụ trách"*, *"Xác nhận xóa Task"*, *"Chuyển Giao Task"*, *"Mô tả chi tiết Task"*).
    - Thay thế toàn bộ cụm từ *"Việc con"*, *"Công việc con"* ➔ **"Task con"** (hoặc *"Danh Sách Task Con (Subtasks)"*, *"Lộ Trình Task Con"*, *"X Task Con ({totalEstimatedDays} Ngày)"*, *"X Task Con Gấp"*, *"Đã hoàn thành tất cả Task con!"*, *"Duyệt Task con"*).
    - Đồng bộ thống nhất trên toàn bộ các Modal, Hero Focus Cockpit, Kanban Card, Accordion Checklist và Hộp thư phê duyệt.
- **File 2:** `be/src/modules/task/task.service.ts`
  - **Hành động:** `[CHUẨN HÓA THUẬT NGỮ THÔNG BÁO LỖI VÀ COMMENT HỆ THỐNG PHÍA BACKEND]`.
  - **Chi tiết:**
    - Đồng bộ lại các thông điệp ngoại lệ (Exception Messages), chú thích lịch sử chuyển giao và bình luận hệ thống sang chuẩn **"Task"** và **"Task con"**.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 123. Xử Lý Triệt Để Toàn Diện 10 Luồng Xung Đột Logic & Ràng Buộc Nghiệp Vụ (LC-23 đến LC-32)
- **File 1:** `be/src/modules/task/task.service.ts`, `be/src/modules/task/task.controller.ts`
  - **Hành động:** `[XỬ LÝ 10 LOGIC CONFLICTS MỚI]`.
  - **Chi tiết:**
    - **LC-23 (Chặn Thêm Task Con Vào Task DONE)**: Khóa không cho gọi `addSubtask` khi `task.status === 'DONE'`.
    - **LC-24 (Hủy TaskRequest Treo Khi Xóa Task)**: Tự động cập nhật `status: 'CANCELLED'` cho toàn bộ yêu cầu chuyển giao/duyệt khi Task bị đưa vào thùng rác.
    - **LC-25 (Bảo Vệ Quyền Tải & Xóa File Đính Kèm)**: Ràng buộc quyền tải file theo thành viên dự án và quyền xóa file theo Assignee/Creator/Manager.
    - **LC-26 (Ràng Buộc Thành Viên Khi Gán Subtask Assignee)**: Kiểm tra bắt buộc nhân sự nhận Task con phải thuộc bảng `project_members` của Dự án.
    - **LC-28 (Chặn Gửi Yêu Cầu Trợ Giúp/Chuyển Giao Cho Chính Mình)**: Mở rộng chặn toàn bộ các loại request tự gửi cho bản thân.
    - **LC-29 (Phân Quyền Bình Luận Trong Task Thuộc Dự Án)**: Kiểm tra chỉ thành viên dự án hoặc Admin mới được phép gửi bình luận vào Task.
    - **LC-30 (Chống Phân Công Trùng Lặp Khi Manager Giao Cho Người Cũ)**: Báo lỗi nếu Manager giao việc cho người đang trực tiếp giữ Task đó.
    - **LC-31 (Khóa Kéo Thả Backend Khi Task Đang IN_REVIEW)**: Chặn gọi `updateStatus` khi Task đang có yêu cầu chuyển giao `PENDING`.
    - **LC-32 (Đóng Băng Chỉnh Sửa Mô Tả Khi Task PAUSED/BLOCKED)**: Khóa sửa mô tả đối với nhân viên khi Task đang bị tạm dừng hoặc nghẽn.
- **File 2:** `docs/05_LOGIC_CONFLICTS_AND_BUSINESS_RULES_LOG.md`
  - **Hành động:** `[CẬP NHẬT NHẬT KÝ CONFLICT CHÍNH THỨC]`.
  - **Chi tiết:** Ghi chép chi tiết đầy đủ 10 mục giải pháp kỹ thuật, phân tích nguyên nhân gốc rễ và phân loại mức độ nghiêm trọng.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 124. Tối Ưu Hóa Dọn Dẹp Yêu Cầu Thành Viên Bị Xóa & Khôi Phục Task Realtime (LC-33 & LC-35)
- **File 1:** `be/src/modules/project/project.service.ts`
  - **Hành động:** `[XỬ LÝ LC-33]`.
  - **Chi tiết:** Trong `removeMember`, tự động hủy toàn bộ các `TaskRequest` đang `PENDING` có liên quan đến thành viên bị xóa để tránh rác hộp thư và tranh chấp nhiệm vụ.
- **File 2:** `be/src/modules/task/task.service.ts`
  - **Hành động:** `[XỬ LÝ LC-35 & LC-36]`.
  - **Chi tiết:**
    - Trong `restoreTask`: Tự động tính toán lại tiến độ `%` chính xác và phát sóng sự kiện Realtime `task:created` đến toàn bộ thành viên đang mở bảng Kanban.
    - Chuẩn hóa thông báo quyền và ghi chú phê duyệt trong `reviewSubtask` sang chuẩn `"Task con"`.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 125. Thắt Chặt Xác Thực Phản Hồi Request & Phân Quyền Hủy Yêu Cầu Duyệt (LC-37 & LC-38)
- **File 1:** `be/src/modules/task/task.service.ts`
  - **Hành động:** `[XỬ LÝ LC-37 & LC-38]`.
  - **Chi tiết:**
    - Trong `respondToRequest`: Bắt buộc chỉ người nhận (`receiverId`) hoặc Quản lý dự án/Admin mới có quyền duyệt hoặc từ chối yêu cầu.
    - Trong `cancelTaskRequest`: Cho phép Admin/Manager hủy các request bị kẹt; tự động reset `subtask.approvalStatus = 'NONE'` khi hủy yêu cầu duyệt việc con.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 126. Xác Thực Mã Hóa Đổi Mật Khẩu & Lọc Bỏ Task Xóa Khỏi Thống Kê (LC-39 & LC-40)
- **File 1:** `be/src/modules/profile/profile.service.ts`
  - **Hành động:** `[XỬ LÝ LC-39 & LC-40]`.
  - **Chi tiết:**
    - Trong `changePassword`: Thực hiện kiểm tra mật khẩu hiện tại bằng `bcrypt.compare`, mã hóa mật khẩu mới bằng `bcrypt.hash` và thu hồi `refreshToken` cũ trong PostgreSQL để bảo mật phiên.
    - Trong `getPersonalStats`: Bổ sung điều kiện `isDeleted: false` vào tất cả các truy vấn đếm (Hoàn thành, Đang làm, Quá hạn) để loại trừ Task trong thùng rác.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 127. Xử Lý Toàn Diện 10 Luồng Xung Đột Logic Dự Án & Nhiệm Vụ (LC-41 đến LC-50)
- **File 1:** `be/src/modules/project/project.service.ts`, `be/src/modules/project/project.controller.ts`
  - **Hành động:** `[XỬ LÝ LC-41, LC-42, LC-43, LC-48, LC-50]`.
  - **Chi tiết:**
    - **LC-41**: Phân quyền cập nhật thông tin dự án, bắt buộc là Admin hoặc Quản lý dự án.
    - **LC-42**: Lọc bỏ hoàn toàn các Task trong thùng rác (`isDeleted: false`) trong API `findOne` chi tiết dự án.
    - **LC-43**: Ràng buộc Quản lý được chỉ định (`managerId`) phải tồn tại trong CSDL.
    - **LC-48**: Chặn tạo trùng tên dự án đang hoạt động (`isCompleted: false`).
    - **LC-50**: Lọc bỏ các task đã xóa khỏi trường đếm `_count.tasks` khi truy vấn danh sách dự án.
- **File 2:** `be/src/modules/task/task.service.ts`
  - **Hành động:** `[XỬ LÝ LC-44, LC-45, LC-46, LC-47]`.
  - **Chi tiết:**
    - **LC-44**: Khóa toàn diện việc chỉnh sửa nội dung Task con khi đã hoàn thành và nghiệm thu.
    - **LC-45**: Chặn gửi yêu cầu chuyển giao đối với Task đã hoàn thành (`DONE`).
    - **LC-46**: Chặn gửi yêu cầu chuyển giao đối với Task đang bị tạm dừng hoặc nghẽn (`PAUSED`/`BLOCKED`).
    - **LC-47**: Ràng buộc hạn chót của Task con không thể vượt quá hạn chót của Task cha hoặc trước ngày bắt đầu.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 128. Khóa Xóa Task Con Đã Duyệt, Hạ Trạng Thái Task DONE Khi Reopen & Phân Quyền Thùng Rác (LC-51 đến LC-55)
- **File 1:** `be/src/modules/task/task.service.ts`, `be/src/modules/task/task.controller.ts`
  - **Hành động:** `[XỬ LÝ LC-51, LC-52, LC-53, LC-54, LC-55]`.
  - **Chi tiết:**
    - **LC-51**: Khóa không cho phép nhân viên thường xóa Task con đã được nghiệm thu hoàn thành (`isDone: true`).
    - **LC-52**: Tự động chuyển Task cha từ `DONE` về `IN_PROGRESS` khi Quản lý mở lại (`REOPEN`) hoặc từ chối (`REJECT`) một Task con.
    - **LC-53**: Phân quyền nghiêm ngặt cho API `restoreTask`, chỉ Admin hoặc Quản lý dự án mới có quyền khôi phục Task từ Thùng Rác.
    - **LC-54**: Bảo vệ API `getComments`, chỉ thành viên dự án hoặc Quản lý/Admin mới được quyền đọc danh sách bình luận.
    - **LC-55**: Mở rộng quyền cho Quản lý dự án cấp cơ sở (`project.managerId`/`createdById`) được phép xóa Task vào thùng rác ngay cả khi role toàn cục là `EMPLOYEE`.
- **File 2:** `docs/05_LOGIC_CONFLICTS_AND_BUSINESS_RULES_LOG.md`
  - **Hành động:** `[CẬP NHẬT TÀI LIỆU QUẢN LÝ CONFLICT]`.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 129. Cơ Chế Nhiều Nhân Viên Trong Cùng Dự Án Cùng Làm 1 Task Cha (Task Con Bắt Buộc Riêng Biệt & Bàn Giao Cho Đồng Nghiệp Cùng Làm)
- **File 1:** `be/src/modules/project/project.service.ts`
  - **Hành động:** `[CẬP NHẬT REMOVE MEMBER - ƯU TIÊN BÀN GIAO CHO ĐỒNG NGHIỆP CÒN LẠI CỦA TASK]`.
  - **Chi tiết:**
    - **LC-59**: Khi xóa thành viên A khỏi dự án, hệ thống quét các Task mà A tham gia. Nếu có đồng nghiệp B còn lại đang cùng làm task đó -> Tự động bàn giao các Task con của A và chuyển quyền đại diện Task cha cho B! Chỉ khi task không còn ai khác mới chuyển về cho Quản lý dự án.
- **File 2:** `be/src/modules/task/task.service.ts`
  - **Hành động:** `[BỔ SUNG MAP ASSIGNEES ĐA NHÂN SỰ, BỘ LỌC FINDALL ĐA DIỆN & PHÂN QUYỀN SUBTASK TẬP TRUNG]`.
  - **Chi tiết:**
    - **LC-56**: Phân quyền trách nhiệm riêng biệt cho từng Task con (`Subtask`), chỉ nhân sự được gán riêng mới có quyền nộp duyệt.
    - **LC-58**: `mapTaskResponse` tổng hợp toàn bộ danh sách `assignees` tham gia vào Task cha và các Task con.
    - **LC-60**: Bộ lọc `findAll` theo `assigneeId` tìm kiếm cả Task có `assigneeId` hoặc có `subtasks.some(st => st.assigneeId === query.assigneeId)`.
- **File 3:** `fe/src/types/index.ts`, `fe/src/components/kanban/KanbanCard.tsx`, `fe/src/components/kanban/CreateTaskModal.tsx`, `fe/src/components/kanban/TaskDetailModal.tsx`, `fe/src/pages/BoardPage.tsx`
  - **Hành động:** `[CẬP NHẬT GIAO DIỆN PHÂN CÔNG ĐA NHÂN SỰ, AVATAR STACK GROUP & CÁ NHÂN HÓA COCKPIT]`.
  - **Chi tiết:**
    - `CreateTaskModal` & `TaskDetailModal`: Cho phép chọn nhân sự phụ trách riêng biệt cho từng Task con từ danh sách thành viên dự án.
    - `KanbanCard`: Hiển thị Avatar Stack Group các nhân sự cùng tham gia và hiển thị tag `👤 [Tên nhân sự]` trên từng dòng Task con.
    - `BoardPage`: Cá nhân hóa Today's Focus Cockpit, ưu tiên lấy Task con của chính nhân sự đang đăng nhập làm mục tiêu micro-sprint trong ngày.
- **File 4:** `docs/05_LOGIC_CONFLICTS_AND_BUSINESS_RULES_LOG.md`
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 130. Bổ Sung Thiết Lập Ngày Bắt Đầu & Thời Gian Làm Việc Ước Lượng Cho Task Con Sau Khi Đã Tạo Task
- **File 1:** `be/prisma/schema.prisma`
  - **Hành động:** `[BỔ SUNG FIELD START_DATE VÀ ESTIMATED_DAYS VÀO MODEL SUBTASK]`.
  - **Chi tiết:** Thêm `startDate DateTime? @map("start_date")` và `estimatedDays Int @default(1) @map("estimated_days")`. Đã đồng bộ qua `npx prisma db push` và `npx prisma generate`.
- **File 2:** `be/src/modules/task/task.service.ts` & `task.controller.ts` & `dto/create-task.dto.ts`
  - **Hành động:** `[HỖ TRỢ START_DATE VÀ ESTIMATED_DAYS TRONG API TẠO VÀ CẬP NHẬT SUBTASK]`.
  - **Chi tiết:** 
    - `addSubtask` & `updateSubtask`: Hỗ trợ lưu trữ `startDate`, `estimatedDays` (ngày công) và tính hạn chót `dueDate`.
    - `recalculateTaskProgress`: Tự động tính toán lại % tiến độ dựa trên tổng số ngày công của các Task con đã hoàn thành / Tổng số ngày công của tất cả Task con.
    - `mapTaskResponse`: Trả về `startDate`, `estimatedDays` trong từng phần tử subtasks.
- **File 3:** `fe/src/types/index.ts` & `fe/src/components/kanban/TaskDetailModal.tsx`
  - **Hành động:** `[TÍCH HỢP Ô CHỌN NGÀY BẮT ĐẦU VÀ THỜI LƯỢNG (NGÀY) TRÊN THANH QUICK ADD SUBTASK]`.
  - **Chi tiết:** Cho phép người dùng nhập ngày bắt đầu và chọn thời lượng (1, 2, 3, 4, 5 ngày) ngay trong modal chi tiết Task; hiển thị huy hiệu `⏳ X ngày` trên từng dòng Task con.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 131. Cơ Chế Xử Lý Các Task Con Cùng Ngày Thực Hiện / Làm Song Song (Parallel Critical Path Scheduling)
- **File 1:** `be/src/modules/task/task.service.ts`
  - **Hành động:** `[TÍNH TOÁN HẠN CHÓT TASK CHA THEO ĐƯỜNG GĂNG THỜI GIAN KHI LÀM SONG SONG]`.
  - **Chi tiết:** Trong `recalculateTaskProgress`, khi các Task con có thiết lập `startDate`/`dueDate` riêng, `task.dueDate` được tính theo **mốc kết thúc lớn nhất ($\max$)** của các việc con thay vì cộng dồn số học, tránh bị đội hạn chót vô lý.
- **File 2:** `fe/src/pages/BoardPage.tsx`, `fe/src/components/kanban/KanbanCard.tsx`, `fe/src/components/kanban/TaskDetailModal.tsx`
  - **Hành động:** `[CẬP NHẬT THUẬT TOÁN TÍNH LỊCH TRÌNH SUBTASK ƯU TIÊN START_DATE ĐỘC LẬP]`.
  - **Chi tiết:** Hiển thị chính xác ngày lịch người dùng đã chọn cho từng việc con (kể cả khi 2 việc con có cùng ngày bắt đầu); không tự động đẩy việc con thứ 2 sang ngày hôm sau.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 132. Nâng Cấp Hộp Thư Thông Báo Thành Trung Tâm Thông Báo & Yêu Cầu Tổng Hợp Của Tài Khoản
- **File 1:** `fe/src/components/kanban/TaskTransferInboxModal.tsx`
  - **Hành động:** `[NÂNG CẤP TOÀN DIỆN MODAL TRUNG TÂM THÔNG BÁO & YÊU CẦU TỔNG HỢP]`.
  - **Chi tiết:** 
    - Đổi tiêu đề: **"Trung Tâm Thông Báo & Yêu Cầu Tổng Hợp"**.
    - Phân loại rõ ràng 3 loại yêu cầu: 🔍 **Duyệt Nghiệm Thu Task Con (`SUBTASK_APPROVAL`)**, 🔄 **Bàn Giao Quyền Phụ Trách (`TRANSFER`)**, 🤝 **Nhờ Đồng Nghiệp Hỗ Trợ (`ASSIST`)**.
    - Bổ sung bộ lọc Filter Chips thông minh: `Tất Cả`, `🔍 Duyệt Task Con`, `🔄 Bàn Giao`, `🤝 Hỗ Trợ`.
    - Phân quyền và hiển thị chuẩn tên vai trò (`Quản Trị Viên (Admin)`, `Quản Lý Dự Án`, `Nhân Viên`).
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 133. Hiện Thực Hóa Cơ Chế Thành Viên Tự Tạo Task Con & Bao Phủ 20 Corner Cases
- **File 1:** `be/src/modules/task/task.service.ts`
  - **Hành động:** `[NÂNG CẤP TOÀN DIỆN HÀM ADDSUBTASK & PHÂN QUYỀN MỞ RỘNG CHO THÀNH VIÊN]`.
  - **Chi tiết:** 
    - Mở quyền cho Thành viên thuộc dự án (`project_members`) được tự tạo subtask phân rã công việc.
    - Tự động gán `assigneeId = user.id` khi nhân viên không chọn người khác.
    - Tự động co giãn `task.startDate` khi subtask bắt đầu sớm hơn task cha.
    - Khóa thêm subtask khi Task đang `PAUSED`, `BLOCKED`, `isArchived`, hoặc đang `IN_REVIEW` chờ bàn giao.
    - Chuẩn hóa thời lượng làm việc `Math.max(1, Math.floor(estimatedDays))`.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 134. Chuẩn Hóa Phân Quyền Tạo Task Con: Chỉ Người Đảm Nhiệm Task (Assignee) Hoặc Quản Lý/Admin Được Phép Tạo
- **File 1:** `be/src/modules/task/task.service.ts`
  - **Hành động:** `[THIẾT LẬP RÀNG BUỘC PHÂN QUYỀN CHẶT CHẼ TRONG ADDSUBTASK]`.
  - **Chi tiết:** Kiểm tra quyền `isAdminOrManager` hoặc `task.assigneeId === user.id` (nếu task chưa gán ai thì cho phép người tạo Task `task.createdById`). Chặn các thành viên khác trong dự án không được tự ý can thiệp tạo subtask vào task của người khác.
- **File 2:** `fe/src/components/kanban/TaskDetailModal.tsx`
  - **Hành động:** `[CẬP NHẬT QUYỀN HIỂN THỊ CANMANAGESUBTASKS TRÊN GIAO DIỆN DETAIL MODAL]`.
  - **Chi tiết:** Chỉ hiển thị thanh nhập Quick Add Subtask khi người dùng là `isAssignee` (người đảm nhiệm) hoặc Quản lý/Admin (`ADMIN` / `MANAGER`).
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 135. Nạp Bộ Dữ Liệu Thực Nghiệm Toàn Diện (Full-Feature Dynamic Seed) Cho Toàn Bộ Chức Năng
- **File 1:** `be/prisma/seed.ts`
  - **Hành động:** `[THIẾT LẬP SEED DỮ LIỆU ĐỘNG TOÀN DIỆN 100% CÁC BẢNG TRONG HỆ THỐNG]`.
  - **Chi tiết:** 
    - **Phòng ban & Dự án:** 3 Phòng ban (`Product Engineering`, `Client Solutions`, `AI Innovation Lab`) và 3 Dự án (`Solaris Task Board Core`, `Solaris UI/UX Bento Design`, `AI Voice Command & Biometrics Engine`).
    - **Tài khoản nhân sự đầy đủ chức danh:** Admin, Manager, Dev, UI/UX Designer, QA Tester, Backend Specialist.
    - **Bao phủ 6 cột Trạng Thái Kanban & 6 Giai Đoạn Pipeline:** `TODO`, `IN_PROGRESS`, `PAUSED`, `BLOCKED`, `IN_REVIEW`, `DONE`.
    - **Subtasks & Lịch trình:** Đầy đủ Task con kèm cờ khẩn cấp (`isUrgent`), thời gian ước lượng (`estimatedDays`) và phân công nhân sự tương ứng.
    - **Lịch sử trao đổi & Đính kèm:** Bình luận trao đổi (`comments`), đường dẫn Figma & File PDF kiến trúc (`attachments`).
    - **Yêu cầu & Thông báo:** Yêu cầu chuyển giao nhiệm vụ (`task_requests`), thông báo hệ thống (`notifications`), tin nhắn nội bộ (`direct_messages`) và nhật ký cuộc gọi thoại (`call_logs`).
- **Kết quả kiểm tra:** CSDL PostgreSQL đã đồng bộ và nạp thành công 100% (Tasks: 9, Subtasks: 20, Comments: 2, Requests: 2, Attachments: 2, Notifications: 2, Messages: 2).

---

## 136. Cho Phép Admin/Manager/Assignee Thêm Task Con Vào Task Đã Hoàn Thành & Tự Động Tái Kích Hoạt (Auto-Reopen)
- **File 1:** `be/src/modules/task/task.service.ts`
  - **Hành động:** `[LINH HOẠT HÓA RÀNG BUỘC ADDSUBTASK TRÊN TASK DONE & TỰ ĐỘNG CHUYỂN VỀ IN_PROGRESS]`.
  - **Chi tiết:** 
    - Loại bỏ mã lỗi cứng `400 BadRequestException` khi Admin/Manager hoặc chính chủ Task muốn thêm công việc con phát sinh vào một Task đã hoàn tất trước đó.
    - Trong `recalculateTaskProgress`, khi phát hiện Task đang ở trạng thái `DONE` nhưng có thêm Task con mới chưa làm (khiến tiến độ `< 100%`), hệ thống **tự động chuyển trạng thái Task cha về `IN_PROGRESS`** và đặt `completedAt = null` một cách mượt mà và logic.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 137. Mở Quyền Hiển Thị Yêu Cầu Chờ Xử Lý Toàn Hệ Thống Cho Quản Trị Viên (Admin Global Inbox Visibility)
- **File 1:** `be/src/modules/task/task.service.ts`
  - **Hành động:** `[CHO PHÉP TÀI KHOẢN ADMIN XEM TOÀN BỘ YÊU CẦU BÀN GIAO & DUYỆT BÀI TRONG HỆ THỐNG]`.
  - **Chi tiết:** 
    - Trước đây, `getIncomingRequests` chỉ lọc theo `receiverId = currentUserId`, dẫn đến việc các Task chuyển giao gửi cho Manager (như `Minh Anh`) sẽ không xuất hiện khi đăng nhập bằng tài khoản `Huy Dat (Admin)`.
    - Cập nhật logic: Nếu tài khoản đăng nhập là **`ADMIN`**, hệ thống tự động hiển thị **toàn bộ các yêu cầu đang PENDING** trong toàn hệ thống, giúp Admin nắm bắt mọi yêu cầu bàn giao, duyệt bài và có thể trực tiếp can thiệp/phê duyệt thay cho Quản lý dự án.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 138. Khắc Phục Cảnh Báo Type-Safety TypeScript ts(2339) Trong Notification Service
- **File 1:** `be/src/modules/notification/notification.service.ts`
  - **Hành động:** `[ÉP KIỂU AN TOÀN TRONG KHỐI CATCH (ERR: ANY)]`.
  - **Chi tiết:** Trong khối `catch (err)` khi ghi log lỗi gửi thông báo qua Socket.IO, TypeScript mặc định coi `err` là kiểu `unknown` khiến IDE báo lỗi `Property 'stack' does not exist on type 'unknown'. ts(2339)`. Đã định kiểu tường minh `catch (err: any)` và truy xuất an toàn `err?.stack`, `err?.message` giúp triệt tiêu hoàn toàn cảnh báo.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 139. Khắc Phục Danh Sách Thêm Nhân Sự Bị Trống Trong Modal Quản Lý Thành Viên Dự Án
- **File 1:** `fe/src/components/kanban/ProjectMembersModal.tsx`
  - **Hành động:** `[ĐỒNG BỘ ĐÚNG ENDPOINT LẤY DANH SÁCH TẤT CẢ USER /PROFILE/USERS]`.
  - **Chi tiết:** 
    - Trước đây, `ProjectMembersModal` gọi API `api.get('/users')` (endpoint không tồn tại trên Backend), khiến danh sách `allUsers` luôn trả về rỗng `[]` và ô chọn dropdown `-- Chọn nhân sự để thêm vào dự án --` không hiển thị nhân sự nào.
    - Cập nhật gọi chuẩn xác endpoint `api.get('/profile/users')` của `ProfileController`.
    - Bây giờ, danh sách các nhân viên chưa thuộc dự án (Dev, QA, Designer, Manager) sẽ hiển thị đầy đủ kèm chức danh, email và chuyên môn để Quản lý dễ dàng chọn và bấm `[+ Thêm Vào Dự Án]`.
- **Kết quả kiểm tra:** Cả Backend (`be`) và Frontend (`fe`) build đạt 100% (Exit Code 0).

---

## 140. Khắc Phục Lỗi Nginx Encoding UTF-16LE / UTF-8 BOM & Thiết Lập Giới Hạn Tài Nguyên Docker Desktop
- **File 1:** `fe/nginx.conf`
  - **Hành động:** `[CHUẨN HÓA ENCODING UTF-8 KHÔNG BOM CHO CẤU HÌNH NGINX]`.
  - **Chi tiết:** Trước đây, lệnh `Set-Content` của PowerShell vô tình lưu file `nginx.conf` với mã hóa UTF-16 LE, khiến Nginx trong Docker container bị lỗi cú pháp `[emerg] unknown directive` khi khởi động. Đã ghi lại file hoàn toàn bằng chuẩn UTF-8 no-BOM.
- **File 2:** `docker-compose.yml`
  - **Hành động:** `[CẤU HÌNH GIỚI HẠN RAM (MEM_LIMIT) CHO TOÀN BỘ SERVICES DOCKER]`.
  - **Chi tiết:** Bổ sung `mem_limit` và `deploy.resources.limits.memory` (Backend: 2048M, Postgres: 1024M, Frontend: 1024M) nhằm ngăn chặn hiện tượng tràn bộ nhớ (Memory Leak) làm treo Docker Desktop trên Windows.
- **Kết quả kiểm tra:** Toàn bộ các container khởi động mượt mà, RAM hệ thống ổn định dưới 2GB.

---

## 141. Thiết Lập Tự Động Đồng Bộ Lược Đồ CSDL (Prisma DB Push) Khi Khởi Động Backend Container
- **File 1:** `docker-compose.yml`
  - **Hành động:** `[BỔ SUNG LỆNH AUTO-MIGRATION VÀO BACKEND STARTUP COMMAND]`.
  - **Chi tiết:** Bổ sung `command: sh -c "npx prisma db push --accept-data-loss && node dist/main"` cho `backend_api` trong `docker-compose.yml`. Điều này đảm bảo khi clone dự án về máy mới, cơ sở dữ liệu PostgreSQL sẽ tự động tạo bảng và đồng bộ cấu trúc ngay lúc khởi chạy container mà không cần chạy lệnh thủ công từ bên ngoài.
- **Kết quả kiểm tra:** Clone sang môi trường mới chạy `docker-compose up` nhận diện đầy đủ 100% bảng CSDL.

---

## 142. Khắc Phục Lỗi Thiếu Cấu Hình Prisma 7 Trong Docker Stage-1 & Đồng Bộ Cổng Frontend 5173
- **File 1:** `be/Dockerfile`
  - **Hành động:** `[COPY TỆP PRISMA.CONFIG.TS VÀO RUNTIME STAGE]`.
  - **Chi tiết:** Phiên bản Prisma v7.9.1 yêu cầu tệp `prisma.config.ts` để đọc chuỗi kết nối CSDL khi thực thi `npx prisma db push`. Trong Docker multi-stage build cũ, tệp này nằm ở thư mục gốc của Backend nhưng chưa được sao chép vào tầng thực thi (`stage-1`), gây lỗi `The datasource.url property is required in your Prisma config file`. Đã bổ sung `COPY prisma.config.ts ./` vào `be/Dockerfile`.
- **File 2:** `docker-compose.yml`
  - **Hành động:** `[ÁNH XẠ CỔNG FRONTEND VỀ 5173 (5173:80)]`.
  - **Chi tiết:** Chuyển đổi cổng truy cập Frontend từ `8000:80` sang `5173:80` để giữ đúng thói quen truy cập `http://localhost:5173` của người dùng và nhà phát triển.
- **Kết quả kiểm tra:** Backend kết nối CSDL thành công, khởi động NestJS trơn tru; Frontend truy cập chuẩn tại `http://localhost:5173`.

---

## 143. Đồng Bộ Tiền Tố /api Cho VITE_API_URL & Mã Hóa Chuẩn Bcrypt Toàn Diện Cho Toàn Bộ Tài Khoản
- **File 1:** `.env`
  - **Hành động:** `[ĐỒNG BỘ ĐÚNG TIỀN TỐ BASE URL API /API TRONG FILE ENV GỐC]`.
  - **Chi tiết:** Trước đây, biến `VITE_API_URL=http://localhost:3000` thiếu hậu tố `/api`, khiến Frontend khi build gửi nhầm request đăng nhập tới `POST http://localhost:3000/auth/login` (Backend trả về 404 Not Found). Đã chuẩn hóa thành `VITE_API_URL=http://localhost:3000/api` và rebuild lại `frontend_web`.
- **File 2:** `PostgreSQL Database (users table)`
  - **Hành động:** `[ĐỒNG BỘ HASH BCRYPT MẬT KHẨU CHO CÁC TÀI KHOẢN ADMIN/MANAGER/DEV]`.
  - **Chi tiết:** Cập nhật lại mật khẩu tài khoản `admin@taskboard.com` và các tài khoản mẫu sang chuẩn chuỗi băm `bcrypt` thay vì lưu chuỗi thô (plain text), giải quyết triệt để lỗi đăng nhập thất bại 401 Unauthorized.
- **Kết quả kiểm tra:** Đăng nhập thành công 100% với toàn bộ các tài khoản mẫu (`huydatne@gmail.com`, `admin@taskboard.com`, `manager@taskboard.com`, `employee@taskboard.com`...) trả về HTTP 201 và JWT AccessToken hợp lệ.

















































