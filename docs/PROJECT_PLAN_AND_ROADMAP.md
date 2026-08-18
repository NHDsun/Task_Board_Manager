# 🪐 SOLARIS TASK BOARD MANAGER — BẢN KẾ HOẠCH & TIẾN ĐỘ TỔNG THỂ DỰ ÁN (PROJECT PLAN & MASTER ROADMAP)

> **Tài liệu quản trị:** `docs/PROJECT_PLAN_AND_ROADMAP.md`  
> **Nhật ký xung đột logic:** [`docs/05_LOGIC_CONFLICTS_AND_BUSINESS_RULES_LOG.md`](file:///f:/The_project/docs/05_LOGIC_CONFLICTS_AND_BUSINESS_RULES_LOG.md)  
> **Nhật ký chi tiết thay đổi:** [`docs/03_DEVELOPMENT_CHANGELOG_DETAILS.md`](file:///f:/The_project/docs/03_DEVELOPMENT_CHANGELOG_DETAILS.md)  
> **Phiên bản:**  2.5.0 — PRO MAX EDITION  
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
| **13** | **Lên Lịch Ngày Bắt Đầu Task (Flexible Start Date)** | Bổ sung trường `startDate` trong CSDL PostgreSQL, cho phép lên lịch bắt đầu task vào ngày tương lai hoặc bắt đầu sớm mà không bị ép làm ngay. Tự động tính Deadline = Ngày bắt đầu + Tổng số ngày việc con. | ✅ Hoàn thành 100% |
| **14** | **Phân Biệt Chuẩn Xác Trạng Thái Nghỉ Ngơi vs Làm Sớm** | Khi hoàn thành việc hôm nay (Ngày 1), hệ thống hiển thị màn hình chúc mừng nghỉ ngơi và đánh dấu việc kế tiếp là Ngày Mai. Không còn bị nhảy sai thành "Mục tiêu hôm nay (Ngày 2)". Hỗ trợ chuyển đổi sang chế độ Làm Sớm linh hoạt. | ✅ Hoàn thành 100% |
| **15** | **Nút [▶️ Tiếp Tục] & Tự Động Tính Hạn Chót (Làm Tròn Lên: Sớm + Mặc Định)** | Khi ở trạng thái nghỉ ngơi, cung cấp nút `[▶️ Tiếp Tục]`. Tự động tính hạn chót thông minh ngầm: `Math.ceil(Thời gian hoàn thành sớm + Thời gian mặc định task chuẩn bị nhận)`. Giao diện hiển thị tinh gọn, không rườm rà. | ✅ Hoàn thành 100% |
| **16** | **Ghi Trực Tiếp Vào Lịch Thực Tế & Bảo Lưu Hạn Chót Gốc Khi Làm Sớm** | Chuyển đổi toàn bộ các nhãn trừu tượng ("Ngày 1, Ngày 2") thành ngày tháng theo lịch thực tế (`📅 18/08/2026`). Khi nhân viên làm sớm hay bấm [▶️ Tiếp Tục], Hạn chót gốc theo kế hoạch luôn được bảo lưu 100%, không bị co ngắn hay ép hạn. | ✅ Hoàn thành 100% |
| **17** | **Cơ Chế Xác Thực Hoàn Thành Việc Con & Quản Lý Phê Duyệt (Manager Approval)** | Chống việc tick bừa bãi ("tránh tick loạn xạ"): Nhân viên đánh dấu xong việc con sẽ chuyển sang trạng thái `⏳ Chờ Duyệt` và gửi thông báo tới Quản lý. Quản lý duyệt (`Approve`) thì mới chính thức tính % hoàn thành; nếu Từ chối (`Reject`) thì gửi kèm lý do để nhân viên hoàn thiện lại. Tích hợp Nút Hiển Thị Thông Báo `🔔` với badge đếm số lượng yêu cầu mới theo thời gian thực. | ✅ Hoàn thành 100% |
| **18** | **Khóa/Làm Mờ Task Con Hoàn Thành & Giới Hạn Quyền Tick Tuyệt Đối Cho Người Làm Task** | Khi việc con đã hoàn thành (`isDone: true`): Tự động làm mờ (`opacity-40 grayscale`) và vô hiệu hóa tương tác (`pointer-events-none`), không cho phép nhấn hay tick lại. Quyền gửi xác thực việc con thuộc về DUY NHẤT người trực tiếp nhận task (Assignee) — Người tạo và Quản trị viên/Admin không được tick thay. | ✅ Hoàn thành 100% |
| **19** | **Giải Quyết Triệt Để 7 Luồng Conflict Logic & Hoàn Thiện Vòng Đời Subtask** | 1. Tự động duyệt ngay khi Manager/Admin tự làm task của mình (`Self-Approval`).<br>2. Cung cấp nút `[🔄 Gửi Duyệt Lại]` khi subtask bị Từ chối.<br>3. Bổ sung quyền `[↩️ Mở Lại Việc Con]` (`Reopen`) cho Quản lý khi duyệt nhầm.<br>4. Tự động tính & co giãn hạn chót tổng (`dueDate`) khi thêm/sửa/xóa subtask.<br>5. Tự động dọn dẹp các yêu cầu duyệt đang treo khi Task được chuyển giao sang nhân sự mới.<br>6. Tinh chỉnh Optimistic Update chống giật nhấp nháy giao diện.<br>7. Kiểm tra & cảnh báo bắt buộc phân công trước khi thực hiện task. | ✅ Hoàn thành 100% |
| **20** | **Xử Lý 5 Lỗ Hổng Logic Nâng Cao & Tự Động Đồng Bộ Trạng Thái Kanban** | 1. Chặn kéo thả Kanban sang `DONE` khi việc con chưa hoàn tất 100% (chống bypass).<br>2. Tự động chuyển Task sang `DONE` khi subtask cuối cùng được duyệt và tự động về `IN_PROGRESS` khi mở lại.<br>3. Khóa nộp duyệt subtask khi Task đang tạm dừng (`PAUSED`) hoặc bị nghẽn (`BLOCKED`).<br>4. Loại bỏ hoàn toàn thông báo ma (`Ghost Notification`) cho các Task đã bị xóa.<br>5. Khóa quyền tự ý sửa số ngày ước lượng (`estimatedDays`) đối với nhân viên để chống gian lận lùi deadline. | ✅ Hoàn thành 100% |
| **21** | **Xử Lý Xóa Thành Viên Chuyển Về Manager & Manager Phân Công Trực Tiếp (LC-13 ➔ LC-22)** | 1. Xóa thành viên khỏi dự án ➔ Tự động chuyển toàn bộ Task và Subtask về cho Manager của Dự án.<br>2. Manager / Admin chuyển giao task ➔ Gán trực tiếp ngay lập tức, không hiện nút Accept/Deny, chỉ gửi thông báo.<br>3. Chặn chuyển giao Task cho chính mình & chặn gửi nhiều request trùng lặp.<br>4. Xóa Subtask đang PENDING tự động hủy yêu cầu duyệt cũ.<br>5. Khóa cờ khẩn cấp `isUrgent` trên việc con đã xong & khóa xóa file đính kèm trên Task `DONE`. | ✅ Hoàn thành 100% |

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

