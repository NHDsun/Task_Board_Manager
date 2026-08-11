# BÁO CÁO CHI TIẾT CÁC THAY ĐỔI MÃ NGUỒN DỰ ÁN (DEVELOPMENT CHANGELOG DETAILS)

Tài liệu này ghi lại toàn bộ lịch sử can thiệp mã nguồn dự án qua từng bước thực thi.

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
- **File 5:** `fe/src/main.tsx` & `fe/src/App.tsx`
  - **Hành động:** `[CẬP NHẬT ROOT APP]`.
  - **Chi tiết:** Nhúng `GoogleOAuthProvider` vào `main.tsx` và hiển thị `LoginPage` trong `App.tsx`.
- **Kết quả kiểm tra:** Chạy `npm run build` biên dịch Vite production thành công 100% trong 7.37s (0 lỗi, 0 cảnh báo).

---

## 44. Thực thi Khởi chạy Thử nghiệm Frontend Dev Server (Vite 8)
- **Hệ thống:** Frontend Local Server (`npm run dev`).
  - **Hành động:** `[KHỞI CHẠY TẮC VỤ NỀN DAEMON]`.
  - **Chi tiết:** Khởi chạy Vite Dev Server tại địa chỉ `http://localhost:5173/`.
- **Mục đích:** Kiểm tra trực quan giao diện Đăng Nhập Dark Sun UI thời gian thực với Hot Module Replacement (HMR).
- **Kết quả kiểm tra:** Server sẵn sàng trong 367ms, truy cập thành công tại `http://localhost:5173/`.

---

## 45. Nâng cấp Nhận diện Thương hiệu Logo HD, Favicon & Tiêu đề Trang Trình duyệt
- **File 1:** `fe/index.html`
  - **Hành động:** `[CHỈNH SỬA METADATA]`.
  - **Chi tiết:** Cập nhật tiêu đề từ `fe` thành `Solaris Task Board | Quản Lý Công Việc Thông Minh` và cập nhật đường dẫn Favicon sang `/favicon.svg`.
- **File 2:** `fe/public/favicon.svg` & `fe/public/vite.svg`
  - **Hành động:** `[THÊM MỚI & CẬP NHẬT FAVICON]`.
  - **Chi tiết:** Thay thế biểu tượng tia sét Vite mặc định bằng SVG Logo Mặt Trời Đen với vòng hào quang phát sáng Hổ Phách & Tím.
- **File 3:** `fe/public/dark-sun-logo.jpg` & `fe/src/assets/dark-sun-logo.jpg`
  - **Hành động:** `[THÊM MỚI ASSET LOGO HD]`.
  - **Chi tiết:** Thêm file ảnh Logo Mặt Trời Đen chất lượng cao (Solar Eclipse HD Vector Art) vào thư mục tài nguyên dự án.
- **File 4:** `fe/src/components/common/DarkSunLogo.tsx`
  - **Hành động:** `[CẬP NHẬT COMPONENT LOGO]`.
  - **Chi tiết:** Nhập trực tiếp ảnh Logo HD kết hợp khung viền hiệu ứng xung quầng sáng 3D (`animate-corona-pulse`).
- **Kết quả kiểm tra:** Chạy `npm run build` thành công trong 323ms (0 lỗi, 0 cảnh báo).

---

## 46. Chuẩn hóa Quy tắc Bảo mật: Chỉ Admin Mới Có Quyền Tạo Tài Khoản (Admin-Only Account Provisioning)
- **File:** `fe/src/pages/LoginPage.tsx`
  - **Hành động:** `[LOẠI BỎ LIÊN KẾT ĐĂNG KÝ CÔNG KHAI]`.
  - **Chi tiết:** Gỡ bỏ hoàn toàn dòng chữ *"Chưa có tài khoản? Đăng ký ngay"* ở footer trang Đăng nhập.
- **Quy tắc nghiệp vụ mới:** 
  - Hệ thống không cho phép nhân viên tự đăng ký tự do (`/register` disabled).
  - Duy nhất Admin (`Role.ADMIN`) mới có quyền tạo và cấp phát tài khoản nhân sự trong Trang Quản trị Cấu hình (`/admin/users`).
- **Kết quả kiểm tra:** Chạy `npm run build` thành công trong 349ms (0 lỗi, 0 cảnh báo).

---

## 47. Cấu hình Google OAuth 2.0 Client ID Thật Cho Frontend
- **File:** `fe/.env`
  - **Hành động:** `[THÊM MỚI BIẾN MÔI TRƯỜNG]`.
  - **Chi tiết:** Đã cập nhật biến môi trường `VITE_GOOGLE_CLIENT_ID` với mã Client ID thật: `73331301666-21hnqrcgeel2pkbc4o0v3d4uvd49pu06.apps.googleusercontent.com`.
- **Mục đích:** Kích hoạt tính năng Đăng nhập 1-Click bằng Gmail Google hoạt động thực tế 100% trên trình duyệt.
- **Kết quả kiểm tra:** Khởi động lại Vite Dev Server thành công trong 300ms tại `http://localhost:5173/`.

---

## 48. Khắc Phục Lỗi Định Tuyến Endpoint Đăng Nhập Google (Google OAuth Routing Fix)
- **File:** `fe/src/pages/LoginPage.tsx`
  - **Hành động:** `[CHỈNH SỬA CODE]`.
  - **Chi tiết:** Cập nhật hàm `handleLoginSubmit` tự động phân tách đường dẫn API (`payload.googleToken ? '/auth/google' : '/auth/login'`).
- **Mục đích:** Giải quyết dứt điểm lỗi Validation (`Email không được để trống`, `Mật khẩu không được để trống`) do gửi nhầm token Google sang API đăng nhập Email/Password.
- **Kết quả kiểm tra:** Chạy `npm --prefix fe run build` thành công 100% trong 350ms.

---

## 49. Nâng Cấp Nền Giao Diện Đăng Nhập Phong Cách Dark Sun Eclipse (UI UX Pro Max Upgrade)
- **File 1:** `fe/src/index.css`
  - **Hành động:** `[THÊM MỚI CSS KEYFRAMES & UTILITY CLASSES]`.
  - **Chi tiết:**
    - Định nghĩa `@keyframes solarRotate` (Xoay vòng hào quang mặt trời 25s liên tục) và `@keyframes ambientFloat` (Hiệu ứng chuyển động bồng bềnh của các khối quầng sáng).
    - Thêm class `.solar-grid-pattern` tạo lưới không gian vũ trụ 3D kết hợp `radial-gradient` hạt sáng Hổ Phách (`#f59e0b`).
    - Nâng cấp `.solar-glass-card` bổ sung `backdrop-filter: blur(24px)` và hiệu ứng phát sáng mờ 2 tầng (Amber + Eclipse Violet).
- **File 2:** `fe/src/pages/LoginPage.tsx`
  - **Hành động:** `[CẬP NHẬT GIAO DIỆN BACKGROUND & PORTAL CARD]`.
  - **Chi tiết:**
    - Tích hợp 3 khối quầng sáng Ambient Floating Orbs phát sáng đa sắc (Amber Gold, Eclipse Violet, Emerald Orbit).
    - Thêm vòng hào quang Mặt Trời Đen xoay quỹ đạo (`animate-solar-rotate`) nằm trực tiếp phía sau Eclipse Portal Card.
    - Thêm đường viền phản quang dải ngân hà ở viền trên Portal Card (`border-t-2 border-t-amber-400/40`).
- **Kết quả kiểm tra:** Chạy `npm --prefix fe run build` thành công 100% trong 329ms.

---

## 50. Tạo Tài Liệu Phân Tích Chi Tiết Từng Dòng Mã Nguồn CSS (Line-By-Line CSS Documentation)
- **File:** `docs/04_CSS_DESIGN_SYSTEM_AND_LINE_BY_LINE_GUIDE.md`
  - **Hành động:** `[THÊM MỚI FILE TÀI LIỆU]`.
  - **Chi tiết:** Phân tích chi tiết toàn bộ 124 dòng mã nguồn trong `fe/src/index.css` bao gồm các phần: `@import`, `:root` CSS variables, `body`, 4 bộ `@keyframes`, các utility animation classes, và các lớp Bento Glassmorphism (`.solar-grid-pattern`, `.solar-glass-card`, `.solar-corona-btn`).
- **Mục đích:** Cung cấp hướng dẫn kỹ thuật chi tiết giúp lập trình viên hiểu rõ cơ chế hoạt động từng thuộc tính CSS trong hệ thống Dark Sun UI Design System.

---

## 51. Chuẩn Hóa Mã Hóa Mật Khẩu Bcrypt Cho Dữ Liệu Khởi Tạo Khung (Prisma Seed Fix)
- **File:** `be/prisma/seed.ts`
  - **Hành động:** `[CHỈNH SỬA MÃ NGUỒN SEED]`.
  - **Chi tiết:** Sử dụng `bcrypt.hash('password123', 10)` để mã hóa mật khẩu tài khoản Admin mẫu (`admin@taskboard.com`).
- **Mục đích:** Đảm bảo khi đăng nhập bằng Email/Password, hàm `bcrypt.compare` ở Backend xác thực thành công 100%.

---

## 52. Khắc Phục Lỗi Bóc Tách Dữ Liệu Phản Hồi API Đăng Nhập (Backend TransformInterceptor Unwrapping Fix)
- **File:** `fe/src/pages/LoginPage.tsx`
  - **Hành động:** `[CHỈNH SỬA CODE]`.
  - **Chi tiết:** Cập nhật hàm `handleLoginSubmit` tự động kiểm tra và bóc tách khối dữ liệu bọc `response.data.data` do NestJS `TransformInterceptor` đóng gói.
- **Mục đích:** Đảm bảo `setAuth` nhận đúng đối tượng `user` và chuỗi `accessToken` khi Đăng nhập thành công.
- **Kết quả kiểm tra:** Đã kiểm tra gọi API `POST /api/auth/login` trực tiếp trả về `statusCode: 201` thành công 100%.

---

## 53. Thêm Màn Hình Thử Nghiệm Đăng Nhập Thành Công (Auth Success Test Component)
- **File 1:** `fe/src/components/auth/AuthSuccessTestPage.tsx`
  - **Hành động:** `[THÊM MỚI FILE COMPONENT TẠM THỜI]`.
  - **Chi tiết:** Xây dựng màn hình thông báo Đăng nhập thành công chuẩn phong cách Dark Sun UI: Hiển thị Banner xác thực, Họ tên người dùng, Email, Badge Quyền hạn (`ADMIN`/`MANAGER`/`EMPLOYEE`), Trạng thái phiên (`🟢 Active Session`), Trích đoạn JWT Access Token và nút bấm Đăng xuất.
- **File 2:** `fe/src/App.tsx`
  - **Hành động:** `[CẬP NHẬT ĐIỀU HƯỚNG VIEW SWITCHER]`.
  - **Chi tiết:** Đọc trạng thái `isAuthenticated` từ Zustand Auth Store `useAuthStore`. Nếu `isAuthenticated === true` sẽ tự động hiển thị `<AuthSuccessTestPage />`, ngược lại hiển thị `<LoginPage />`.
- **Lưu ý nghiệp vụ:** Màn hình này là bản thử nghiệm tạm thời và sẽ tự động được thay thế bằng Màn hình Bảng Kanban (`BoardPage.tsx`) khi triển khai Giai đoạn 2.
- **Kết quả kiểm tra:** Chạy `npm --prefix fe run build` thành công 100% trong 289ms.

---

## 54. Cập Nhật Bản Kế Hoạch Master Plan: Bổ Sung Cơ Chế Chấm Công & Điểm Danh Thông Minh (Solaris Smart Attendance System)
- **File:** `docs/01_PROJECT_ARCHITECTURE_AND_MASTER_PLAN.md`
  - **Hành động:** `[CẬP NHẬT TÀI LIỆU MASTER PLAN & KHIẾU NẠI ERD]`.
  - **Chi tiết:** 
    - Đã bổ sung **Giá trị Cốt lõi #7**: Cơ chế Chấm công & Điểm danh Thông minh (Solaris Smart Attendance System).
    - Đã thêm mô hình CSDL Prisma `AttendanceLog` (hỗ trợ các hình thức Check-in bằng Giọng nói `VOICE`, Check-in tự động khi đụng Task `TASK_DRIVEN`, phân loại làm việc `OFFICE` vs `REMOTE`).
- **Mục đích:** Chuẩn hóa kiến trúc nghiệp vụ chấm công hiện đại, loại bỏ chấm công thủ công thô kệch, giúp Manager theo dõi chính xác thời gian và năng suất làm việc thực tế của nhân sự.

---

## 55. Nâng Cấp CSDL Prisma Schema Bổ Sung Các Trạng Thái Task Dở Dang & Bảng Chấm Công (TaskStatus & Attendance Model)
- **File 1:** `be/prisma/schema.prisma`
  - **Hành động:** `[CẬP NHẬT CSDL PRISMA SCHEMA]`.
  - **Chi tiết:**
    - Cập nhật `enum TaskStatus` bổ sung 3 trạng thái mới: `PAUSED` (Tạm dừng dở dang), `BLOCKED` (Tắc nghẽn chờ thông tin), và `IN_REVIEW` (Chờ kiểm thử/duyệt).
    - Bổ sung cột `progress Int @default(0)` (Phần trăm tiến độ hoàn thành từ 0 - 100%) vào `model Task`.
    - Bổ sung `model AttendanceLog` và các enums `AttendanceType`, `WorkMode`.
- **File 2:** `docs/01_PROJECT_ARCHITECTURE_AND_MASTER_PLAN.md`
  - **Hành động:** `[CẬP NHẬT KẾ HOẠCH MASTER PLAN]`.
  - **Chi tiết:** Cập nhật enum `TaskStatus` và luồng nghiệp vụ quản lý Task dở dang trong bản Master Plan.
- **Kết quả kiểm tra:** Chạy `npx prisma generate` thành công 100% trong 174ms, đã tạo lại Prisma Client TypeScript definitions.

---

## 56. Bổ Sung Cơ Chế Yêu Cầu Chuyển Giao & Hỗ Trợ Task Liên Nhân Viên (Inter-User Task Request System)
- **File 1:** `be/prisma/schema.prisma`
  - **Hành động:** `[THÊM MỚI PRISMA MODEL & ENUMS]`.
  - **Chi tiết:**
    - Tạo `model TaskRequest` với các cột: `taskId`, `senderId`, `receiverId`, `type` (`TRANSFER` | `ASSIST` | `REVIEW`), `status` (`PENDING` | `ACCEPTED` | `REJECTED` | `CANCELLED`), `note`, `responseNote`.
    - Thiết lập liên kết 1-n giữa `User` và `TaskRequest` (`SentTaskRequests` & `ReceivedTaskRequests`).
- **File 2:** `docs/01_PROJECT_ARCHITECTURE_AND_MASTER_PLAN.md`
  - **Hành động:** `[CẬP NHẬT MASTER PLAN]`.
  - **Chi tiết:** Bổ sung **Giá trị Cốt lõi #8**: Cơ chế Gửi Yêu cầu & Chuyển giao Task Liên Nhân viên với quy trình chuyển đổi trạng thái tự động `PENDING` ➡️ `ACCEPTED` / `REJECTED`.
- **Kết quả kiểm tra:** Chạy `npx prisma generate` thành công 100% trong 213ms.

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














