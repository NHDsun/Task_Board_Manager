# 🚀 KẾ HOẠCH TỔNG THỂ & KIẾN TRÚC HỆ THỐNG (PROJECT ARCHITECTURE & MASTER PLAN)

Tài liệu này tổng hợp toàn bộ **Bản Kế hoạch Tổng thể Hiện thực hóa Dự án**, **Sơ đồ Kiến trúc & 11 Luồng Nghiệp vụ Cốt lõi**, cùng **Đề xuất Thiết kế Tiến trình Dự án (Process Pipeline)** cho dự án **"Bảng Công việc Hỗ trợ Nhập liệu Giọng nói (Voice-Assisted Task Board)"**.

---

## 🎯 PHẦN 1: KẾ HOẠCH TỔNG THỂ & GIÁ TRỊ CỐT LÕI (MASTER PLAN)

> [!IMPORTANT]
> **Trạng thái:** Tài liệu kế hoạch phê duyệt. Tạm thời **CHƯA CAN THIỆP MÃ NGUỒN CODE**.

### 1. 14 Giá Trị Cốt Lõi Độc Nhất Của Dự Án (Unique Value Propositions)

1. **Nhập liệu & Điều khiển Giọng nói Tiếng Việt (Smart Voice Input):** Tích hợp Web Speech API tự động trích xuất Tiêu đề, Hạn chót, Độ ưu tiên (`URGENT`), tự gán chính chủ kèm Popup Undo 10 giây.
2. **Cơ chế Tiến trình Dự án Giai đoạn (Process Pipeline Stage):** Chia dự án thành các Giai đoạn/Tiến trình tuần tự (Giai đoạn 1 ➡️ Giai đoạn 2 ➡️ Giai đoạn 3). Tiến trình trước xong mới mở khóa (`UNLOCKED`) cho các phòng ban ở Tiến trình sau làm tiếp.
3. **Hàng chờ Công việc Cá nhân (My Focus Queue & URGENT Auto-Insert):** Nhân viên tập trung 100% vào 1 Task đang làm (`IN_PROGRESS`) và 1 Hàng chờ Pending (`TODO`). Khi có Task `URGENT` bắn về ➡️ Tự động nhảy lên vị trí **#1 hàng chờ Pending**.
4. **Liên phòng ban & Phân quyền RBAC (Multi-Department Collaboration):** Cho phép một Dự án được gán cho nhiều Phòng ban (`Product`, `Client`, `Dev`, `Tester`...) cùng phối hợp thực hiện.
5. **Phân biệt Độc lập giữa Phòng ban (`Department`) và Nghiệp vụ Chuyên môn (`Profession`):**
   - **Phòng ban (`Department`):** Nơi quản lý tổ chức (VD: `Khối Product`, `Khối Client`, `Chi nhánh 1`...).
   - **Nghiệp vụ Chuyên môn (`Profession`):** Tay nghề thực tế của nhân viên (`DEV`, `TESTER`, `MARKETING`, `DESIGNER`, `BA`...).
   - **Ví dụ minh họa:** Nhân viên A thuộc *Phòng ban Khối Client* nhưng có *Nghiệp vụ là Dev*; Nhân viên B thuộc *Phòng ban Khối Product* nhưng có *Nghiệp vụ là Tester*.
   - **Ứng dụng:** Khi giao việc ở từng Tiến trình Giai đoạn, Manager lọc danh sách theo đúng **Nghiệp vụ chuyên môn** của nhân viên để giao task chính xác tuyệt đối.
6. **Truyền thông Real-time & Cuộc gọi WebRTC (Chat & Video Call):** Chat riêng 1-1 (`DirectMessage`), Bình luận Task và Cuộc gọi thoại/Gọi Video sắc nét trực tiếp trên trình duyệt.
7. **Cơ chế Chấm công & Điểm danh Thông minh (Solaris Smart Attendance System):** Tích hợp Chấm công giọng nói (*"Solaris, tôi bắt đầu ca làm việc"*), Tự động Check-in khi đụng vào Task đầu tiên trong ngày (Task-Driven Check-In), Điểm danh vùng IP/Geofencing (`OFFICE` vs `REMOTE`), và Hệ thống Huy hiệu Uy tín Đúng giờ (Solar Streak Badges) - **Được tích hợp trực tiếp trên Header Trang Bảng Task (`/tasks`)**.
8. **Trang Theo Dõi & Giám Sát Chấm Công Dành Cho Admin (`/admin/attendance`):** Dành riêng cho tài khoản Admin/Manager theo dõi toàn bộ nhật ký điểm danh ca làm việc của toàn thể nhân sự công ty, lọc theo ngày/tuần/tháng, phòng ban và chế độ làm việc (`OFFICE`/`REMOTE`).
9. **Cơ chế Gửi Yêu Cầu & Chuyển Giao Task Liên Nhân Viên (Inter-User Task Request System):** Cho phép nhân viên tạo Yêu cầu Chuyển giao Task (`TRANSFER`), Nhờ hỗ trợ (`ASSIST`), hoặc Gửi duyệt bài (`REVIEW`). Mặc định ở trạng thái `PENDING` (Chờ phản hồi) dưới dạng Hộp Thư Floating Drawer bên cạnh Bảng Kanban.
10. **Tùy Chọn Tạo Dự Án Mới Cho Admin & Badge Tên Dự Án Trên Thẻ Task:** Admin/Manager có thêm nút **"+ Tạo Dự Án Mới"** (`+ Create Project`) tại Header Bảng Task. Mỗi thẻ Bento Task (`KanbanCard`) được hiển thị rõ **Badge Tên Dự Án** giúp nhận diện dự án tức thì.
11. **Thanh Menu Sao Băng Trượt Rìa Màn Hình (Meteor Shower Sliding Edge Menu):** Thiết kế Menu ẩn nấp dọc rìa màn hình duy trì trên mọi trang.
12. **Cơ chế Gửi Yêu Cầu Làm Việc Từ Xa (Remote Work Request System):** Cho phép nhân viên tạo Yêu cầu Làm từ xa (`/remote-requests`) chọn thời gian, lý do & kế hoạch công việc. Trạng thái tự động ở `PENDING` chờ Manager/Admin duyệt (`APPROVED` ➡️ Tự động cập nhật `workMode = REMOTE` trong CSDL Chấm công / `REJECTED` ➡️ Trả về kèm lý do).
13. **Cơ chế Tự Động Đăng Xuất An Toàn 5 Phút & Quy Tắc Miễn Trừ Thông Minh:** Đếm ngược 30s khi không thao tác 4m30s, tạm dừng khi ở Phòng họp WebRTC (`/meetings`) hoặc tab sang công cụ AI (`🟣 AI RESEARCH`).
14. **Trợ Lý AI Doanh Nghiệp Bảo Mật Bảo An (Solaris Enterprise Secure AI Assistant):** Trợ lý AI ảo hỗ trợ trả lời câu hỏi quy trình, thực thi tác vụ, tuân thủ nghiêm ngặt Lọc quyền RBAC 100% và Zero Public Training Policy.

---

### 3. Lộ trình Triển khai Song hành 5 Giai đoạn (BE-FE Sync Roadmap)

#### 🏁 GIAI ĐOẠN 1: XÁC THỰC TÀI KHOẢN & PHÂN QUYỀN (AUTH & PROFILE)
- **Backend (BE):** Hoàn thiện các API Đăng ký (`POST /auth/register`), Đăng nhập Email/Pass (`POST /auth/login`), Đăng nhập Google (`POST /auth/google`), Profile (`GET /auth/me`).
- **Frontend (FE):** Cấu hình Axios (`api.ts`), Auth Store Zustand (`useAuthStore.ts`), Màn hình Đăng nhập Glassmorphism (`LoginPage.tsx`), Màn hình Đăng ký (`RegisterPage.tsx`).
- **🎯 Bấm Web Test:** Đăng ký tài khoản ➡️ Đăng nhập Local ➡️ Đăng nhập 1-Click bằng Gmail Google!

#### 🏁 GIAI ĐOẠN 2: TIẾN TRÌNH DỰ ÁN, BẢNG KANBAN & HÀNG CHỜ CÁ NHÂN (PIPELINE, KANBAN & MY QUEUE)
- **Backend (BE):** API CRUD ProjectStage, API Kéo thả Task (`PATCH /tasks/:id/status`), Thuật toán tự động chèn Task `URGENT` lên vị trí #1 hàng chờ Pending.
- **Frontend (FE):** 
  - Giao diện Bảng Kanban kéo thả mượt mà 0ms (`Board.tsx`).
  - Nút công tắc chuyển đổi: **Bảng Kanban Dự án** vs **Góc nhìn Tiến trình (Pipeline View)** vs **Hàng chờ Tập trung Cá nhân (My Focus Queue)**.
- **🎯 Bấm Web Test:** Chuyển qua lại giữa các góc nhìn, thử chèn Task Urgent tự động nhảy đầu hàng chờ!

#### 🏁 GIAI ĐOẠN 3: NHẬP LIỆU GIỌNG NÓI TIẾNG VIỆT THÔNG MINH (VOICE COMMAND MODULE)
- **Backend (BE):** API Bóc tách từ khóa Tiếng Việt (`POST /tasks/voice-command`), nhận diện từ khóa `gấp/khẩn cấp` để đặt Priority `URGENT`.
- **Frontend (FE):** Hook `useSpeechToText.ts` (Web Speech API), Nút Micro thu âm (`VoiceCommandButton.tsx`), Hiệu ứng sóng âm giọng nói, Toast Undo 10 giây.
- **🎯 Bấm Web Test:** Bấm nút Micro nói: *"Tạo task khẩn cấp sửa lỗi thanh toán ngay"*, hệ thống tự tạo task và chèn vị trí #1!

#### 🏁 GIAI ĐOẠN 4: REAL-TIME CHAT 1-1 & CUỘC GỌI WEBRTC (COMMUNICATION MODULE)
- **Backend (BE):** `Socket.IO Gateway` broadcast sự kiện real-time, `ChatModule` (DirectMessage 1-1), `CallModule` (WebRTC Signaling).
- **Frontend (FE):** Hook `socket.service.ts`, Khung Chat 1-1 (`DirectMessageDrawer.tsx`), Màn hình Đổ chuông & Gọi Video (`CallModal.tsx`).
- **🎯 Bấm Web Test:** Mở 2 trình duyệt ở 2 tài khoản, bấm "Gọi Video", bên kia đổ chuông và nhận hình ảnh video sắc nét!

#### 🏁 GIAI ĐOẠN 5: DASHBOARD THỐNG KÊ & QUẢN LÝ PHÒNG BAN (ANALYTICS & DEPARTMENTS)
- **Backend (BE):** API Thống kê số liệu công việc cho Manager/Admin.
- **Frontend (FE):** Biểu đồ Recharts (`DashboardPage.tsx`), Trang Cấu hình nhân sự & phòng ban (`SettingsPage.tsx`).

---

### 4. Quy trình Kiểm soát Vi mô (Micro-step Governance Protocol)

1. **Chỉ làm đúng 1 thao tác nhỏ mỗi lượt:** Không tự ý dồn việc hay viết nguyên cả Module.
2. **Báo cáo chi tiết vị trí & đoạn code:** Tên file, dòng code, hành động `[THÊM MỚI]`/`[CHỈNH SỬA]`/`[XÓA BỎ]` và mục đích.
3. **Cập nhật Báo cáo vào thư mục `docs/`:** Tự động ghi vết vào [`docs/03_DEVELOPMENT_CHANGELOG_DETAILS.md`](file:///f:/The_project/docs/03_DEVELOPMENT_CHANGELOG_DETAILS.md).
4. **Tên Commit ngắn gọn (2 - 4 từ):** Báo cáo nội dung commit trước và chờ người dùng xác nhận mới bấm `git push`.

---

## 🗺️ PHẦN 2: SƠ ĐỒ TOÀN BỘ CÁC LUỒNG HOẠT ĐỘNG VÀ SỰ LIÊN KẾT TRONG HỆ THỐNG

### 1. Sơ đồ Ma trận Liên kết Bảng CSDL (ERD Relationships)

```text
[Department] ◄─── (1-n) ─── [User] ─── (1-n) ─── [AuditLog]
     ▲                       │                       ▲
     │ (n-n)                 │ (1-n)                 │ (người thực hiện)
     │                       ▼                       │
[ProjectDepartment] ─── [Project] ─── (1-n) ─── [Comment]
                             │                       ▲
                             │ (1-n)                 │ (thuộc task)
                             ▼                       │
                       [Task] ───────────────────────┘
                       ├── (1-n) ──► [Subtask]
                       └── (n-n) ──► [TaskTag] ──► [Tag]

[DirectMessage]: Liên kết độc lập (1-1) giữa 2 [User] (Sender & Receiver)
```

---

### 2. Chi tiết 11 Luồng Nghiệp vụ Cốt lõi

#### LUỒNG 1: Phân quyền & Xác thực (Authentication & RBAC)
1. **Đăng nhập:** User nhập Email/Pass ➡️ FE gửi `POST /auth/login` ➡️ BE mã hóa Bcrypt kiểm tra ➡️ BE trả về `accessToken` (JWT).
2. **Lưu Token:** FE lưu Token vào `localStorage` và tự động gắn vào Header `Authorization: Bearer <token>` cho mọi request sau đó.
3. **Phân quyền (Guards):** Khi FE gọi API ➡️ BE chạy `JwtAuthGuard` và `RolesGuard`:
   - `Role.ADMIN`: Toàn quyền trên mọi API.
   - `Role.MANAGER`: Tạo/Quản lý dự án của mình, thêm bớt nhân viên.
   - `Role.EMPLOYEE`: Chỉ thao tác trên các Task được giao hoặc trong Project được thêm vào.

#### LUỒNG 2: Quản lý Liên Phòng ban & Dự án (Multi-Department Projects)
1. **Tạo Phòng ban:** Admin tạo danh mục `Department` (Ví dụ: Dev, Tester, Marketing).
2. **Gán Phòng ban:** Admin gán mỗi `User` vào 1 `Department`.
3. **Khởi tạo Dự án:** Manager tạo `Project` và chọn **Nhiều Phòng ban** cùng phối hợp ➡️ Hệ thống tự động chèn dữ liệu vào bảng trung gian `ProjectDepartment`.
4. **Thêm nhân sự:** Manager thêm các `User` thuộc các phòng ban đó vào `ProjectMember`.

#### LUỒNG 3: Vòng đời Công việc trên Bảng Kanban (Task Lifecycle)
1. **Tạo Task:** User bấm tạo Task ➡️ Lưu vào `Task` (Status: `TODO`).
2. **Gán nhãn & Đầu việc nhỏ:** 
   - Thêm nhãn màu ➡️ Lưu vào `TaskTag` ➡️ Nối với `Tag`.
   - Thêm checklist ➡️ Lưu vào `Subtask` (Trạng thái completed: `true/false`).
3. **Kéo-thả trạng thái:** User kéo thẻ từ *To Do* sang *In Progress* hoặc *Done* ➡️ FE chạy **Optimistic Update** (đổi giao diện ngay) ➡️ Gửi API `PATCH /tasks/:id/status` ➡️ BE cập nhật `status` trong DB.
4. **Dọn bảng (Archive):** Manager bấm "Dọn bảng" ➡️ BE chạy Transaction chuyển tất cả Task có `status = DONE` thành `isArchived = true`. Task sẽ ẩn khỏi Kanban nhưng vẫn phục vụ báo cáo Dashboard.

#### LUỒNG 4: Điều khiển & Nhập liệu Giọng nói (Smart Voice Command)
1. **Thu âm:** User bấm Micro ➡️ **Web Speech API** trên trình duyệt thu âm và dịch giọng nói tiếng Việt thành đoạn văn bản.
2. **Gửi câu lệnh:** FE gửi đoạn văn bản sang API `POST /tasks/voice-command`.
3. **Phân tích cú pháp (Intent Parser):** Backend quét từ khóa:
   - Trích xuất **Tiêu đề** (Title).
   - Trích xuất **Hạn chót** (DueDate) từ các từ như *"chiều nay"*, *"ngày mai"*.
   - Trích xuất **Độ ưu tiên** (Priority) từ các từ như *"gấp"*, *"khẩn cấp"*.
4. **Auto-Assign & Undo:** Task được tự động gán cho chính User đang nói (`assigneeId = currentUser`). FE hiển thị thông báo popup kèm nút **Undo (Hoàn tác) trong 10 giây**.

#### LUỒNG 5: Đồng bộ Thời gian thực (Socket.IO Real-time)
1. **Kết nối:** Ngay khi Đăng nhập, FE kết nối với `Socket.IO Gateway` của BE và tham gia (Join) vào các room: `project:{projectId}` và `user:{userId}`.
2. **Phát sóng (Broadcast):** Khi có bất kỳ thao tác nào làm đổi dữ liệu (Kéo task, tạo comment, chat 1-1):
   - BE thực hiện lưu DB xong.
   - BE phát tín hiệu `socket.to("project:123").emit("task:updated", data)`.
3. **Cập nhật màn hình:** Tất cả các máy tính khác trong room `project:123` nhận được tín hiệu và tự động vẽ lại màn hình tức thì.

#### LUỒNG 6: Nhắn tin & Trao đổi (Communication Flow)
- **Chat trong Task (Task Discussion):**
  - User gửi bình luận ➡️ Lưu vào `Comment` ➡️ Phát tín hiệu Socket.IO đến room `project:{id}` ➡️ Hiện lên ngay dưới thẻ Task.
- **Chat riêng 1-1 (Direct Messaging):**
  - User A gửi tin nhắn riêng cho User B ➡️ Lưu vào `DirectMessage` ➡️ Phát tín hiệu Socket.IO trực tiếp đến room `user:{userBId}` ➡️ Màn hình User B nảy thông báo tin nhắn mới kèm icon chấm đỏ.

#### LUỒNG 7: Tự động Lưu vết Hệ thống (Audit Logging)
1. **Lắng nghe thao tác:** Tất cả các hành động TẠO / SỬA / XÓA trên Task, Project, User đều chạy qua một `AuditLogInterceptor` ở Backend.
2. **Ghi lại Snapshot:** Interceptor tự động chụp lại dữ liệu trước khi sửa (`oldValues`) và dữ liệu sau khi sửa (`newValues`).
3. **Lưu nhật ký:** Ghi 1 dòng mới vào bảng `AuditLog` chứa `userId` người thực hiện, `action` và `entityName`. Admin có thể mở trang Nhật ký hệ thống để đối soát bất cứ lúc nào.

#### LUỒNG 8: Cuộc gọi Thoại & Video Trực tiếp (WebRTC Audio/Video Call)
1. **Khởi tạo Cuộc gọi:** User A bấm nút "Gọi thoại" hoặc "Gọi Video" với User B.
2. **Bắt tay Signaling (Socket.IO):**
   - FE A phát sự kiện `call:initiate` (gửi kèm type: `AUDIO` hoặc `VIDEO`) qua Socket.IO.
   - BE chuyển tiếp tín hiệu tới User B ➡️ Màn hình User B nảy popup đổ chuông kèm nút "Nghe" / "Từ chối".
3. **Mở luồng WebRTC Peer-to-Peer:**
   - Khi User B bấm "Nghe", hai trình duyệt trao đổi các bản tin SDP Offer/Answer & ICE Candidates thông qua Socket.IO.
   - Luồng âm thanh/hình ảnh được truyền thẳng trực tiếp giữa 2 máy tính (Peer-to-Peer) đảm bảo chất lượng sắc nét, độ trễ 0ms.
4. **Lưu vết Cuộc gọi:** Khi cuộc gọi kết thúc, Backend tự động lưu 1 bản ghi vào bảng `CallLog` (gồm `callerId`, `receiverId`, `type`, `status`: COMPLETED/MISSED/REJECTED, và `duration` tính bằng số giây).

#### LUỒNG 9: Phòng họp Nhóm Trực tuyến (Group Meeting Room Flow)
1. **Tạo Phòng họp:** Host (Manager hoặc Admin) bấm nút "Tạo phòng họp" trong một Project ➡️ Đặt tên phòng họp và lấy mã `roomCode`.
2. **Mời thành viên (Socket.IO Broadcast):** BE phát thông báo `meeting:invite` tới tất cả thành viên trong Project ➡️ Nảy banner "Đang có cuộc họp nhóm: [Tên cuộc họp] - Bấm để tham gia".
3. **Kết nối đa điểm (WebRTC Mesh / SFU):** Các thành viên bấm tham gia ➡️ Kết nối luồng Audio/Video nhiều người cùng lúc ➡️ Hỗ trợ tính năng Bật/Tắt Mic/Cam, Giơ tay phát biểu (Raise hand) và Chia sẻ màn hình (Screen Share).
4. **Mô hình CSDL dự kiến:** Bảng `MeetingRoom` và `MeetingParticipant`.

#### LUỒNG 10: Thông báo Hệ thống Thời gian thực (In-App Notification Flow)
1. **Bắt sự kiện kích hoạt:** Hệ thống tự động sinh thông báo khi:
   - Được giao Task mới (`TASK_ASSIGNED`).
   - Được nhắc tên trong bình luận (`@mention`).
   - Có cuộc gọi nhỡ hoặc lời mời vào Phòng họp (`CALL_MISSED`, `MEETING_INVITE`).
   - Task sắp đến hạn chót (`DUE_DATE_REMINDER`).
2. **Bắn thông báo tức thì:** BE ghi 1 bản ghi vào bảng `Notification` ➡️ Đồng thời phát sự kiện `notification:new` qua Socket.IO tới `user:{userId}`.
3. **Hiển thị trên giao diện:** Icon Quả chuông trên thanh Navigation của User nảy số đỏ + phát âm thanh thông báo ➡️ User click vào để mở danh sách và chuyển nhanh tới Task/Phòng họp tương ứng.

#### LUỒNG 11: Hàng chờ Công việc Cá nhân & Tự động Ưu tiên Khẩn cấp (My Personal Task Queue & Urgent Auto-Insertion)
1. **Chế độ Tập trung Cá nhân (My Focus Queue View):**
   - Cho phép nhân viên lọc duy nhất các Task được gán cho chính mình (`assigneeId = currentUser.id`).
   - Phân chia giao diện thành 2 phần:
     - **Thẻ Đang làm (Currently Active Task):** Duy nhất 1 Task có `status = IN_PROGRESS`.
     - **Hàng chờ Pending (Pending Queue):** Danh sách các Task `TODO` đang chờ xử lý tiếp theo.
2. **Thuật toán Tự động Chèn Task Khẩn cấp (`URGENT`):**
   - Khi có Task mới giao hoặc Task tạo qua Giọng nói được gắn nhãn `URGENT` ➡️ Hệ thống tự động chèn Task này vào **vị trí số 1 đầu danh sách Hàng chờ Pending** (ngay sau Task đang làm dở).
   - Các Task có độ ưu tiên bình thường (`HIGH`, `MEDIUM`, `LOW`) sẽ xếp sau và ưu tiên theo Hạn chót (`dueDate`).
3. **Chuyển đổi Linh hoạt (Dual View Switch):**
   - Cho phép User bấm nút chuyển đổi giữa **Bảng Kanban Tổng quan cả Team** và **Hàng chờ Tập trung Cá nhân**.

---

## ⚙️ PHẦN 3: ĐỀ XUẤT THIẾT KẾ: CƠ CHẾ TIẾN TRÌNH DỰ ÁN VÀ PHÂN CÔNG PHÒNG BAN (PROJECT PROCESS PIPELINE)

Tài liệu này đề xuất các phương án hiện thực hóa ý tưởng "Chia dự án thành nhiều Tiến trình / Giai đoạn (Process Stages) và phân công các Phòng ban thực hiện từng Task trong Tiến trình".

---

### 1. Ý Tưởng Cốt Lõi
Trong một dự án thực tế, công việc không diễn ra hỗn loạn mà đi theo **Quy trình Tiến trình (Pipeline Process)**. 
Ví dụ một dự án phối hợp giữa phòng **Product** và phòng **Client**:
- **Tiến trình 1 (Phân tích & Thiết kế):** Phòng `Product` chủ trì làm các Task thiết kế giao diện & mô tả chức năng.
- **Tiến trình 2 (Lập trình & Phát triển):** Đội ngũ Dev/Technical thực thi các Task Backend/Frontend.
- **Tiến trình 3 (Nghiệm thu & Bàn giao):** Phòng `Client` thực hiện các Task kiểm thử chấp nhận (UAT) và nghiệm thu.

---

### 2. 3 Phương Án Thiết Kế Kiến Trúc

#### 🌟 PHƯƠNG ÁN 1 (KHUYÊN DÙNG): Mô hình Giai đoạn Tiến trình (Process Stages & Department Swimlanes)
- **Mô hình CSDL:**
  - **Tạo bảng `ProjectStage` (Giai đoạn Tiến trình):**
    - `id`: String (UUID)
    - `projectId`: String (Liên kết dự án)
    - `name`: String (Tên tiến trình: "Giai đoạn 1: Phân tích", "Giai đoạn 2: Lập trình"...)
    - `orderIndex`: Int (Thứ tự tiến trình: 1, 2, 3...)
    - `status`: Enum (`LOCKED`, `IN_PROGRESS`, `COMPLETED`)
    - `departmentId`: String (Phòng ban chủ trì tiến trình này)
  - **Bổ sung vào bảng `Task`:** Thêm cột `stageId` (Task thuộc Tiến trình nào).

- **Trải nghiệm Giao diện (UX):**
  - Màn hình Kanban hỗ trợ **Công tắc chuyển góc nhìn (View Mode Switcher)**:
    1. *Góc nhìn Trạng thái:* Xem theo cột truyền thống (`TODO` ➡️ `IN_PROGRESS` ➡️ `DONE`).
    2. *Góc nhìn Tiến trình (Pipeline View):* Xem theo cột Tiến trình (`Giai đoạn 1` ➡️ `Giai đoạn 2` ➡️ `Giai đoạn 3`). Khi Giai đoạn 1 hoàn thành 100% Task ➡️ Giai đoạn 2 tự động mở khóa (`UNLOCKED`)!

#### PHƯƠNG ÁN 2: Mô hình Task Phụ thuộc (Task Dependencies & Workflow Gates)
- **Mô hình CSDL:** Tạo bảng `TaskDependency` (`prerequisiteTaskId`, `dependentTaskId`).
- **Cơ chế:** Task của Tiến trình sau bị khóa (LOCKED) cho tới khi các Task của Tiến trình trước hoàn thành.
- **Ưu điểm:** Rất linh hoạt tới từng thẻ Task cá nhân.

#### PHƯƠNG ÁN 3: Mô hình Cột mốc & Luồng bơi Phòng ban (Milestone & Department Swimlanes)
- **Mô hình CSDL:** Tạo bảng `Milestone` kết hợp hiển thị các hàng bơi ngang (Swimlanes) đại diện cho từng Phòng ban (`Product`, `Client`...).
- **Cơ chế:** Giao diện chia thành các hàng ngang theo từng Phòng ban. Task di chuyển từ trái sang phải theo Tiến trình.

---

### 3. Đề Xuất Thực Hiện
Khuyên dùng **Phương án 1** vì kết hợp hoàn hảo với Bảng `ProjectDepartment` (Dự án thuộc nhiều phòng ban) và Bảng `Department` mà chúng ta đã xây dựng trong CSDL Prisma!

---

## 🛡️ PHẦN 4: MA TRẬN ĐÁNH GIÁ NGUY CƠ TIỀM ẨN & PHƯƠNG ÁN PHÒNG NGỪA (RISK ASSESSMENT & MITIGATION)

| Nhóm Nguy Cơ | Rủi Ro Tiềm Ẩn | Mức Độ | Phương Án Phòng Ngừa & Giải Quyết (Mitigation) |
|---|---|:---:|---|
| **1. Voice & Speech** | • Môi trường ồn ào nhận diện sai từ.<br>• Giọng khàn/ốm làm lệch Voiceprint.<br>• Trình duyệt Firefox/Safari không hỗ trợ Speech API. | **TRUNG BÌNH** | • Cài đặt ngưỡng lọc ồn (`noise gate`).<br>• Luôn có nút **Hoàn tác (Undo 5s)** hoặc Popup xác nhận.<br>• Hỗ trợ ghi lại mẫu giọng tại `/profile` và cho phép fallback chấm công mã PIN.<br>• Cảnh báo đề xuất Chrome/Edge. |
| **2. AI LLM / Ollama** | • Ollama chưa bật hoặc máy yếu gây trễ (Lag).<br>• Người dùng nói lộn xộn sinh JSON lỗi. | **CAO** | • **Cơ chế Hybrid Fallback:** Nếu Ollama timeout $> 1.5s$ ➡️ Tự động lùi về Regex Parser siêu tốc.<br>• Dùng model nhẹ tối ưu `qwen2.5:3b` / `llama3.2:1b`.<br>• System Prompt `format: "json"` kèm kiểm tra trường thiếu tự gán `currentUser`. |
| **3. Realtime & CSDL** | • Tranh chấp ghi đồng thời (Race condition).<br>• Mất kết nối Socket.IO. | **TRUNG BÌNH** | • Bọc toàn bộ cập nhật đa bảng trong `prisma.$transaction`.<br>• Cấu hình Auto-reconnect Socket.IO kèm refresh tự động khi có mạng. |
| **4. Trải Nghiệm (UX)** | • Người dùng không biết nói câu lệnh gì.<br>• Thu âm nhầm chuyện riêng tư ngoài đời. | **THẤP** | • Đặt sẵn các thẻ Quick Command Pills và bảng hướng dẫn mẫu câu.<br>• Thu âm có chủ đích (Chỉ bật khi mở Modal hoặc Push-to-Talk). |
| **5. Nguyên Tắc Cốt Lõi** | *"Voice là công cụ tăng tốc, nhưng Chuột & Phím luôn là điểm tựa vững chắc."* | **QUY TẮC** | • **Graceful Degradation:** Hệ thống luôn hoạt động bình thường 100% bằng tay kể cả khi mất Micro hoặc tắt AI. |

