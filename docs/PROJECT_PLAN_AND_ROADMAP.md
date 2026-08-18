# 🪐 SOLARIS TASK BOARD MANAGER — BẢN KẾ HOẠCH & TIẾN ĐỘ TỔNG THỂ DỰ ÁN (PROJECT PLAN & MASTER ROADMAP)

> **Tài liệu quản trị:** docs/PROJECT_PLAN_AND_ROADMAP.md  
> **Phiên bản:** 2.4.0 — PRO MAX EDITION  
> **Cập nhật lần cuối:** 2026-08-18  
> **Quy ước vận hành:** Tài liệu này được cập nhật liên tục sau mỗi thay đổi mã nguồn, giúp Ban Giám Đốc, Quản Lý Dự Án và Đội Ngũ Kỹ Thuật nắm bắt chính xác 100% hiện trạng và lộ trình tiếp theo.

---

## 🌟 1. TỔNG QUAN DỰ ÁN & TRIẾT LÝ VẬN HÀNH

**Solaris Task Board Manager** là nền tảng quản trị công việc và điều hành tiến độ dự án realtime thế hệ mới, được thiết kế theo phong cách **Glassmorphism Dark-Mode Sci-Fi / Solaris Sun Flare**.

### 💎 Triết Lý Cốt Lõi (2 Luồng Nghiệp Vụ Tinh Gọn):
1. **☀️ Luồng 1: Today's Focus Cockpit (Tác Nghiệp Vi Mô Hàng Ngày)**:
   - Dành cho **Nhân viên (Assignee)** và **Quản lý (Manager/Admin)** theo dõi công việc ngay trong ngày.
   - Nguyên tắc: **"Mỗi ngày hoàn thành 1 Việc Con (Daily Micro-Sprint)"**.
   - Tôn trọng thời gian làm việc: Deadline tổng được giữ nguyên, khi xong việc hôm nay nhân viên có quyền chọn làm tiếp ngày mai hoặc nghỉ ngơi.
2. **🌌 Luồng 2: Master Plan & Project Roadmap (Quản Trị Vĩ Mô Toàn Dự Án)**:
   - Dành cho **Toàn thể tổ chức** theo dõi lộ trình xuyên suốt qua các Giai đoạn quy trình (Requirements ➔ Design ➔ Dev ➔ QA ➔ Staging ➔ Release).
   - Minh bạch tiến độ, phân chia rõ ràng theo từng Dự án (Project Picker).

---

## ✅ 2. CÁC HẠNG MỤC ĐÃ HOÀN THÀNH (ACCOMPLISHED MILESTONES)

| STT | Phân Hệ / Tính Năng | Mô Tả Chi Tiết Kỹ Thuật & Nghiệp Vụ | Trạng Thái |
| :---: | :--- | :--- | :---: |
| **01** | **Xác Thực & Phân Quyền (RBAC)** | Đăng nhập Email/Password + Google OAuth JWT. Phân quyền đa cấp: ADMIN, MANAGER, EMPLOYEE theo CSDL PostgreSQL. | ✅ Hoàn thành 100% |
| **02** | **Ma Trận Kanban Realtime (Kanban Matrix)** | Kéo thả thẻ mượt mà qua 6 trạng thái (TODO, IN_PROGRESS, PAUSED, BLOCKED, IN_REVIEW, DONE) bằng @hello-pangea/dnd với WebSocket đồng bộ tức thì. | ✅ Hoàn thành 100% |
| **03** | **Today's Focus Cockpit (Pro Max)** | Giao diện điều hành ngày gồm: Thanh **Management Pulse Radar** (cho Quản lý), **Hero Focus Task #1** nổi bật với Live Progress Slider và Action Controls. | ✅ Hoàn thành 100% |
| **04** | **Master Plan & Project Roadmap** | Bảng kế hoạch tổng thể mở cho mọi nhân sự, bộ chọn dự án Project Tabs, Vòng tròn Milestone Ring, trình quản trị Stage Pipeline. | ✅ Hoàn thành 100% |
| **05** | **Daily Micro-Sprint (Mỗi Ngày 1 Việc Con)** | Tự động phân rã tiến độ theo từng ngày (Ngày 1, Ngày 2, Ngày 3...), làm nổi bật việc con mục tiêu hôm nay và tự động tính % tiến độ Task cha. | ✅ Hoàn thành 100% |
| **06** | **Cơ Chế Khẩn Cấp Cấp Việc Con (Subtask Urgency)** | Chuyển độ khẩn cấp isUrgent trực tiếp sang từng việc con. Thẻ Kanban tự động đếm và cảnh báo 🚨 {count} VIỆC CON GẤP nhấp nháy. | ✅ Hoàn thành 100% |
| **07** | **Ước Lượng Ngày & Tính Hạn Chót Công Bằng** | Khi tạo Task, cho phép nhập danh sách việc con kèm số ngày ước tính (1, 2, 3... ngày). Hệ thống tự tính Deadline = Ngày bắt đầu + Tổng số ngày. | ✅ Hoàn thành 100% |
| **08** | **Prompt Tôn Trọng Thời Gian Nhân Viên** | Khi bấm [✓ Xong Việc Hôm Nay], Modal hỏi ý kiến xuất hiện: chọn *Tiến hành việc ngày mai* hoặc *Nghỉ ngơi*, luôn bảo lưu 100% Deadline gốc. | ✅ Hoàn thành 100% |
| **09** | **Tự Động Hóa Luồng Bàn Giao & Hỗ Trợ** | Xin trợ giúp ➔ Tự đổi sang BLOCKED. Bàn giao task ➔ Tự đổi sang IN_REVIEW. Hiển thị tức thì trên thanh Radar của Quản lý. | ✅ Hoàn thành 100% |
| **10** | **Tối Ưu Giao Diện & Loại Bỏ Tính Năng Thừa** | Loại bỏ hoàn toàn Phòng họp WebRTC thừa, tinh gọn thanh điều hướng MeteorEdgeMenu.tsx và dọn dẹp các trường rác trong hệ thống. | ✅ Hoàn thành 100% |
| **11** | **Gửi Tài Liệu & Đính Kèm Trực Tiếp Tại Cockpit** | Tích hợp bảng quản lý và gửi tài liệu / liên kết (Figma, Docs, Specs...) trực tiếp ngay trong Hero Focus Task #1 của Today's Focus Cockpit. | ✅ Hoàn thành 100% |
| **12** | **Khóa Sửa Tiến Độ Thủ Công (100% Tự Động Theo Việc Con)** | Xóa bỏ toàn bộ thanh kéo/nút sửa % tiến độ thủ công. Tiến độ được tính toán và khóa tự động 100% dựa trên số lượng Việc Con hoàn tất. | ✅ Hoàn thành 100% |

---

## 🚀 3. KẾ HOẠCH & CÁC HẠNG MỤC CHUẨN BỊ TRIỂN KHAI (UPCOMING ROADMAP)

### 📌 Danh Mục Các Hạng Mục Chuẩn Bị Làm:

### 🎯 Giai Đoạn 1: Tinh Chỉnh Điều Hành & Giám Sát (Ưu tiên cao)
- [ ] **1.1. Bộ Lọc & Tìm Kiếm Đa Tiêu Chí Thông Minh**:
  - Lọc kết hợp: Dự án + Nhân viên + Mức độ Gấp + Giai đoạn + Trạng thái tiến độ.
  - Tìm kiếm Full-Text tức thì trên cả Task cha và tên các Việc con.
- [ ] **1.2. Nâng Cấp Nhật Ký Hoạt Động (Audit Trail & Activity Log)**:
  - Ghi vết chi tiết từng lượt hoàn thành việc con: ai hoàn thành lúc mấy giờ, chuyển trạng thái khi nào.
  - Bộ lọc xem lịch sử theo từng Task và từng thành viên.

### 🎯 Giai Đoạn 2: Thông Báo Thời Gian Thực & Báo Cáo Năng Suất (Ưu tiên trung bình)
- [ ] **2.1. Trung Tâm Thông Báo Thời Gian Thực (Notification Bell Widget)**:
  - Thông báo đẩy realtime qua WebSocket khi có người giao Task mới, có việc con gấp cần xử lý, hoặc có yêu cầu bàn giao task.
- [ ] **2.2. Bảng Phân Tích Hiệu Suất (Productivity & Sprint Metrics)**:
  - Thống kê tỷ lệ hoàn thành đúng hạn của nhân viên.
  - Biểu đồ Burndown Chart và vận tốc Sprint (Velocity) của từng Dự án.

### 🎯 Giai Đoạn 3: Tích Hợp AI & Trải Nghiệm Nâng Cao (Kế hoạch mở rộng)
- [ ] **3.1. AI Task Breakdown Assistant**:
  - Trợ lý AI tự động phân rã 1 Task lớn thành các Việc con theo từng ngày với thời lượng ước tính chuẩn xác dựa trên chuyên môn (DEV, TESTER, BA, DESIGNER...).
- [ ] **3.2. PWA Mobile Responsive**:
  - Tối ưu hóa giao diện hoàn hảo trên thiết bị di động để nhân sự có thể tick nhanh việc con trong ngày mọi lúc mọi nơi.

---

## 📊 4. BẢNG CHỈ SỐ VẬN HÀNH HỆ THỐNG (SYSTEM HEALTH & TECH STACK)

| Thành Phần | Công Nghệ Sử Dụng | Hiện Trạng Kiểm Thử |
| :--- | :--- | :---: |
| **Database** | PostgreSQL 16 + Prisma ORM (Prisma v7.9.1) | 🟢 Healthy (Synced) |
| **Backend API** | NestJS 10 + TypeScript + Socket.IO WebSockets | 🟢 Build Pass (Code 0) |
| **Frontend Web** | React 19 + TypeScript + Vite + Tailwind CSS | 🟢 Build Pass (Code 0) |
| **Design System** | Solaris Glassmorphism Dark-Mode + Sci-Fi Glows | 🟢 Pro Max Standard |
| **State & Data Store** | Zustand + Axios Interceptor + Socket Client | 🟢 Realtime Synced |

---

## 📝 5. QUY ƯỚC BẢO TRÌ TÀI LIỆU (DOCUMENTATION PROTOCOL)

1. **Nguyên tắc đồng bộ**: Mỗi khi hoàn thành hoặc bổ sung bất kỳ tính năng nào trong codebase, tài liệu này **bắt buộc phải được cập nhật** tương ứng ở mục *Các Hạng Mục Đã Hoàn Thành* hoặc *Kế Hoạch Tiếp Theo*.
2. **Theo dõi chi tiết**: Các thay đổi mã nguồn từng dòng được đối chiếu tại docs/03_DEVELOPMENT_CHANGELOG_DETAILS.md.
3. **Báo cáo trực quan**: Báo cáo tổng kết sau từng phiên làm việc được lưu tại walkthrough.md.

