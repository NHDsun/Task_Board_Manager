# SƠ ĐỒ TOÀN BỘ CÁC LUỒNG HOẠT ĐỘNG VÀ SỰ LIÊN KẾT TRONG HỆ THỐNG

Tài liệu này mô tả chi tiết tất cả 7 luồng nghiệp vụ (Business Flows) và cách các thành phần trong hệ thống (Frontend, Backend, Database, Socket.IO) liên kết chặt chẽ với nhau.

---

## 🗺 1. Sơ đồ Ma trận Liên kết Bảng CSDL (ERD Relationships)

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

## 🔄 2. Chi tiết 7 Luồng Nghiệp vụ Cốt lõi

### LUỒNG 1: Phân quyền & Xác thực (Authentication & RBAC)
1. **Đăng nhập:** User nhập Email/Pass ➡️ FE gửi `POST /auth/login` ➡️ BE mã hóa Bcrypt kiểm tra ➡️ BE trả về `accessToken` (JWT).
2. **Lưu Token:** FE lưu Token vào `localStorage` và tự động gắn vào Header `Authorization: Bearer <token>` cho mọi request sau đó.
3. **Phân quyền (Guards):** Khi FE gọi API ➡️ BE chạy `JwtAuthGuard` và `RolesGuard`:
   - `Role.ADMIN`: Toàn quyền trên mọi API.
   - `Role.MANAGER`: Tạo/Quản lý dự án của mình, thêm bớt nhân viên.
   - `Role.EMPLOYEE`: Chỉ thao tác trên các Task được giao hoặc trong Project được thêm vào.

---

### LUỒNG 2: Quản lý Liên Phòng ban & Dự án (Multi-Department Projects)
1. **Tạo Phòng ban:** Admin tạo danh mục `Department` (Ví dụ: Dev, Tester, Marketing).
2. **Gán Phòng ban:** Admin gán mỗi `User` vào 1 `Department`.
3. **Khởi tạo Dự án:** Manager tạo `Project` và chọn **Nhiều Phòng ban** cùng phối hợp ➡️ Hệ thống tự động chèn dữ liệu vào bảng trung gian `ProjectDepartment`.
4. **Thêm nhân sự:** Manager thêm các `User` thuộc các phòng ban đó vào `ProjectMember`.

---

### LUỒNG 3: Vòng đời Công việc trên Bảng Kanban (Task Lifecycle)
1. **Tạo Task:** User bấm tạo Task ➡️ Lưu vào `Task` (Status: `TODO`).
2. **Gán nhãn & Đầu việc nhỏ:** 
   - Thêm nhãn màu ➡️ Lưu vào `TaskTag` ➡️ Nối với `Tag`.
   - Thêm checklist ➡️ Lưu vào `Subtask` (Trạng thái completed: `true/false`).
3. **Kéo-thả trạng thái:** User kéo thẻ từ *To Do* sang *In Progress* hoặc *Done* ➡️ FE chạy **Optimistic Update** (đổi giao diện ngay) ➡️ Gửi API `PATCH /tasks/:id/status` ➡️ BE cập nhật `status` trong DB.
4. **Dọn bảng (Archive):** Manager bấm "Dọn bảng" ➡️ BE chạy Transaction chuyển tất cả Task có `status = DONE` thành `isArchived = true`. Task sẽ ẩn khỏi Kanban nhưng vẫn phục vụ báo cáo Dashboard.

---

### LUỒNG 4: Điều khiển & Nhập liệu Giọng nói (Smart Voice Command)
1. **Thu âm:** User bấm Micro ➡️ **Web Speech API** trên trình duyệt thu âm và dịch giọng nói tiếng Việt thành đoạn văn bản.
2. **Gửi câu lệnh:** FE gửi đoạn văn bản sang API `POST /tasks/voice-command`.
3. **Phân tích cú pháp (Intent Parser):** Backend quét từ khóa:
   - Trích xuất **Tiêu đề** (Title).
   - Trích xuất **Hạn chót** (DueDate) từ các từ như *"chiều nay"*, *"ngày mai"*.
   - Trích xuất **Độ ưu tiên** (Priority) từ các từ như *"gấp"*, *"khẩn cấp"*.
4. **Auto-Assign & Undo:** Task được tự động gán cho chính User đang nói (`assigneeId = currentUser`). FE hiển thị thông báo popup kèm nút **Undo (Hoàn tác) trong 10 giây**.

---

### LUỒNG 5: Đồng bộ Thời gian thực (Socket.IO Real-time)
1. **Kết nối:** Ngay khi Đăng nhập, FE kết nối với `Socket.IO Gateway` của BE và tham gia (Join) vào các room: `project:{projectId}` và `user:{userId}`.
2. **Phát sóng (Broadcast):** Khi có bất kỳ thao tác nào làm đổi dữ liệu (Kéo task, tạo comment, chat 1-1):
   - BE thực hiện lưu DB xong.
   - BE phát tín hiệu `socket.to("project:123").emit("task:updated", data)`.
3. **Cập nhật màn hình:** Tất cả các máy tính khác trong room `project:123` nhận được tín hiệu và tự động vẽ lại màn hình tức thì.

---

### LUỒNG 6: Nhắn tin & Trao đổi (Communication Flow)
- **Chat trong Task (Task Discussion):**
  - User gửi bình luận ➡️ Lưu vào `Comment` ➡️ Phát tín hiệu Socket.IO đến room `project:{id}` ➡️ Hiện lên ngay dưới thẻ Task.
- **Chat riêng 1-1 (Direct Messaging):**
  - User A gửi tin nhắn riêng cho User B ➡️ Lưu vào `DirectMessage` ➡️ Phát tín hiệu Socket.IO trực tiếp đến room `user:{userBId}` ➡️ Màn hình User B nảy thông báo tin nhắn mới kèm icon chấm đỏ.

---

### LUỒNG 7: Tự động Lưu vết Hệ thống (Audit Logging)
1. **Lắng nghe thao tác:** Tất cả các hành động TẠO / SỬA / XÓA trên Task, Project, User đều chạy qua một `AuditLogInterceptor` ở Backend.
2. **Ghi lại Snapshot:** Interceptor tự động chụp lại dữ liệu trước khi sửa (`oldValues`) và dữ liệu sau khi sửa (`newValues`).
3. **Lưu nhật ký:** Ghi 1 dòng mới vào bảng `AuditLog` chứa `userId` người thực hiện, `action` và `entityName`. Admin có thể mở trang Nhật ký hệ thống để đối soát bất cứ lúc nào.

---

### LUỒNG 8: Cuộc gọi Thoại & Video Trực tiếp (WebRTC Audio/Video Call)
1. **Khởi tạo Cuộc gọi:** User A bấm nút "Gọi thoại" hoặc "Gọi Video" với User B.
2. **Bắt tay Signaling (Socket.IO):**
   - FE A phát sự kiện `call:initiate` (gửi kèm type: `AUDIO` hoặc `VIDEO`) qua Socket.IO.
   - BE chuyển tiếp tín hiệu tới User B ➡️ Màn hình User B nảy popup đổ chuông kèm nút "Nghe" / "Từ chối".
3. **Mở luồng WebRTC Peer-to-Peer:**
   - Khi User B bấm "Nghe", hai trình duyệt trao đổi các bản tin SDP Offer/Answer & ICE Candidates thông qua Socket.IO.
   - Luồng âm thanh/hình ảnh được truyền thẳng trực tiếp giữa 2 máy tính (Peer-to-Peer) đảm bảo chất lượng sắc nét, độ trễ 0ms.
4. **Lưu vết Cuộc gọi:** Khi cuộc gọi kết thúc, Backend tự động lưu 1 bản ghi vào bảng `CallLog` (gồm `callerId`, `receiverId`, `type`, `status`: COMPLETED/MISSED/REJECTED, và `duration` tính bằng số giây).

---

### LUỒNG 9: Phòng họp Nhóm Trực tuyến (Group Meeting Room Flow)
1. **Tạo Phòng họp:** Host (Manager hoặc Admin) bấm nút "Tạo phòng họp" trong một Project ➡️ Đặt tên phòng họp và lấy mã `roomCode`.
2. **Mời thành viên (Socket.IO Broadcast):** BE phát thông báo `meeting:invite` tới tất cả thành viên trong Project ➡️ Nảy banner "Đang có cuộc họp nhóm: [Tên cuộc họp] - Bấm để tham gia".
3. **Kết nối đa điểm (WebRTC Mesh / SFU):** Các thành viên bấm tham gia ➡️ Kết nối luồng Audio/Video nhiều người cùng lúc ➡️ Hỗ trợ tính năng Bật/Tắt Mic/Cam, Giơ tay phát biểu (Raise hand) và Chia sẻ màn hình (Screen Share).
4. **Mô hình CSDL dự kiến:** Bảng `MeetingRoom` và `MeetingParticipant`.

---

### LUỒNG 10: Thông báo Hệ thống Thời gian thực (In-App Notification Flow)
1. **Bắt sự kiện kích hoạt:** Hệ thống tự động sinh thông báo khi:
   - Được giao Task mới (`TASK_ASSIGNED`).
   - Được nhắc tên trong bình luận (`@mention`).
   - Có cuộc gọi nhỡ hoặc lời mời vào Phòng họp (`CALL_MISSED`, `MEETING_INVITE`).
   - Task sắp đến hạn chót (`DUE_DATE_REMINDER`).
2. **Bắn thông báo tức thì:** BE ghi 1 bản ghi vào bảng `Notification` ➡️ Đồng thời phát sự kiện `notification:new` qua Socket.IO tới `user:{userId}`.
3. **Hiển thị trên giao diện:** Icon Quả chuông trên thanh Navigation của User nảy số đỏ + phát âm thanh thông báo ➡️ User click vào để mở danh sách và chuyển nhanh tới Task/Phòng họp tương ứng.
