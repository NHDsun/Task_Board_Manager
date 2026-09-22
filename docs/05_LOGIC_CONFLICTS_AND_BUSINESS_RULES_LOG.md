# 🛡️ 05. NHẬT KÝ XỬ LÝ XUNG ĐỘT LOGIC & QUY TẮC NGHIỆP VỤ (LOGIC CONFLICTS & BUSINESS RULES LOG)

Tài liệu này là **nơi ghi nhận chính thức và duy nhất** cho toàn bộ các **Luồng Xung Đột Logic (Logic Conflicts), Điểm Nghẽn Nghiệp Vụ (Deadlocks/Race Conditions) và Quy Tắc Ràng Buộc (Business Constraints)** trong dự án Task Board Manager.

> [!IMPORTANT]
> **QUY TẮC BẮT BUỘC TỪ NAY VỀ SAU**:
> Mỗi khi phát hiện, xử lý hoặc tối ưu hóa bất kỳ Luồng Logic Conflict nào, **BẮT BUỘC PHẢI GHI NHẬN CHI TIẾT** vào tài liệu này theo đúng định dạng chuẩn dưới đây trước khi bàn giao.

---

## 📑 MỤC LỤC TỔNG QUAN & PHÂN BỔ NHÓM LOGIC CONFLICTS

- [1. Quy Chuẩn Đánh Giá & Phân Loại Conflict](#1-quy-chuẩn-đánh-giá--phân-loại-conflict)
- [2. Danh Sách Các Logic Conflict ĐÃ XỬ LÝ TRIỆT ĐỂ (171 Resolved Logic Cases & 27 Concurrency Cases)](#2-danh-sách-các-logic-conflict-đã-xử-lý-triệt-để-resolved-conflicts)
  - **Nhóm I: Vòng Đời Task & Quy Trình Phê Duyệt Subtask (LC-01 -> LC-35)**
    - LC-01: Tự động duyệt cho Quản lý (Self-Approval Flow)
    - LC-02: Quyền mở lại việc con đã duyệt nhầm (Reopen Subtask Flow)
    - LC-03: Gửi duyệt lại khi bị từ chối (Resubmit Subtask Flow)
    - LC-04: Tự động đồng bộ & co giãn Deadline tổng (Dynamic DueDate Sync)
    - LC-05: Dọn dẹp yêu cầu duyệt treo khi chuyển giao Task
    - LC-06: Chống giật nhấp nháy tiến độ Optimistic UI
    - LC-07: Ràng buộc bắt buộc phân công trước khi thực hiện
    - LC-08: Chặn lách duyệt bằng kéo thả sang DONE
    - LC-09: Tự động chuyển trạng thái DONE & IN_PROGRESS khi đạt 100%
    - LC-10: Đóng băng thao tác khi Task PAUSED / BLOCKED
    - LC-11 -> LC-35: Các ràng buộc chi tiết về Subtasks, Deadlines, Tags và Tiến độ
  - **Nhóm II: Chuyển Giao, Hỗ Trợ & Hoạt Động (LC-36 -> LC-65)**
    - LC-36 -> LC-40: Hủy, Chấp thuận, Từ chối đơn chuyển giao / hỗ trợ
    - LC-41 -> LC-50: Phân quyền cập nhật dự án, khóa task con hoàn thành, chống chuyển giao task đóng
    - LC-51 -> LC-65: Khóa xóa việc con đã nghiệm thu, phân quyền tải file, Activity History
  - **Nhóm III: Phân Quyền, Thùng Rác 14 Ngày & Tự Động Hóa (LC-66 -> LC-98)**
    - LC-66 -> LC-89: Kiểm tra thành viên dự án, khử trùng lặp tags, cảnh báo hạn chót, chống thông báo rác
    - LC-90: Xóa dự án dành riêng cho Admin
    - LC-91: Chuẩn hóa trung tâm Thùng Rác 14 ngày
    - LC-92 [CC-01]: Tự động khôi phục Dự án cha khi khôi phục Task mồ côi
    - LC-93 [CC-02]: Tự động hủy dữ liệu quá hạn 14 ngày (Auto-Purge)
    - LC-94 [CC-03]: Tự động hạ cờ URGENT khi xóa / hoàn thành task con khẩn cấp
    - LC-95 [CC-04]: Phòng thủ Not-Found khi nhấp thông báo task đã bị xóa
    - LC-96 [CC-05]: Chống Race Condition & Idempotent Guard xóa/khôi phục
    - LC-97 [CC-06]: Phân trang thông báo & Tự động dọn dẹp sau 30 ngày
    - LC-98 [CC-07]: Phòng thủ thời gian âm & Huy hiệu quá hạn Thùng rác
  - **Nhóm IV: Ma Trận 20 Trường Hợp Thành Viên Tự Tạo Task Con (LC-99 / CC-08 -> CC-27)**
    - CC-08 -> CC-27: Xử lý 20 kịch bản biên khi nhân viên tự tạo Minitask
  - **Nhóm V: Kiến Trúc Hệ Thống, Bảo Mật, Lịch Trình & Type-Safety (LC-100 -> LC-171)**
    - LC-100: Chặn trùng tên dự án không phân biệt hoa thường
    - LC-101: Tự động cấp quyền MANAGER khi bổ nhiệm Quản lý dự án
    - LC-102: Quy trình 2 bước Khóa & Xóa tài khoản nhân sự
    - LC-103: Bảo vệ CSDL PostgreSQL chống mất dữ liệu tự động
    - LC-104: Xác thực JWT & Cô lập Room WebSocket Gateway
    - LC-105: Đồng bộ vai trò động trong phiên làm việc JWT
    - LC-106: Khắc phục sai số thống kê năng suất cá nhân
    - LC-107: Phân quyền kéo thả Kanban cho Quản lý dự án
    - LC-108: Chống rò rỉ bộ nhớ Idempotency Cache
    - LC-109: Đồng bộ Phòng ban & Dự án thực tế trong Hồ sơ cá nhân
    - LC-110: Tự động sinh lịch làm việc theo dải ngày khi duyệt đơn nghỉ phép
    - LC-111: Chuẩn hóa Type-Safety (AuthUserPayload) & Sanitize File Uploads
    - LC-112: Tích hợp thống nhất quản lý Lịch trình & Đơn từ
    - LC-113: Chống lệch múi giờ UTC khi chọn ngày lịch trình (GMT+7)
    - LC-114: Kiểm soát trùng lặp khoảng thời gian đơn xin nghỉ & Quy trình hủy đơn an toàn
    - LC-115: Tự động hủy yêu cầu chuyển giao & hỗ trợ đang treo khi xóa thành viên khỏi dự án
    - LC-116: Khóa chặn Quản trị viên tự hạ cấp vai trò Admin của chính mình
    - LC-117: Loại bỏ Task trong thùng rác & lưu trữ khỏi báo cáo năng suất phòng ban
    - LC-118: Kiểm tra trùng tên & mã phòng ban toàn diện (Case-Insensitive)
    - LC-119: Tự động nhận diện @Mention trong bình luận & Gửi thông báo nhắc tên thành viên dự án
    - LC-120: Tự động sinh chu kỳ công việc định kỳ (Recurring Task Auto-Generation)
    - LC-121 -> LC-150: Các chốt chặn toàn diện về bảo mật JWT, lịch trình WFH, thùng rác nguyên tố và Type Safety
    - LC-151 -> LC-160: Kiểm soát chuyển giao gán thừa, đóng băng Task đã lưu trữ/thùng rác, và an toàn đa luồng CSDL
    - LC-161 -> LC-170: Khóa bình luận Task đóng/lưu trữ, giới hạn độ dài comment, và kiểm soát thành viên bị khóa tài khoản
    - LC-171: Đặc quyền Admin Nghiệm Thu & Xác Nhận Hoàn Thành Dự Án Khi Roadmap Đạt 100%
- [3. Danh Mục Các Conflict Đang Tiếp Tục Theo Dõi (Backlog Conflicts)](#3-danh-mục-các-conflict-đang-tiếp-tục-theo-dõi--tối-ưu-hóa-backlog-conflicts)

---

## 1. QUY CHUẨN ĐÁNH GIÁ & PHÂN LOẠI CONFLICT

Mỗi lỗi xung đột logic được phân loại theo 4 cấp độ nghiêm trọng:
- 🔴 **CRITICAL (Nghiêm trọng)**: Gây sập luồng, bế tắc (deadlock), gian lận tiến độ, lách quyền duyệt (bypass), hoặc sai lệch tính toán dữ liệu tài chính/thời gian.
- 🟡 **HIGH (Cao)**: Gây sai lệch trạng thái hiển thị, spam dữ liệu rác, nhầm lẫn trách nhiệm giữa các nhân sự.
- 🔵 **MEDIUM (Trung bình)**: Trải nghiệm người dùng bị giật nhấp nháy, thiếu thông tin giải thích nguyên nhân.
- 🟢 **LOW (Nhẹ)**: Cải tiến tinh chỉnh nhỏ về mặt giao diện và phản hồi tức thì.

---

## 2. DANH SÁCH CÁC LOGIC CONFLICT ĐÃ XỬ LÝ TRIỆT ĐỂ (RESOLVED CONFLICTS)

---

### [LC-01] Tự Động Duyệt Cho Quản Lý (Self-Approval Flow)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Khi Project Manager hoặc Admin tự nhận làm Task của mình, khi họ tick việc con thì hệ thống lại tạo một `TaskRequest` chờ duyệt và gửi chuông thông báo cho chính họ duyệt bản thân.
* **Hậu quả:** Gây tắc nghẽn vô lý, Manager không thể tự đánh dấu hoàn thành nhanh mà phải tự gửi thư rồi tự mở hộp thư duyệt cho chính mình.
* **Giải pháp kỹ thuật:** 
  - Trong `updateSubtask`: Kiểm tra `isAdminOrManager && isWorkerDoingTask`.
  - Nếu thỏa mãn, hệ thống tự động gán ngay `isDone = true, approvalStatus = 'APPROVED'`, bỏ qua bước tạo TaskRequest và không phát sinh thông báo chuông dư thừa.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`, `fe/src/components/kanban/TaskDetailModal.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-02] Quyền Mở Lại Việc Con Đã Duyệt Nhầm (Reopen Subtask Flow)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Khi việc con đã hoàn thành (`isDone: true`), hệ thống khóa mờ hoàn toàn. Nếu Quản lý vô tình bấm duyệt nhầm hoặc sau đó phát hiện lỗi, không có bất kỳ cách nào để thu hồi phê duyệt.
* **Hậu quả:** Dữ liệu hoàn thành bị khóa vĩnh viễn, nhân viên không thể sửa lại sai sót.
* **Giải pháp kỹ thuật:**
  - Bổ sung hành động `action: 'REOPEN'` trong API `reviewSubtask` phía Backend (chỉ Admin/Manager có quyền gọi).
  - Khôi phục `isDone = false, approvalStatus = 'NONE'`, lưu lý do mở lại vào `rejectionReason`.
  - Gọi `recalculateTaskProgress` tự động giảm % tiến độ Task tương ứng.
  - Phía Frontend: Bổ sung nút **`[↩️ Mở Lại]`** trong Modal chi tiết cho Cấp Quản lý.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`, `fe/src/components/kanban/TaskDetailModal.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-03] Gửi Duyệt Lại Khi Bị Từ Chối (Resubmit Subtask Flow)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Khi việc con bị Quản lý từ chối (`REJECTED`), trạng thái bị treo ở mức chưa đạt và không có nút rõ ràng để nhân viên gửi lại yêu cầu duyệt lần 2 sau khi sửa bài.
* **Hậu quả:** Nhân viên bối rối không biết làm sao để báo cho Quản lý biết mình đã sửa xong bài.
* **Giải pháp kỹ thuật:**
  - Bổ sung nút **`[🔄 Gửi Duyệt Lại]`** trên thẻ Kanban, Hero Cockpit và Modal chi tiết.
  - Khi bấm, hệ thống xóa lý do từ chối cũ và chuyển trạng thái về `PENDING`, bắn thông báo Realtime yêu cầu Quản lý thẩm định lại.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`, `fe/src/components/kanban/KanbanCard.tsx`, `fe/src/components/kanban/TaskDetailModal.tsx`, `fe/src/pages/BoardPage.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-04] Tự Động Đồng Bộ & Co Giãn Deadline Tổng (Dynamic DueDate Sync)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Khi thêm, xóa hoặc sửa số ngày của các việc con, hạn chót tổng của Task (`task.dueDate`) trên cơ sở dữ liệu không tự động cập nhật, dẫn đến việc Task hiển thị hạn chót cũ không khớp với tổng số ngày lịch trình.
* **Hậu quả:** Báo cáo trễ hạn bị sai lệch, deadline của Task bị mâu thuẫn với timeline của subtask.
* **Giải pháp kỹ thuật:**
  - Trong `recalculateTaskProgress`, hệ thống tính tổng số ngày `totalEstimatedDays = sum(subtask.estimatedDays)`.
  - Tự động gán: `task.dueDate = startDate + totalEstimatedDays` và cập nhật trực tiếp vào PostgreSQL.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-05] Dọn Dẹp Yêu Cầu Duyệt Treo Khi Chuyển Giao Task (Task Transfer Cleanup)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Nhân viên A đang nộp duyệt 1 việc con (đang `PENDING`). Trong lúc đó, Task được chuyển giao sang Nhân viên B. Nếu Quản lý bấm duyệt sau đó, thành tích hoàn thành có thể bị tính nhầm cho Nhân viên B hoặc gây tranh chấp quyền sở hữu.
* **Hậu quả:** Sai lệch lịch sử đóng góp và tính minh bạch của công việc.
* **Giải pháp kỹ thuật:**
  - Trong `respondToRequest` khi yêu cầu chuyển giao được chấp thuận (`APPROVED`), hệ thống tự động quét và hủy toàn bộ các `TaskRequest` duyệt subtask cũ (`REJECTED` kèm lý do chuyển giao), reset subtasks về `approvalStatus = 'NONE'`.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-06] Chống Giật Nhấp Nháy Tiến Độ Khi Nhân Viên Nộp Duyệt (Optimistic UI Progress Lock)
* **Mức độ:** 🔵 **MEDIUM**
* **Vấn đề (Root Cause):** Cơ chế Optimistic UI cũ tự động tick xanh và tăng % tiến độ lên 100% ngay khi nhân viên click, sau đó khi nhận phản hồi từ server (đang chờ duyệt) thì thanh tiến độ lại bị tụt lùi về giá trị cũ.
* **Hậu quả:** Giao diện bị giật nhấp nháy, gây cảm giác lag và hiểu lầm là task đã hoàn thành.
* **Giải pháp kỹ thuật:**
  - Tinh chỉnh Optimistic Update trong `BoardPage.tsx` và `TaskDetailModal.tsx`: Đối với nhân viên thông thường, click tick việc con chỉ chuyển trạng thái sang `PENDING` (chờ duyệt), giữ nguyên % tiến độ cho đến khi Quản lý duyệt chính thức.
* **File ảnh hưởng:** `fe/src/pages/BoardPage.tsx`, `fe/src/components/kanban/TaskDetailModal.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-07] Ràng Buộc Bắt Buộc Phân Công Task Trước Khi Thực Hiện (Unassigned Task Freeze)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Task mới tạo chưa gán người phụ trách (`assigneeId = null`), nhưng thành viên bất kỳ vẫn có thể vào bấm tick việc con.
* **Hậu quả:** Gây ra các việc con "vô chủ", không thể xác định người chịu trách nhiệm và không biết gửi yêu cầu duyệt tới ai.
* **Giải pháp kỹ thuật:**
  - Phía Backend: Ném ngoại lệ `400 Bad Request: Nhiệm vụ này chưa được chỉ định người làm. Vui lòng phân công nhân sự trước khi thực hiện.`
  - Phía Frontend: Hiển thị badge `🔒 Chưa phân công nhân sự` và vô hiệu hóa nút tick.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`, `fe/src/components/kanban/KanbanCard.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-08] Chặn Lách Duyệt Bằng Kéo Thả Thẻ Kanban Sang DONE (Kanban DONE Drag Block)
* **Mức độ:** 🔴 **CRITICAL (Bypass Vulnerability)**
* **Vấn đề (Root Cause):** Dù việc con được khóa duyệt rất chặt, nhân viên vẫn có thể dùng chuột kéo thả trực tiếp thẻ Task sang cột `DONE` trên Kanban. Khi đó `updateStatus` ép `progress = 100%`, lách qua toàn bộ quy trình duyệt subtask.
* **Hậu quả:** Nhân viên có thể hoàn thành task gian lận mà không cần làm bất kỳ việc con nào.
* **Giải pháp kỹ thuật:**
  - Backend: Trong `updateStatus`, nếu chuyển sang `DONE` mà `task.subtasks.some(st => !st.isDone)` ➔ Ném ngoại lệ `400 Bad Request`.
  - Frontend: Trong `handleDragEnd`, nếu kéo thẻ có subtask chưa duyệt vào cột `DONE` ➔ Hủy thao tác kéo và hiện cảnh báo: `⚠️ Không thể chuyển sang Hoàn Thành khi còn X việc con chưa được Quản lý phê duyệt.`
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`, `fe/src/pages/BoardPage.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-09] Tự Động Chuyển Trạng Thái DONE & IN_PROGRESS Khi Đạt 100% (Auto Status Sync)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Khi Quản lý duyệt việc con cuối cùng khiến tiến độ đạt 100%, thẻ Task vẫn nằm ở cột `IN_PROGRESS` nếu không có ai kéo thả thủ công. Ngược lại khi mở lại việc con (tiến độ tụt về < 100%), thẻ vẫn nằm ở cột `DONE`.
* **Hậu quả:** Trạng thái cột Kanban mâu thuẫn trực tiếp với % tiến độ hiển thị trên thẻ.
* **Giải pháp kỹ thuật:**
  - Trong `recalculateTaskProgress`:
    - Khi `newProgress === 100` và `task.status !== 'DONE'`: Tự động cập nhật `status = 'DONE', completedAt = now()`.
    - Khi `newProgress < 100` và `task.status === 'DONE'`: Tự động cập nhật `status = 'IN_PROGRESS', completedAt = null`.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-10] Đóng Băng Thao Tác Subtask Khi Task Đang PAUSED / BLOCKED (State Freeze)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Khi Task bị tạm dừng (`PAUSED`) hoặc bị nghẽn (`BLOCKED`), nhân viên vẫn có thể bấm `[✓ Xong Việc Hôm Nay]` để nộp duyệt bình thường.
* **Hậu quả:** Quy trình tạm dừng bị vô hiệu hóa, nhân viên vẫn làm tiếp các phần việc đang bị đình chỉ.
* **Giải pháp kỹ thuật:**
  - Backend: Chặn nộp bài nếu `task.status === 'PAUSED' || task.status === 'BLOCKED'`.
  - Frontend: Vô hiệu hóa nút tick và hiển thị thông báo rõ ràng cho nhân viên.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`, `fe/src/pages/BoardPage.tsx`, `fe/src/components/kanban/KanbanCard.tsx`, `fe/src/components/kanban/TaskDetailModal.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-11] Loại Bỏ Thông Báo Ma Cho Task Đã Bị Xóa (Ghost Notification Elimination)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Nhân viên nộp duyệt việc con, sau đó Quản lý xóa Task (`isDeleted = true`). Hàm `getIncomingRequests` vẫn lấy các request của task đã xóa, khiến badge chuông `🔔 (1 mới)` hiển thị vĩnh viễn không biến mất.
* **Hậu quả:** Gây ô nhiễm thông báo, Quản lý nhấp vào xem thông báo bị lỗi 404.
* **Giải pháp kỹ thuật:**
  - Bổ sung điều kiện `task: { isDeleted: false }` vào truy vấn Prisma trong `getIncomingRequests`.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-12] Khóa Sửa Số Ngày Ước Lượng & Phân Quyền Subtask Assignee (EstimatedDays Lock)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** 
  1. Nhân viên có thể tự ý sửa `estimatedDays` của việc con từ 1 ngày lên 30 ngày để lùi hạn chót Task.
  2. Khi việc con có người nhận riêng (`subtask.assigneeId`), người nhận Task chính vẫn có thể tick thay.
* **Hậu quả:** Gian lận thời gian làm việc và tranh chấp trách nhiệm công việc.
* **Giải pháp kỹ thuật:**
  - Khóa quyền sửa `estimatedDays`: Chỉ Admin/Manager/Creator mới được phép sửa.
  - Phân quyền ưu tiên: Nếu Subtask có `assigneeId` riêng thì **CHỈ DUY NHẤT** người đó được tick; nếu không thì Task Assignee mới được tick.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`, `fe/src/components/kanban/KanbanCard.tsx`, `fe/src/components/kanban/TaskDetailModal.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-13] Xóa Việc Con Đang Chờ Duyệt (Orphaned Subtask Approval Request Cleanup)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Nhân viên nộp duyệt việc con (tạo ra `TaskRequest` `PENDING`). Quản lý sau đó xóa việc con đó (`deleteSubtask`). `TaskRequest` cũ vẫn nằm trong CSDL khiến Quản lý bấm duyệt bị lỗi sập luồng / 404.
* **Giải pháp kỹ thuật:** Trong `deleteSubtask`, tự động cập nhật tất cả `TaskRequest` liên quan đến `subtaskId` đó thành `status = 'CANCELLED'` kèm lý do: *"Công việc con đã bị xóa khỏi hệ thống."*
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-14] Chặn Chuyển Giao Task Cho Chính Mình (Self-Transfer Block)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Trong `createTaskRequest`, nếu `senderId === receiverId`, hệ thống cho phép tạo yêu cầu chuyển giao cho chính mình, khóa task vào `IN_REVIEW` chờ tự duyệt.
* **Giải pháp kỹ thuật:** Chặn ném ngoại lệ `400 BadRequestException('Không thể gửi yêu cầu chuyển giao cho chính bản thân mình!')`.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-15] Chống Gửi Trùng Lặp Yêu Cầu Chuyển Giao (Concurrent Transfer Requests Lock)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Nhân viên có thể gửi liên tiếp nhiều yêu cầu chuyển giao cho nhiều người khác nhau trên cùng 1 task, dẫn đến tình trạng Race Condition khi nhiều người cùng bấm Accept.
* **Giải pháp kỹ thuật:** Kiểm tra nếu đã có yêu cầu `TRANSFER` đang `PENDING` trên Task đó thì chặn không cho tạo thêm request mới.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-17] Khóa Cờ Khẩn Cấp (isUrgent) Trên Việc Con Đã Xong (Finished Subtask Urgent Lock)
* **Mức độ:** 🟢 **LOW**
* **Vấn đề (Root Cause):** Việc con đã hoàn thành (`isDone: true`) nhưng người dùng vẫn bật được cờ `isUrgent: true`, làm đổi màu viền Task thành đỏ nhấp nháy dù việc đã xong.
* **Giải pháp kỹ thuật:** Chặn ném ngoại lệ `BadRequestException('Không thể thay đổi mức độ khẩn cấp của công việc con đã hoàn thành.')`.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-20] Kiểm Tra Ràng Buộc Thành Viên Khi Phân Công Task (Project Membership Assignment Constraint)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Khi tạo Task hoặc chuyển giao Task, Client có thể truyền `assigneeId` là người dùng không thuộc Dự án. Người nhận không có quyền vào Dự án để xem hay làm task.
* **Giải pháp kỹ thuật:** Kiểm tra bắt buộc `assigneeId` phải là thành viên trong bảng `project_members` hoặc là Manager/Creator của Dự án đó.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-21] Xóa Thành Viên Dự Án Chuyển Về Manager & Manager Phân Công Trực Tiếp (Member Removal & Manager Direct Assignment)
* **Mức độ:** 🔴 **CRITICAL (User Special Rule)**
* **Vấn đề (Root Cause):** 
  1. Khi Quản lý xóa một thành viên khỏi Dự án, các Task thành viên đó đang nắm giữ bị bỏ hoang không ai làm được.
  2. Chưa có giao diện trực quan để Quản lý dự án xem danh sách nhân sự, số lượng task của từng người, và bấm nút xóa nhân viên.
  3. Khi Quản lý/Admin chuyển giao/giao việc cho nhân viên, hệ thống lại bắt nhân viên phải bấm Accept/Deny, vi phạm nguyên tắc quyền điều phối của cấp quản lý.
* **Giải pháp kỹ thuật:** 
  1. **Backend**:
     - `GET /projects/:id/members`: Trả về danh sách thành viên kèm số lượng nhiệm vụ đang phụ trách (`activeTasksCount`).
     - `POST /projects/:id/members`: Cho phép Quản lý thêm nhân sự mới vào dự án.
     - `DELETE /projects/:id/members/:userId`: Xóa thành viên và **TỰ ĐỘNG CHUYỂN TOÀN BỘ TASK & SUBTASK VỀ CHO MANAGER DỰ ÁN** (`task.assigneeId = project.managerId || project.createdById`).
  2. **Frontend (`ProjectMembersModal.tsx`)**:
     - Bảng điều khiển quản lý nhân sự phong cách Solaris Glassmorphism: hiển thị Avatar, Email, Chức danh, Badge `Project Manager 👑` và số task đang làm.
     - Nút **`[❌ Xóa Khỏi Dự Án]`**: Hiển thị Popup xác nhận cảnh báo chuyển giao nhiệm vụ tự động về cho Manager.
     - Tích hợp trực tiếp vào Header dự án tại vị trí `👥 X Nhân sự (⚙️ Quản lý)`.
  3. **Quy tắc phân công trực tiếp**:
     - Trong `createTaskRequest`: Nếu người gửi là Quản lý/Admin (`isManagerOrAdmin`), hệ thống **GÁN TRỰC TIẾP NGAY LẬP TỨC** (`task.assigneeId = receiverId, task.status = 'IN_PROGRESS'`), **KHÔNG hiện nút Accept/Deny**, tạo bản ghi tự động và **CHỈ GỬI THÔNG BÁO** Realtime cho nhân sự được phân công.
* **File ảnh hưởng:** `be/src/modules/project/project.service.ts`, `be/src/modules/project/project.controller.ts`, `be/src/modules/task/task.service.ts`, `fe/src/components/kanban/ProjectMembersModal.tsx`, `fe/src/pages/BoardPage.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-22] Khóa Xóa File Đính Kèm Khi Task Đã Hoàn Thành (Tampering Completed Evidence Lock)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Sau khi Task/Subtask đã hoàn thành (`status === 'DONE'`), người dùng vẫn có thể bấm xóa file đính kèm làm mất bằng chứng nghiệm thu kiểm toán.
* **Giải pháp kỹ thuật:** Trong `deleteAttachment`, nếu `task.status === 'DONE'` ➔ Ném ngoại lệ `400 BadRequestException: "Không thể xóa tệp đính kèm của nhiệm vụ đã hoàn thành nhằm bảo vệ tính toàn vẹn dữ liệu nghiệm thu."`.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-23] Chặn Thêm Task Con Vào Task Đã Hoàn Thành (Subtask Injection on Completed Task)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Khi Task đã ở trạng thái `DONE` (100%), nếu người dùng gọi API `addSubtask`, hệ thống tạo một Task con mới (`isDone: false`). Tiến độ Task bị tụt xuống (ví dụ 80%) nhưng trạng thái Task vẫn giữ nguyên là `DONE` ➔ Tạo ra Task "Hoàn thành ảo", vi phạm tính toàn vẹn của Task Board.
* **Giải pháp kỹ thuật:** Trong `addSubtask`, kiểm tra nếu `task.status === 'DONE'` ➔ Ném ngoại lệ `400 BadRequestException('Task đã hoàn thành (DONE). Vui lòng chuyển Task về trạng thái Đang Thực Hiện (IN_PROGRESS) trước khi thêm Task con mới.')`.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-24] Hủy TaskRequest Đang Treo Khi Xóa Task (Orphaned TaskRequest on Deleted Task)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Khi Quản lý/Admin xóa một Task (`deleteTask`), Task bị đưa vào thùng rác (`isDeleted: true`). Tuy nhiên các `TaskRequest` chuyển giao/trợ giúp đang `PENDING` của Task đó vẫn tồn tại trong Hộp thư của người nhận. Khi người nhận bấm duyệt, hệ thống sẽ gặp lỗi dữ liệu mồ côi.
* **Giải pháp kỹ thuật:** Trong `deleteTask`, tự động cập nhật toàn bộ `TaskRequest` đang `PENDING` của Task đó sang trạng thái `CANCELLED` với ghi chú: `"Task đã bị Quản lý xóa khỏi hệ thống."`.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-25] Bảo Vệ Quyền Tải & Xóa File Đính Kèm (Attachment Security)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** API `addAttachment` và `deleteAttachment` trước đây không kiểm tra quyền thành viên dự án, cho phép người dùng ngoài dự án tải file lên hoặc xóa tài liệu của dự án khác.
* **Giải pháp kỹ thuật:** 
  - Trong `addAttachment`: Kiểm tra bắt buộc người dùng phải là Admin/Manager hoặc thành viên trong bảng `project_members` của Dự án.
  - Trong `deleteAttachment`: Kiểm tra chỉ người được giao Task (`assigneeId`), người tạo Task (`createdById`) hoặc Quản lý dự án/Admin mới có quyền xóa tệp đính kèm.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`, `be/src/modules/task/task.controller.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-26] Ràng Buộc Thành Viên Khi Gán Subtask Assignee (Subtask Assignee Project Membership Constraint)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Khi tạo hoặc sửa Task con (`addSubtask`, `updateSubtask`), Client có thể truyền `assigneeId` là người ngoài Dự án, dẫn đến việc gán việc con cho người không có quyền truy cập vào Dự án.
* **Giải pháp kỹ thuật:** Kiểm tra bắt buộc `assigneeId` của Subtask phải thuộc bảng `project_members` hoặc là Manager/Creator của Dự án đó.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-28] Chặn Gửi Yêu Cầu Trợ Giúp (`ASSIST`) Cho Chính Bản Thân (Self-Assistance Request Lock)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Hệ thống đã chặn yêu cầu `TRANSFER` cho chính mình nhưng chưa chặn yêu cầu hỗ trợ `ASSIST` (`effectiveSenderId === effectiveReceiverId`), gây phát sinh request rác.
* **Giải pháp kỹ thuật:** Mở rộng điều kiện chặn chung cho toàn bộ các loại request (`TRANSFER`, `ASSIST`): `BadRequestException('Không thể gửi yêu cầu chuyển giao hoặc hỗ trợ cho chính bản thân mình!')`.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-29] Phân Quyền Bình Luận Trong Task Thuộc Dự Án (Project Member Commenting Authorization)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** API `addComment` cho phép bất kỳ user nào có JWT token gửi bình luận vào Task mà không kiểm tra xem user đó có thuộc Dự án chứa Task hay không.
* **Giải pháp kỹ thuật:** Kiểm tra người dùng phải là Admin, Manager, hoặc thành viên có trong bảng `project_members` của Dự án chứa Task mới được đăng bình luận.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-30] Chống Phân Công Trùng Lặp Khi Manager Giao Cho Người Đang Phụ Trách (Redundant Direct Assignment by Manager)
* **Mức độ:** 🟢 **LOW**
* **Vấn đề (Root Cause):** Khi Quản lý phân công Task cho Nhân viên A, nếu Nhân viên A đã đang là `assigneeId` của Task đó, hệ thống vẫn tạo thêm bình luận và thông báo phân công trùng lặp.
* **Giải pháp kỹ thuật:** Kiểm tra nếu `targetTask.assigneeId === effectiveReceiverId` ➔ Ném ngoại lệ thông báo: `400 BadRequestException('Nhân sự này đã đang là người trực tiếp phụ trách Task này.')`.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-31] Khóa Kéo Thả Backend Khi Task Đang `IN_REVIEW` (Kanban Drag IN_REVIEW Conflict)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Khi Task đang ở trạng thái `IN_REVIEW` (đang có yêu cầu chuyển giao chờ duyệt), nếu người dùng gọi trực tiếp API `updateStatus` sang `TODO`, `IN_PROGRESS` hay `DONE`, trạng thái Task bị thay đổi trong khi yêu cầu bàn giao vẫn đang treo `PENDING`.
* **Giải pháp kỹ thuật:** Trong `updateStatus`, nếu `task.status === 'IN_REVIEW'` và có `TaskRequest` type `TRANSFER` đang `PENDING` ➔ Chặn đổi trạng thái: `BadRequestException('Task đang trong trạng thái Chờ Duyệt Bàn Giao (IN_REVIEW). Vui lòng duyệt hoặc hủy yêu cầu bàn giao trước khi chuyển đổi trạng thái.')`.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-32] Đóng Băng Chỉnh Sửa Nội Dung Khi Task Bị Tạm Dừng (`PAUSED`/`BLOCKED`) (PAUSED / BLOCKED Edit Freeze)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Khi Task đang ở trạng thái `PAUSED` hoặc `BLOCKED`, nhân viên vẫn có thể sửa đổi mô tả hoặc nội dung chi tiết trong khi Task đang bị đóng băng để giải quyết nghẽn.
* **Giải pháp kỹ thuật:** Trong `updateDescription`, nếu Task đang `PAUSED` hoặc `BLOCKED` và người thực hiện không phải Admin/Manager ➔ Chặn ném ngoại lệ: `BadRequestException('Task đang ở trạng thái Tạm Dừng hoặc Bị Nghẽn. Không thể chỉnh sửa mô tả cho đến khi Task được khôi phục trạng thái Đang Thực Hiện.')`.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-33] Hủy Yêu Cầu Chuyển Giao/Duyệt Của Thành Viên Bị Xóa Khỏi Dự Án (Pending TaskRequests Cleanup on Member Removal)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Khi một thành viên bị Quản lý xóa khỏi Dự án, các `TaskRequest` chuyển giao/hỗ trợ đang `PENDING` của thành viên đó (dù là người gửi hay người nhận) vẫn treo trong Hộp thư, gây lỗi mồ côi và tranh chấp quyền sở hữu task.
* **Giải pháp kỹ thuật:** Trong `removeMember` (`project.service.ts`), tự động quét và hủy toàn bộ các `TaskRequest` đang `PENDING` có liên quan đến thành viên bị xóa trên toàn bộ dự án (`status = 'CANCELLED'`).
* **File ảnh hưởng:** `be/src/modules/project/project.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-35] Khôi Phục Task Từ Thùng Rác Đồng Bộ Tiến Độ & Realtime (Task Restoration Integrity)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Khi khôi phục Task từ CSDL Thùng Rác (`restoreTask`), dữ liệu tiến độ và trạng thái có thể bị lệch so với subtask hiện thời và không bắn sự kiện WebSocket cho các client đang mở bảng Kanban.
* **Giải pháp kỹ thuật:** Trong `restoreTask`, tự động gọi `recalculateTaskProgress(id, task.projectId)` và phát sóng sự kiện Realtime `task:created` tới toàn bộ các thành viên đang online trong dự án.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-37] Xác Thực Nghiêm Ngặt Người Nhận Khi Phản Hồi Yêu Cầu Chuyển Giao/Duyệt (Receiver Authorization on Request Response)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** API `respondToRequest` trước đây không kiểm tra xem người gọi có đúng là `receiverId` của yêu cầu hay không, cho phép người dùng bất kỳ có JWT token duyệt hoặc từ chối yêu cầu của người khác.
* **Giải pháp kỹ thuật:** Trong `respondToRequest`, kiểm tra bắt buộc người phản hồi phải là chính người nhận (`effectiveUserId === reqItem.receiverId`) hoặc là Admin/Manager của Dự án.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-38] Phân Quyền Hủy Request & Reset Trạng Thái Subtask Khi Hủy Yêu Cầu Duyệt (TaskRequest Cancellation & Subtask Reset)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** 
  1. Chỉ người gửi mới hủy được yêu cầu, nếu nhân sự bị nghỉ việc hoặc request bị treo thì Quản lý dự án không có quyền can thiệp hủy.
  2. Khi hủy yêu cầu duyệt việc con (`SUBTASK_APPROVAL`), trạng thái `subtask.approvalStatus` không được reset về `NONE`, dẫn đến việc subtask bị kẹt ở trạng thái nộp duyệt mãi mãi.
* **Giải pháp kỹ thuật:** 
  1. Cho phép Admin / Project Manager có quyền hủy các `TaskRequest` bị kẹt.
  2. Khi hủy request loại `SUBTASK_APPROVAL`, tự động reset `subtask.approvalStatus = 'NONE'`.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-39] Xác Thực & Băm Mật Khẩu Thật Sự Khi Đổi Mật Khẩu (Real Password Change & Token Revocation)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** API `changePassword` trước đây chỉ là hàm khung trả về chuỗi thông báo mà không so sánh mật khẩu cũ bằng `bcrypt.compare` và không cập nhật mật khẩu mới vào cơ sở dữ liệu PostgreSQL.
* **Giải pháp kỹ thuật:** Trong `changePassword`, bắt buộc so khớp mật khẩu hiện tại bằng `bcrypt.compare`, mã hóa mật khẩu mới bằng `bcrypt.hash(..., 10)` và xóa `refreshToken` cũ trong CSDL để buộc đăng nhập lại an toàn.
* **File ảnh hưởng:** `be/src/modules/profile/profile.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-40] Loại Bỏ Task Trong Thùng Rác Khỏi Thống Kê Cá Nhân (Personal Stats Deleted Tasks Filter)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Trong `getPersonalStats`, các câu lệnh đếm số lượng Task hoàn thành (`DONE`), đang làm (`IN_PROGRESS`), trễ hạn (`overdue`) không lọc cờ `isDeleted: false`, làm sai lệch số liệu hiệu suất của nhân sự khi có task trong thùng rác.
* **Giải pháp kỹ thuật:** Bổ sung điều kiện `isDeleted: false` vào tất cả các truy vấn đếm trong `getPersonalStats`.
* **File ảnh hưởng:** `be/src/modules/profile/profile.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-41] Phân Quyền Cập Nhật Dự Án (Project Update Authorization)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** `ProjectController.update` và `ProjectService.update` trước đây không kiểm tra quyền người dùng, cho phép bất kỳ nhân viên nào gửi PATCH để đổi tên, mô tả, cấu hình stages hoặc đổi Quản lý dự án.
* **Giải pháp kỹ thuật:** Trong `update`, kiểm tra bắt buộc người dùng phải là Admin (`Role.ADMIN`) hoặc Quản lý của dự án (`project.managerId === user.id || project.createdById === user.id`).
* **File ảnh hưởng:** `be/src/modules/project/project.service.ts`, `be/src/modules/project/project.controller.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-42] Lọc Task Bị Xóa Khỏi Chi Tiết Dự Án (Project findOne Deleted Tasks Leak)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Trong `ProjectService.findOne`, truy vấn `tasks` không có bộ lọc `where: { isDeleted: false }`, làm các Task đã xóa vào thùng rác vẫn bị load ra trên bảng Kanban dự án.
* **Giải pháp kỹ thuật:** Bổ sung `where: { isDeleted: false }` vào quan hệ `tasks` trong `findOne`.
* **File ảnh hưởng:** `be/src/modules/project/project.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-43] Ràng Buộc Tồn Tại Của Quản Lý Dự Án (Project Manager Existence Constraint)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Khi tạo/sửa dự án với `managerId`, nếu truyền ID người dùng không tồn tại trong CSDL, hệ thống sẽ gán Quản lý ma hoặc gây lỗi Foreign Key.
* **Giải pháp kỹ thuật:** Trong `create` và `update`, kiểm tra `managerId` phải tồn tại trong bảng `User` trước khi lưu vào CSDL.
* **File ảnh hưởng:** `be/src/modules/project/project.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-44] Khóa Sửa Toàn Diện Thông Tin Task Con Khi Đã Nghiệm Thu (Completed Subtask Edit Lock)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Khi Task con đã `isDone: true`, hệ thống mới chỉ chặn sửa cờ khẩn cấp, nhưng vẫn cho phép sửa Tiêu đề, Hạn chót hoặc Người nhận việc con ➔ Cho phép sửa đổi nội dung công việc đã nghiệm thu.
* **Giải pháp kỹ thuật:** Trong `updateSubtask`, nếu `subtask.isDone === true` và có yêu cầu sửa `title`, `dueDate`, `assigneeId` ➔ Ném ngoại lệ `BadRequestException('Task con này đã hoàn thành và được xác nhận. Chỉ Quản lý mới có quyền mở lại (REOPEN) trước khi chỉnh sửa nội dung.')`.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-45] Chặn Chuyển Giao Task Đã Hoàn Thành (Transfer Request Block on DONE Tasks)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Trong `createTaskRequest`, nếu Task đang ở trạng thái `DONE`, người dùng vẫn gửi được yêu cầu chuyển giao sang nhân sự khác, gây xáo trộn quyền sở hữu và lịch sử task đã hoàn tất.
* **Giải pháp kỹ thuật:** Trong `createTaskRequest`, ném ngoại lệ `BadRequestException('Không thể gửi yêu cầu chuyển giao cho Task đã hoàn thành!')` nếu `targetTask.status === 'DONE'`.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-46] Chặn Chuyển Giao Khi Task Đang Bị Tạm Dừng / Bị Nghẽn (PAUSED/BLOCKED Transfer Block)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Khi Task đang `PAUSED` hoặc `BLOCKED`, gửi yêu cầu chuyển giao sẽ đẩy Task sang `IN_REVIEW`, lách qua trạng thái đóng băng của dự án.
* **Giải pháp kỹ thuật:** Bắt buộc Task phải được chuyển về `IN_PROGRESS` trước khi gửi yêu cầu chuyển giao.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-47] Ràng Buộc Hạn Chót Task Con Trong Khung Thời Gian Task Cha (Subtask DueDate Boundary)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Khi tạo/sửa Task con, nếu người dùng nhập `subtask.dueDate` muộn hơn `task.dueDate` (hoặc trước `task.startDate`), hạn chót việc con bị tràn ra ngoài deadline tổng của Task cha.
* **Giải pháp kỹ thuật:** Kiểm tra ràng buộc `subtask.dueDate` phải nằm trong khoảng `startDate` đến `dueDate` của Task cha.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-48] Chặn Trùng Tên Dự Án Đang Hoạt Động (Duplicate Active Project Name Constraint)
* **Mức độ:** 🟢 **LOW**
* **Vấn đề (Root Cause):** Khi tạo dự án mới, hệ thống chưa kiểm tra trùng tên với dự án đang chạy, gây nhầm lẫn trên menu chuyển đổi dự án (Project Switcher).
* **Giải pháp kỹ thuật:** Trong `create`, kiểm tra không cho phép tạo dự án có cùng tên với dự án đang hoạt động (`isCompleted: false`).
* **File ảnh hưởng:** `be/src/modules/project/project.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-50] Loại Trừ Task Trong Thùng Rác Khỏi Thống Kê Tổng Số Task Dự Án (Project Task Count Integrity)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Trong `ProjectService.findAll`, `_count: { tasks: true }` đếm cả các task `isDeleted: true`, làm sai lệch tổng số task hiển thị trên card danh sách dự án.
* **Giải pháp kỹ thuật:** Áp dụng bộ lọc `tasks: { where: { isDeleted: false } }` vào `_count` khi truy vấn danh sách dự án.
* **File ảnh hưởng:** `be/src/modules/project/project.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-51] Khóa Xóa Task Con Đã Hoàn Thành Nghiệm Thu (Approved Subtask Deletion Protection)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Trong `deleteSubtask`, nhân viên được giao việc hoặc người tạo task có thể tự ý xóa các Task con đã được nghiệm thu (`isDone: true`), làm mất dấu lịch sử tiến độ và dữ liệu hoàn thành công việc.
* **Giải pháp kỹ thuật:** Trong `deleteSubtask`, nếu `subtask.isDone === true`, ném ngoại lệ `ForbiddenException('Task con này đã hoàn thành và được phê duyệt. Chỉ Quản lý mới có quyền xóa!')` nếu người gọi không phải là Admin hoặc Quản lý dự án.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-52] Tự Động Hạ Trạng Thái Task DONE Về IN_PROGRESS Khi Quản Lý Mở Lại Task Con (Parent Task Reopen on Subtask Rejection)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Khi một Task đã ở trạng thái `DONE`, nếu Quản lý bấm `REOPEN` hoặc `REJECT` một Task con, Task cha vẫn giữ nguyên trạng thái `DONE` mặc dù tiến độ không còn là 100%.
* **Giải pháp kỹ thuật:** Trong `reviewSubtask`, nếu action là `REOPEN` hoặc `REJECT` và Task cha đang ở trạng thái `DONE`, tự động cập nhật Task cha về `status = 'IN_PROGRESS'` và `completedAt = null`.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-53] Phân Quyền Khôi Phục Task Từ Thùng Rác (Trash Task Restoration Authorization)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** API `restoreTask` trước đây không kiểm tra quyền người gọi, cho phép người dùng bất kỳ khôi phục các Task đã bị Quản lý xóa vào thùng rác.
* **Giải pháp kỹ thuật:** Trong `restoreTask`, kiểm tra bắt buộc người khôi phục phải là Admin (`ADMIN`) hoặc Quản lý của Dự án (`managerId`/`createdById`).
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`, `be/src/modules/task/task.controller.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-54] Bảo Vệ Quyền Đọc Bình Luận Của Task Thuộc Dự Án (Task Comments Read Authorization)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** `getComments` trước đây chỉ truy vấn `where: { taskId }` mà không kiểm tra quyền truy cập dự án của người dùng, làm lộ thông tin thảo luận nội bộ.
* **Giải pháp kỹ thuật:** Kiểm tra Task phải tồn tại và người dùng phải là thành viên thuộc Dự án hoặc Quản lý/Admin mới được phép lấy danh sách bình luận.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`, `be/src/modules/task/task.controller.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-55] Phân Quyền Xóa Task Cho Quản Lý Dự Án Cấp Cơ Sở (Project-level Manager Task Deletion)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** `deleteTask` trước đây chỉ kiểm tra quyền toàn cục (`role === 'ADMIN' || role === 'MANAGER'`), khiến các Quản lý được chỉ định riêng cho từng dự án (`project.managerId`) bị từ chối quyền xóa task thuộc dự án mình phụ trách.
* **Giải pháp kỹ thuật:** Cho phép người dùng là `managerId` hoặc `createdById` của Dự án có toàn quyền xóa Task thuộc dự án đó vào thùng rác.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-56] Phân Quyền Trách Nhiệm Riêng Biệt Cho Từng Task Con Trong Task Làm Chung (Subtask Ownership Isolation)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Khi nhiều nhân viên trong cùng một dự án cùng làm chung 1 Task cha, nếu không có cơ chế phân quyền theo từng Task con thì nhân viên A có thể tick nhầm hoặc nộp duyệt thay Task con của nhân viên B.
* **Giải pháp kỹ thuật:** 
  - Gán `assigneeId` riêng cho từng Task con (`Subtask`).
  - Kiểm tra nghiêm ngặt quyền tick hoàn thành: Chỉ đúng nhân sự được gán Task con đó (`subtask.assigneeId === user.id`) mới có quyền nộp duyệt. Người khác xem sẽ bị khóa giao diện (`read-only`).
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`, `fe/src/components/kanban/TaskDetailModal.tsx`, `fe/src/components/kanban/KanbanCard.tsx`, `fe/src/pages/BoardPage.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-57] Cá Nhân Hóa Today's Focus Cockpit Cho Nhân Sự Làm Chung Task (Personalized Micro-Sprint)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Khi cả nhân viên A và B cùng mở Today's Focus Cockpit, nếu lấy Subtask đầu tiên của Task cha thì nhân viên B có thể thấy Subtask của nhân viên A làm mục tiêu hôm nay.
* **Giải pháp kỹ thuật:** Bộ lọc Cockpit và Hero Focus Task #1 ưu tiên tìm **Task con chưa hoàn thành thuộc về chính nhân sự đang đăng nhập** làm mục tiêu ngày. Nhân viên nào hoàn thành phần việc của mình thì được nghỉ ngơi độc lập.
* **File ảnh hưởng:** `fe/src/pages/BoardPage.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-58] Tổng Hợp Danh Sách Nhân Sự Tham Gia & Avatar Stack Group Trên Bảng Kanban
* **Mức độ:** 🟢 **MEDIUM**
* **Vấn đề (Root Cause):** Thẻ Kanban Card trước đây chỉ hiển thị 1 avatar đơn lẻ của người nhận chính (`task.assignee`), không thể hiện được có nhiều người đang cùng phối hợp làm việc.
* **Giải pháp kỹ thuật:** Backend tổng hợp `assignees: Array<{ id, fullName, avatar, profession }>` từ Task cha và toàn bộ các Task con. Frontend hiển thị cụm Avatar xếp chồng (`Avatar Stack Group`) và nhãn số lượng nhân sự tham gia.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`, `fe/src/components/kanban/KanbanCard.tsx`, `fe/src/types/index.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-59] Bàn Giao Việc Cho Đồng Nghiệp Cùng Làm Khi Có Thành Viên Bị Rút Khỏi Dự Án (Collaborator-First Handover on Member Removal)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Khi nhân viên A bị xóa khỏi dự án, nếu hệ thống chuyển toàn bộ Task/Subtask về cho Quản lý dự án thì các Task đang phối hợp chung giữa A và B sẽ bị tước đoạt khỏi B hoặc gán về sai người.
* **Giải pháp kỹ thuật:** Khi xóa thành viên A: Hệ thống quét các Task mà A tham gia. Nếu có đồng nghiệp B còn lại đang cùng làm task đó -> Tự động bàn giao phần việc con và đại diện Task cha cho B! Nếu task chỉ có 1 mình A làm -> Mới chuyển về cho Quản lý dự án.
* **File ảnh hưởng:** `be/src/modules/project/project.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-60] Bộ Lọc Kanban Đa Diện Cho Task Phối Hợp Nhiều Người (Multi-Assignee Kanban Filter)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Khi lọc Kanban theo nhân sự B, nếu Task do A tạo/phụ trách chính nhưng B có việc con bên trong thì Task bị ẩn khỏi kết quả lọc của B.
* **Giải pháp kỹ thuật:** Backend và Frontend lọc đa diện: Task hiển thị nếu B là người nhận chính HOẶC B có ít nhất 1 Task con trong task đó (`subtasks.some(st => st.assigneeId === B)`).
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`, `fe/src/pages/BoardPage.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-61] Thiết Lập Ngày Bắt Đầu & Thời Gian Làm Việc Của Task Con Khi Đã Tạo Task (Subtask Schedule & Duration Persistence)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Khi Task cha đã được tạo từ trước, form thêm Task con trong `TaskDetailModal` trước đây thiếu ô nhập Ngày bắt đầu (`startDate`) và Thời gian làm việc ước lượng (`estimatedDays`), khiến các Task con phát sinh sau này không có lịch trình cụ thể và không thể tính toán lại tỷ trọng % tiến độ công bằng.
* **Giải pháp kỹ thuật:** 
  - Bổ sung `startDate` và `estimatedDays` vào model `Subtask` trong CSDL PostgreSQL (`prisma/schema.prisma`).
  - Hỗ trợ nhập Ngày bắt đầu, Thời gian ước lượng (1, 2, 3... ngày), Người phụ trách riêng và Cờ khẩn cấp ngay trên thanh Quick Add của `TaskDetailModal`.
  - Tự động tính toán lại % tiến độ của Task cha dựa trên tổng số ngày công của các Task con đã hoàn thành / Tổng số ngày công của tất cả các việc con.
* **File ảnh hưởng:** `be/prisma/schema.prisma`, `be/src/modules/task/task.service.ts`, `be/src/modules/task/task.controller.ts`, `be/src/modules/task/dto/create-task.dto.ts`, `fe/src/types/index.ts`, `fe/src/components/kanban/TaskDetailModal.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-62] Xử Lý Các Task Con Có Cùng Ngày Thực Hiện / Làm Song Song (Parallel Same-Day Subtasks Execution)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** 
  1. Khi có 2 Task con cùng làm trong ngày 18/08 (ví dụ: A làm Thiết kế, B làm Database), nếu hệ thống tính lịch trình nối đuôi tuần tự cũ thì Task con thứ 2 sẽ bị dời sang ngày 19/08 (sai ngày thực tế người dùng đã chọn).
  2. Nếu hệ thống cộng dồn số ngày (`1 + 1 = 2 ngày`) để tính `task.dueDate` thì hạn chót Task cha bị đội lên ngày 20/08 thay vì kết thúc vào cuối ngày 19/08 (sai 1 ngày).
* **Giải pháp kỹ thuật:** 
  - **Lịch trình giao diện**: `getSubtaskCalendarSchedule` ưu tiên lấy trực tiếp `st.startDate` của Task con nếu đã được thiết lập, hiển thị chính xác ngày người dùng chọn thay vì tự động cộng dồn nối đuôi.
  - **Hạn chót Task cha**: `recalculateTaskProgress` tính toán `task.dueDate` theo **Đường găng thời gian ($\max$ của các ngày kết thúc của Task con)** thay vì cộng dồn số học tuyến tính khi có ngày riêng.
  - **Cockpit đa nhân sự**: Cả 2 nhân sự cùng thấy Task con của mình được gắn nhãn `🔥 HÔM NAY` trên Today's Focus Cockpit và làm việc song song độc lập.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`, `fe/src/pages/BoardPage.tsx`, `fe/src/components/kanban/KanbanCard.tsx`, `fe/src/components/kanban/TaskDetailModal.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-63] Đồng Bộ & Lưu Trữ Dữ Liệu Hồ Sơ Cá Nhân Vào PostgreSQL (Profile Data Persistence & Media Sync)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** 
  1. Trang `ProfilePage` trước đây khi submit form chỉ cập nhật State cục bộ trong `useAuthStore` mà không gọi API Backend, dẫn đến mất dữ liệu khi F5 tải lại trang hoặc đăng nhập thiết bị khác.
  2. DTO `UpdateProfileDto` và `ProfileService` ở Backend trước đây thiếu trường `avatar` và `coverImage`, khiến ảnh đại diện và ảnh bìa không thể lưu trữ vào PostgreSQL.
* **Giải pháp kỹ thuật:** 
  - Backend: Bổ sung `@IsOptional() @IsString() avatar?: string` và `coverImage?: string` vào `UpdateProfileDto`. Cập nhật `profile.service.ts` để lưu trữ dữ liệu vào bảng `User`.
  - Frontend: Tạo `profile.service.ts` kết nối trực tiếp `PATCH /api/profile/me`. Bổ sung action `updateUser` trong Zustand store để đồng bộ trạng thái toàn cục.
  - Tích hợp kiểm soát dung lượng file upload (< 2.5MB cho Avatar, < 3MB cho Cover Banner) và thông báo Toast phản hồi thành công/thất bại.
* **File ảnh hưởng:** `be/src/modules/profile/dto/update-profile.dto.ts`, `be/src/modules/profile/profile.service.ts`, `fe/src/services/profile.ts`, `fe/src/store/useAuthStore.ts`, `fe/src/pages/ProfilePage.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-64] Toàn Vẹn Bảo Mật & Thu Hồi Phiên Khi Đổi Mật Khẩu (Password Change & Session Revocation Integrity)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Người dùng không có giao diện đổi mật khẩu trên trang Profile, và nếu đổi mật khẩu mà không thu hồi Refresh Token cũ thì phiên đăng nhập trên các thiết bị trước đó vẫn có thể tiếp tục truy cập trái phép.
* **Giải pháp kỹ thuật:** 
  - Backend: API `PATCH /api/profile/change-password` xác thực mật khẩu hiện tại bằng `bcrypt.compare`, mã hóa mật khẩu mới bằng `bcrypt.hash(..., 10)` và tự động set `refreshToken: null` để thu hồi phiên cũ.
  - Frontend: Tích hợp Modal "Bảo Mật & Đổi Mật Khẩu" với validation khớp mật khẩu, độ dài tối thiểu 6 ký tự, nút bật/tắt hiển thị mật khẩu và hiệu ứng loading chống bấm đúp.
* **File ảnh hưởng:** `be/src/modules/profile/profile.controller.ts`, `be/src/modules/profile/profile.service.ts`, `fe/src/services/profile.ts`, `fe/src/pages/ProfilePage.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-65] Trực Quan Hóa Số Liệu Thống Kê Tác Nghiệp Cá Nhân Động (Dynamic Personal Metrics & Realtime Stats Calculation)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Khối Thống kê tác nghiệp cá nhân trên Profile trước đây bị gắn cứng (hardcoded) số ảo (42 Hoàn thành, 2 Trễ hạn, 3 Đang làm...), không phản ánh đúng tiến độ thực tế trong CSDL của từng nhân sự.
* **Giải pháp kỹ thuật:** 
  - Tự động gọi API `GET /api/profile/stats` khi người dùng truy cập trang Profile.
  - Backend tính toán số lượng thực tế: `completedTasks` (Task có `status: DONE, isDeleted: false`), `inProgressTasks` (Task có `status: IN_PROGRESS`), `overdueTasks` (Task chưa DONE và có `dueDate < new Date()`), và tổng số Task được phân công.
* **File ảnh hưởng:** `be/src/modules/profile/profile.service.ts`, `fe/src/services/profile.ts`, `fe/src/pages/ProfilePage.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-66] Xác Thực Thành Viên Dự Án Khi Tạo Hàng Loạt Task Con (Bulk Subtasks Project Membership Validation)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Khi tạo Task mới (`POST /tasks`) kèm danh sách `subtasks: [{ title, assigneeId }]`, hàm `create` trong `task.service.ts` chỉ kiểm tra `assigneeId` của Task cha, bỏ quên kiểm tra `subtasks[i].assigneeId`.
* **Hậu quả:** Người tạo Task có thể gán các Task con cho người bên ngoài dự án, vi phạm nghiêm trọng tính cô lập dữ liệu (Project Isolation).
* **Giải pháp kỹ thuật:** 
  - Truy vấn danh sách toàn bộ thành viên hợp lệ của dự án (`project.managerId`, `project.createdById`, `project.members`).
  - Duyệt qua từng Task con và kiểm tra `st.assigneeId`. Nếu có người không thuộc danh sách thành viên dự án, lập tức ném lỗi `BadRequestException`.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-67] Cấp Quyền Điều Phối Trạng Thái Kanban Cho Quản Lý Dự Án (Project Manager Kanban Status Update Authorization)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Trong `updateStatus`, hệ thống kiểm tra `user.role !== 'ADMIN'` và chỉ cho phép người nhận việc (`task.assigneeId === user.id`) mới được thay đổi trạng thái thẻ. Quản lý dự án (`project.managerId` hoặc `MANAGER`) bị ném lỗi 403 Forbidden.
* **Hậu quả:** Quản lý không thể kéo thả Kanban, tạm dừng (`PAUSED`), đánh dấu nghẽn (`BLOCKED`) hoặc điều phối Task do nhân viên đang giữ trong chính dự án của mình.
* **Giải pháp kỹ thuật:** 
  - Mở rộng phân quyền cho phép `Admin`, `Manager` toàn cục, Quản lý phụ trách dự án (`project.managerId`/`project.createdById`) và Người tạo Task (`task.createdById`) có toàn quyền cập nhật trạng thái Kanban.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-68] Bọc Giao Dịch Nguyên Tố Khi Bàn Giao & Xóa Thành Viên Dự Án (Atomic Transaction on Member Removal & Handover)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Trong `removeMember` (`project.service.ts`), 4 bước xử lý CSDL (chuyển giao subtasks, cập nhật task assignee, hủy taskRequest và xóa projectMember) được thực thi tuần tự mà không có giao dịch nguyên tố.
* **Hậu quả:** Nếu có lỗi ngắt kết nối mạng hoặc sập nguồn ở bước cuối, dữ liệu sẽ bị phân mảnh dở dang.
* **Giải pháp kỹ thuật:** Bọc toàn bộ các thao tác CSDL trong `this.prisma.$transaction(async (tx) => { ... })` để đảm bảo cơ chế ACID (tự động rollback an toàn nếu có lỗi ở bất kỳ bước nào).
* **File ảnh hưởng:** `be/src/modules/project/project.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-69] Chặn Tạo Task & Task Con Vào Dự Án Đã Đóng / Hoàn Thành Nghiệm Thu (Completed Project Task Creation Freeze)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Khi Dự án đã ở trạng thái hoàn tất (`isCompleted: true`), các API `create` task và `addSubtask` không kiểm tra cờ này, cho phép tiếp tục tạo Task và Subtask mới.
* **Hậu quả:** Làm sai lệch dữ liệu tiến độ và hồ sơ nghiệm thu đã khóa của dự án.
* **Giải pháp kỹ thuật:** Kiểm tra `project.isCompleted` trong cả `create` và `addSubtask`, từ chối tạo mới kèm thông báo lỗi rõ ràng.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-70] Ràng Buộc Hạn Chót Task Con Không Trước Ngày Bắt Đầu Task Cha Khi Thêm Nhanh (Subtask DueDate Before Task StartDate Validation)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Khi thêm Task con trong `addSubtask` chỉ chọn `dueDate`, hệ thống kiểm tra `dueDate > task.dueDate` nhưng bỏ sót kiểm tra `dueDate >= task.startDate`.
* **Hậu quả:** Hạn chót của việc con lại xảy ra trước khi công việc cha bắt đầu.
* **Giải pháp kỹ thuật:** Bổ sung kiểm tra `parsedSubtaskDueDate.getTime() < new Date(task.startDate).getTime()`, chặn lưu và thông báo lỗi cho người dùng.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-71] Khóa Thao Tác Tác Nghiệp Trên Task Đã Bị Xóa Vào Thùng Rác (Trash Task Operation Lock)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Khi Task bị xóa mềm (`isDeleted: true`) và nằm trong Thùng rác, các hàm `addComment`, `addAttachment`, `addSubtask`, `createTaskRequest`, `updateDescription` chỉ tìm theo `where: { id }` mà không kiểm tra `isDeleted: true`.
* **Hậu quả:** Người dùng vẫn có thể tiếp tục bình luận, tải tệp, thêm việc con hoặc gửi yêu cầu chuyển giao cho một Task đang nằm trong Thùng rác.
* **Giải pháp kỹ thuật:** Bổ sung điều kiện kiểm tra `if (!task || task.isDeleted)` ném lỗi `NotFoundException('Task không tồn tại hoặc đã bị xóa vào thùng rác')` trên tất cả các API tương tác liên quan.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-72] Triệt Tiêu Race Condition Khi Quản Lý Phân Công Trực Tiếp (Manager Direct Assignment Race Condition & Pending Request Cleanup)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Khi Quản lý phân công việc trực tiếp cho nhân sự mới, nếu trước đó nhân viên cũ đã gửi 1 yêu cầu chuyển giao cho người khác đang ở trạng thái `PENDING`, yêu cầu cũ không bị hủy. Nếu người được mời cũ bấm "Chấp nhận" sau đó, Task sẽ bị cướp quyền và ghi đè quyết định của Quản lý.
* **Giải pháp kỹ thuật:** Bọc toàn bộ quy trình gán việc của Quản lý trong `prisma.$transaction`, tự động hủy (`status = 'CANCELLED'`) toàn bộ các yêu cầu chuyển giao đang chờ phản hồi của Task/Subtask đó.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-73] Nâng Giới Hạn Dung Lượng Tệp Lên 100MB & Làm Sạch Tên File An Toàn (100MB Attachment Limit & Filename Sanitization)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Cần nâng cấp dung lượng tải tệp đính kèm phục vụ tài liệu dung lượng lớn (video demo, file thiết kế, bộ cài) đồng thời bảo vệ hệ thống khỏi tấn công Path Traversal.
* **Giải pháp kỹ thuật:** 
  - Nâng giới hạn dung lượng tải tệp lên **100MB** (`100 * 1024 * 1024` bytes).
  - Tự động làm sạch tên file `file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')` và gắn timestamp duy nhất trước khi lưu vào thư mục `uploads/`.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-74] Chuyển Giao Theo Cấp Độ Minitask (Subtask Transfer Architecture & Instant State Recovery)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Trước đây cơ chế chuyển giao chỉ hỗ trợ đổi toàn bộ Task cha (`task.assigneeId`), không cho phép chia nhỏ và bàn giao độc lập từng Task con (Minitask) cụ thể cho các thành viên khác nhau trong dự án.
* **Giải pháp kỹ thuật:** 
  - Bổ sung trường `subtaskId` vào API `createTaskRequest`.
  - Frontend cho phép chọn chính xác Minitask cần bàn giao.
  - Khi người nhận bấm **Chấp Nhận (APPROVED)**, hệ thống cập nhật `subtask.assigneeId = receiverId`, tự động khôi phục Task cha về `IN_PROGRESS` và phát sóng Socket.IO realtime.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`, `fe/src/components/kanban/TaskRequestModal.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-75] Chuẩn Hóa Nội Dung Bình Luận & Chặn Bình Luận Rỗng (Comment Content Sanitization & Empty Rejection)
* **Mức độ:** 🟢 **MEDIUM**
* **Vấn đề (Root Cause):** Người dùng có thể gửi bình luận chỉ gồm dấu cách trắng (`"   "`), tạo ra các bong bóng bình luận rỗng trên giao diện thẻ Task.
* **Giải pháp kỹ thuật:** Trim nội dung bình luận `(dto.content || dto.text || '').trim()`, nếu rỗng thì ném lỗi `BadRequestException('Nội dung bình luận không được để trống!')`.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-76] Tự Động Xử Lý & Khử Trùng Lặp Thẻ Nhãn (Tag Normalization & Case-Insensitive Matching)
* **Mức độ:** 🟢 **MEDIUM**
* **Vấn đề (Root Cause):** Khi tạo Task mới kèm danh sách thẻ `tagNames`, nếu các tên thẻ có khoảng trắng thừa hoặc trùng tên khác chữ hoa/thường (ví dụ `FE` và `fe`), hệ thống có thể tạo ra nhiều bản ghi Tag trùng lặp hoặc không gán vào bảng `task_tags`.
* **Giải pháp kỹ thuật:** Trim tên thẻ, tìm kiếm Tag theo tên không phân biệt hoa thường (`mode: 'insensitive'`) trong cùng dự án, tự động tạo mới nếu chưa có và liên kết an toàn qua `this.prisma.taskTag.upsert`.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-77] Khóa Toàn Diện Thao Tác Kéo Thả / Cập Nhật Trạng Thái Trên Task Đã Lưu Trữ (Archived Task Immutability)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Task đã được đưa vào kho lưu trữ (`isArchived: true`) vẫn có thể bị gọi API `updateStatus` để kéo thả hoặc thay đổi trạng thái tiến độ trên bảng Kanban.
* **Hậu quả:** Làm xáo trộn dữ liệu lịch sử của các công việc đã đóng băng lưu trữ.
* **Giải pháp kỹ thuật:** Bổ sung kiểm tra `if (task.isArchived)` trong `updateStatus`, ném lỗi `BadRequestException('Task đã được lưu trữ vào kho (Archived). Không thể thay đổi trạng thái!')`.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-78] Chặn Khôi Phục Task Vào Dự Án Đã Hoàn Thành / Đóng Nghiệm Thu (Restore Task To Completed Project Guard)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** API `restoreTask` chỉ kiểm tra Task có tồn tại trong thùng rác hay không, cho phép người dùng khôi phục một Task đã xóa vào trong một Dự án đã hoàn tất nghiệm thu và đóng cửa (`isCompleted: true`).
* **Hậu quả:** Gây sai lệch báo cáo tiến độ và vi phạm tính đóng băng của dự án đã nghiệm thu.
* **Giải pháp kỹ thuật:** Kiểm tra `if (task.project?.isCompleted)` trong `restoreTask`, từ chối khôi phục và thông báo rõ ràng cho Quản lý.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-79] Khóa Cập Nhật Task Con Khi Task Đã Nằm Trong Thùng Rác Hoặc Dự Án Đã Đóng (Subtask Mutation On Deleted Task / Closed Project Guard)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Trong `updateSubtask`, hệ thống không kiểm tra `subtask.task.isDeleted` và `subtask.task.project.isCompleted`, cho phép sửa đổi nội dung việc con của Task đã bị xóa hoặc của dự án đã đóng.
* **Giải pháp kỹ thuật:** Bổ sung kiểm tra `subtask.task.isDeleted` (ném `NotFoundException`) và `subtask.task.project.isCompleted` (ném `BadRequestException`).
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-80] Tự Động Dọn Dẹp TaskRequest Treo Khi Đóng / Nghiệm Thu Toàn Bộ Dự Án (Project Closure Pending Request Auto-Cleanup)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Khi Quản lý cập nhật dự án sang hoàn thành (`isCompleted: true`), các yêu cầu chuyển giao (`TaskRequest: PENDING`) còn sót lại không được giải phóng, gây nghẽn trạng thái `IN_REVIEW` mồ côi.
* **Giải pháp kỹ thuật:** Bọc cập nhật dự án trong `prisma.$transaction`, tự động hủy (`status = 'CANCELLED'`) toàn bộ các `TaskRequest` đang ở trạng thái `PENDING` của toàn bộ các Task trong dự án đó.
* **File ảnh hưởng:** `be/src/modules/project/project.service.ts`, `be/src/modules/project/dto/update-project.dto.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-81] Cơ Chế URGENT Động Duy Nhất Theo Việc Con & Thông Báo Tức Thì (Single Dynamic Urgent Mechanism & Subtask Notifications)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Hệ thống có các mức độ ưu tiên phức tạp gây rối rắm. Khi việc con bật khẩn cấp, Task cha không tự động cập nhật, người nhận việc con không nhận được thông báo, và khi đã hoàn thành việc con khẩn cấp thì Task cha vẫn bị kẹt ở URGENT.
* **Giải pháp kỹ thuật:**
  - Bỏ toàn bộ cơ chế đánh giá mức độ ưu tiên phức tạp khác, chỉ giữ lại duy nhất cơ chế URGENT theo Việc con.
  - Khi bất kỳ việc con nào bật `isUrgent: true` (lúc tạo hoặc cập nhật), Task cha tự động chuyển `priority = 'URGENT'`, đồng thời hệ thống tự động tạo thông báo gửi đến người nhận việc con (`🔥 [THÔNG BÁO KHẨN CẤP] Việc con "..." đã được gắn cờ KHẨN CẤP. Người phụ trách: @... cần ưu tiên xử lý ngay!`).
  - Trong `recalculateTaskProgress`, khi tất cả các việc con khẩn cấp đã hoàn thành (`isDone: true`) hoặc bị xóa, hệ thống tự động TẮT `URGENT` và chuyển Task cha về `NORMAL`.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-82] Quyền Nghiệm Thu Hoàn Thành Trực Tiếp Task Con Dành Cho Admin & Quản Lý (Admin & Manager Direct Subtask Completion Authority)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Khi Admin hoặc Quản lý dự án nhấn hoàn thành một Task con được giao cho nhân viên khác, hệ thống lại chuyển Task con sang trạng thái `PENDING` chờ duyệt, tạo ra một vòng lặp chờ duyệt phi lý đối với chính cấp Quản lý cao nhất.
* **Giải pháp kỹ thuật:** Kiểm tra `isAdminOrManager`. Khi Admin hoặc Manager dự án đánh dấu hoàn thành Task con của bất kỳ ai, hệ thống trực tiếp xác nhận `isDone = true`, `approvalStatus = 'APPROVED'`, đồng thời tự động cập nhật toàn bộ `TaskRequest` chờ duyệt liên quan sang `ACCEPTED` với ghi chú rõ ràng.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-83] Chặn Tự Gửi Thông Báo Cho Chính Mình (Self-Notification Elimination)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Khi một thành viên tự tạo task và tự giao cho mình, hoặc tự bình luận vào task do mình phụ trách, hệ thống lại tạo thông báo và bắn chuông cho chính người đó, gây rối mắt và spam thông báo vô nghĩa.
* **Giải pháp kỹ thuật:** Trong `NotificationService.sendNotification`, kiểm tra điều kiện `if (dto.actorId && dto.userId && dto.actorId === dto.userId) return null;` ➔ Chặn hoàn toàn việc tạo bản ghi DB và phát sóng Socket.IO khi tác nhân thực hiện trùng với người nhận.
* **File ảnh hưởng:** `be/src/modules/notification/notification.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-84] Cô Lập Quyền Thành Viên Dự Án Khỏi Rò Rỉ Thông Báo (Project Membership Isolation & Notification Guard)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Khi một nhân sự bị xóa khỏi dự án (nhưng vẫn còn tài khoản công ty), nếu các thành viên khác tiếp tục bình luận hoặc thao tác trên các Task cũ trong dự án đó, nhân sự cũ này vẫn có thể nhận thông báo, gây rò rỉ dữ liệu bảo mật dự án.
* **Giải pháp kỹ thuật:** Khi gửi thông báo có `projectId`, hệ thống truy vấn CSDL kiểm tra xem `userId` người nhận có còn nằm trong danh sách thành viên hợp lệ (`project.members`, `managerId`, `createdById` hoặc `Role.ADMIN`) hay không. Nếu không còn quyền ➔ Hủy thông báo ngay lập tức.
* **File ảnh hưởng:** `be/src/modules/notification/notification.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-85] Đồng Bộ Đa Tab & Đa Thiết Bị Tránh Lệch Bộ Đếm Chưa Đọc (Multi-Device / Multi-Tab Unread Sync)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Người dùng mở nhiều tab trình duyệt hoặc đăng nhập song song trên điện thoại và máy tính. Khi đọc thông báo ở Tab A, Tab B vẫn hiển thị chấm đỏ chưa đọc gây hiểu lầm.
* **Giải pháp kỹ thuật:** Mỗi khi thực hiện `markAsRead` hoặc `markAllAsRead`, Backend tự động đếm lại `unreadCount` thực tế và phát sóng sự kiện Socket.IO `notification:read` / `notification:read-all` tới room cá nhân `user:${userId}`. Toàn bộ các client đang kết nối của người dùng đó sẽ đồng bộ số đếm tức thì 0ms.
* **File ảnh hưởng:** `be/src/modules/notification/notification.service.ts`, `fe/src/components/navigation/NotificationCenter.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-86] Toàn Vẹn Khóa Ngoại Khi Xóa Dữ Liệu Gốc (Cascade FK Constraint Protection for Notifications)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Khi xóa vĩnh viễn một Task hoặc một User bị xóa khỏi hệ thống, các bản ghi con trong bảng `notifications` sẽ gây lỗi ràng buộc khóa ngoại (Foreign Key Constraint Violation) làm sập API xóa.
* **Giải pháp kỹ thuật:** Cấu hình quan hệ trong `schema.prisma`:
  - `user User @relation("UserNotifications", fields: [userId], references: [id], onDelete: Cascade)`
  - `task Task? @relation(fields: [taskId], references: [id], onDelete: Cascade)`
  - `actor User? @relation("ActorNotifications", fields: [actorId], references: [id], onDelete: SetNull)`
* **File ảnh hưởng:** `be/prisma/schema.prisma`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-87] Chống Spam Bật/Tắt Cờ Khẩn Cấp (Idempotent Urgent Notification Guard)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Nếu người dùng liên tục bật tắt checkbox khẩn cấp trong vài giây, hệ thống có thể tạo hàng loạt thông báo trùng lặp làm nghẽn chuông của người nhận.
* **Giải pháp kỹ thuật:** Chỉ kích hoạt thông báo và bình luận khẩn cấp khi có sự chuyển đổi trạng thái thực sự từ `isUrgent: false` sang `isUrgent: true` (`if (body.isUrgent === true && !subtask.isUrgent)`).
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-88] Phòng Thủ Mảng Đa Tầng Tránh Crash Giao Diện Chuông Thông Báo (Array Guard & Defect-Free Notification Center)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Khi API trả về cấu trúc bọc `{ data: [...] }` hoặc khi gặp lỗi mạng trả về đối tượng không phải mảng, việc gọi hàm `.filter()` trên biến state làm sập toàn bộ giao diện React (`notifications.filter is not a function`).
* **Giải pháp kỹ thuật:** Bóc tách an toàn đa tầng `Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : [])`, gán giá trị mặc định mảng rỗng trong `catch`, và bọc `safeNotifications = Array.isArray(notifications) ? notifications : []` trước mọi thao tác mảng.
* **File ảnh hưởng:** `fe/src/components/navigation/NotificationCenter.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-89] Giữ Nguyên Task DONE Vĩnh Viễn Trên Bảng Kanban & Tinh Gọn Bỏ Audit Log (Permanent DONE Column Retention & Audit Log Deprecation)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Cơ chế cũ tự động ẩn các Task đã hoàn thành sau 2 ngày (`twoDaysAgo`) khiến nhân viên và Quản lý không thể theo dõi tiến độ tổng thể của các công việc đã xong trực tiếp trên bảng Kanban. Đồng thời bảng `AuditLog` tạo thêm chi phí truy vấn dư thừa không cần thiết.
* **Giải pháp kỹ thuật:** 
  - Xóa bỏ hoàn toàn bộ lọc thời gian 2 ngày trong `TaskService.findAll`. Toàn bộ Task ở trạng thái `DONE` sẽ được giữ nguyên hiển thị vĩnh viễn ở cột DONE trên bảng Kanban cho đến khi người dùng chủ động xóa vào thùng rác hoặc lưu trữ.
  - Loại bỏ hoàn toàn bảng `AuditLog` khỏi CSDL PostgreSQL và Prisma Schema để tinh gọn hệ thống.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`, `be/prisma/schema.prisma`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-90] Quyền Xóa Dự Án Dành Cho Admin & Bàn Giao Thùng Rác (Admin-Only Project Deletion & 14-Day Trash Handoff)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Trước đây hệ thống chưa có tính năng cho phép Admin xóa dự án ở mục Master Plan; nếu xóa cứng sẽ làm mất toàn bộ lịch sử công việc và tệp đính kèm không thể cứu vãn.
* **Giải pháp kỹ thuật:**
  - Cung cấp nút **"Xóa Dự Án"** kèm Modal xác nhận nguy hiểm trên thẻ thông tin Master Plan chỉ hiển thị cho tài khoản `Role.ADMIN`.
  - Khi Admin xác nhận xóa, hệ thống kích hoạt giao dịch nguyên tố `prisma.$transaction`: đánh dấu `project.isDeleted = true`, `project.deletedAt = new Date()`, đồng thời đánh dấu `task.isDeleted = true` cho toàn bộ các Task con trong dự án và tự động hủy các `TaskRequest` đang treo.
  - Phát sóng Socket.IO `project:deleted` để các client cập nhật ngay lập tức.
* **File ảnh hưởng:** `be/src/modules/project/project.service.ts`, `be/src/modules/project/project.controller.ts`, `fe/src/pages/BoardPage.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-91] Chuẩn Hóa Chính Sách Lưu Giữ 14 Ngày & Trung Tâm Thùng Rác Hệ Thống (Universal 14-Day Retention Policy & Admin Trash Center)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Khi xóa dữ liệu (Dự án, Task), nhân sự có nguy cơ xóa nhầm hoặc muốn phục hồi lại sau đó nhưng không có nơi tập trung để quản lý vòng đời dữ liệu đã xóa, dẫn đến mất mát dữ liệu vĩnh viễn.
* **Giải pháp kỹ thuật:**
  - Áp dụng **Chính sách lưu giữ an toàn 14 ngày (14-Day Retention Policy)**: Bất kỳ dữ liệu nào khi bị xóa đều chuyển sang trạng thái xóa mềm với dấu thời gian `deletedAt`. Dữ liệu được bảo toàn nguyên vẹn trong 14 ngày.
  - Xây dựng **Trung Tâm Thùng Rác Hệ Thống (Admin System Recycle Bin)** tại route `/admin/trash` chuẩn UI Pro Max:
    - Hiển thị danh sách Dự Án đã xóa và Task đã xóa với thanh tiến độ đếm ngược thời gian còn lại (14 ngày).
    - Hỗ trợ **Khôi Phục (Restore)** một chạm đưa Dự án / Task quay lại hoạt động bình thường.
    - Hỗ trợ **Xóa Vĩnh Viễn (Permanent Delete)** và **Dọn Sạch Thùng Rác (Empty All)** khi Admin muốn dọn dẹp CSDL triệt để.
* **File ảnh hưởng:** `be/src/modules/trash/trash.service.ts`, `be/src/modules/trash/trash.controller.ts`, `fe/src/pages/AdminTrashPage.tsx`, `fe/src/components/navigation/MeteorEdgeMenu.tsx`, `fe/src/App.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-92] [CC-01] Tự Động Khôi Phục Dự Án Cha Khi Khôi Phục Task Mồ Côi Từ Thùng Rác (Orphaned Task Auto-Project Restoral)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Khi một Dự án bị xóa mềm, toàn bộ Task con bị kéo theo vào Thùng Rác. Nếu Admin hoặc Quản lý chỉ nhấn "Khôi phục" trên 1 Task con, Task đó trở về `isDeleted: false` nhưng Dự án cha vẫn `isDeleted: true`, khiến Task bị mồ côi và không hiển thị trên Bảng Kanban.
* **Giải pháp kỹ thuật:** Trong `TaskService.restoreTask`, kiểm tra nếu `task.project.isDeleted === true`, hệ thống tự động khôi phục cả Dự án cha (`isDeleted: false, deletedAt: null`) trong một `prisma.$transaction`, phát sự kiện `project:restored` và thông báo rõ cho người dùng: *"Đã khôi phục Task và tự động mở lại Dự án liên quan!"*.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-93] [CC-02] Tự Động Hủy Dữ Liệu Quá Hạn 14 Ngày Lưu Giữ (Auto-Purge 14-Day Expired Trash)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Nếu Admin không chủ động nhấn "Dọn Sạch Thùng Rác", các bản ghi bị xóa mềm có thể tồn đọng mãi trong CSDL vượt quá thời hạn cam kết 14 ngày.
* **Giải pháp kỹ thuật:** Tích hợp hàm `autoPurgeExpiredTrash()` trong `TrashService`, tự động quét và xóa vĩnh viễn tất cả Task và Dự án có `deletedAt <= Date.now() - 14 ngày` trước mỗi lần tổng hợp báo cáo Thùng Rác.
* **File ảnh hưởng:** `be/src/modules/trash/trash.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-94] [CC-03] Tự Động Hạ Cờ URGENT Của Task Cha Khi Xóa / Hoàn Thành Task Con Khẩn Cấp (Urgent Flag Lifecycle Sync)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Task cha được nâng lên `priority = 'URGENT'` khi có việc con khẩn cấp. Nếu việc con đó bị xóa hoặc hoàn thành, Task cha có nguy cơ bị treo ở mức `URGENT` vô thời hạn.
* **Giải pháp kỹ thuật:** Trong `recalculateTaskProgress`, quét toàn bộ Subtasks còn lại: `const hasUnfinishedUrgentSubtasks = subtasks.some((st) => st.isUrgent && !st.isDone); updateTaskData.priority = hasUnfinishedUrgentSubtasks ? 'URGENT' : 'NORMAL';`. Cả `deleteSubtask` và `updateSubtask` đều kích hoạt hàm này để đảm bảo đồng bộ 100%.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-95] [CC-04] Phòng Thủ Not-Found & Điều Hướng An Toàn Khi Nhấp Vào Thông Báo Task Bị Xóa (Safe Notification Task Open)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Người dùng nhấp vào thông báo của Task vừa bị chuyển vào Thùng Rác hoặc thuộc Dự án họ vừa bị xóa quyền, gây lỗi trắng trang hoặc modal không phản hồi.
* **Giải pháp kỹ thuật:** Trong `NotificationCenter` và `BoardPage.tsx`, bọc `try/catch` an toàn khi tải Task theo ID từ notification. Nếu không tìm thấy, hệ thống hiển thị thông báo Toast: *"Công việc này đã bị chuyển vào Thùng Rác hoặc bạn không còn quyền truy cập!"*.
* **File ảnh hưởng:** `fe/src/pages/BoardPage.tsx`, `fe/src/components/navigation/NotificationCenter.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-96] [CC-05] Chống Xung Đột Race Condition & Idempotent Guard Khi Xóa / Khôi Phục Nhanh (Idempotent State Protection)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Nhấn đúp (Double click) nút Xóa hoặc Khôi phục dự án / Task có thể gửi nhiều request đồng thời, gây ra xung đột ghi dữ liệu và phát Socket event lặp lại.
* **Giải pháp kỹ thuật:** Thêm Idempotent guards trong `ProjectService` và `TaskService`: `if (project.isDeleted) return { success: true, message: 'Dự án đã nằm trong Thùng Rác' }` và `if (!project.isDeleted) return { success: true, message: 'Dự án đã ở trạng thái hoạt động' }`.
* **File ảnh hưởng:** `be/src/modules/project/project.service.ts`, `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-97] [CC-06] Phân Trang Thông Báo & Tự Động Dọn Dẹp Sau 30 Ngày (Notification Take Limit & 30-Day Auto Purge)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Người dùng có nhiều thông báo tích lũy theo năm tháng làm chậm truy vấn CSDL và tăng kích thước payload truyền qua mạng.
* **Giải pháp kỹ thuật:** Cố định `take: 50` mặc định trong `NotificationService.findAll` và tự động dọn dẹp các thông báo đã đọc có tuổi thọ trên 30 ngày (`createdAt <= Date.now() - 30 ngày`).
* **File ảnh hưởng:** `be/src/modules/notification/notification.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-98] [CC-07] Phòng Thủ Thời Gian Âm & Xử Lý Trực Quan Mục Quá Hạn Thùng Rác (Defensive Time Display & Expired Badge)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Sự lệch múi giờ giữa máy Client và Server có thể làm phép tính `daysLeft` ra số âm hoặc hiển thị NaN.
* **Giải pháp kỹ thuật:** Bọc `Math.max(0, msLeft)` và hiển thị huy hiệu màu đỏ nổi bật *"Đã hết hạn lưu giữ"* kèm ghi chú *"0 ngày (sắp dọn dẹp)"* trên thẻ dự án và task trong Thùng Rác.
### [LC-99] [CC-08..CC-27] Ma Trận 20 Trường Hợp Xử Lý Khi Thành Viên Tự Tạo Task Con (20 Member Self-Created Subtask Scenarios & Edge Cases)
* **Mức độ:** 🔴 **CRITICAL**
* **Bối cảnh:** Mở quyền cho Thành viên dự án (Project Member) được chủ động tự tạo Task con (Minitask) để phân rã công việc vi mô của chính mình hoặc phân công phối hợp trong dự án.
* **Danh sách 20 trường hợp đã được xử lý triệt để:**
  1. **Case 01 (Tự tạo cho chính mình):** Nhân viên tạo subtask không chọn ai -> Hệ thống tự động gán `assigneeId = chính nhân viên đó`.
  2. **Case 02 (Phân công cho đồng nghiệp trong dự án):** Nhân viên chọn gán subtask cho đồng nghiệp B trong cùng `project_members` -> Hệ thống lưu hợp lệ.
  3. **Case 03 (Chặn gán cho người ngoài dự án):** Nhân viên cố gán subtask cho người không thuộc dự án -> Backend ném lỗi `400 Bad Request`.
  4. **Case 04 (Chặn người ngoài dự án tạo subtask):** Người dùng không thuộc dự án cố tình gọi API tạo subtask -> Ném lỗi `403 Forbidden`.
  5. **Case 05 (Tạo subtask khi Task cha chưa phân công):** Task cha chưa có ai nhận (`assigneeId = null`), nhân viên tạo subtask -> Hợp lệ và subtask được gán cho nhân viên.
  6. **Case 06 (Tạo subtask khi Task cha đang DONE):** Task cha đang `DONE` (100%), khi thêm subtask mới -> Hệ thống tự động kéo Task cha về `IN_PROGRESS`, `completedAt = null`, và giảm % tiến độ theo tỷ trọng mới.
  7. **Case 07 (Tạo subtask khi Task cha đang TODO):** Thêm subtask đầu tiên -> Tự động tính toán lại số ngày ước lượng và đường găng hạn chót.
  8. **Case 08 (Khóa khi Task cha đang PAUSED / BLOCKED):** Task đang tạm dừng hoặc nghẽn -> Ném lỗi `400` yêu cầu mở lại trạng thái `IN_PROGRESS` trước khi thêm việc con.
  9. **Case 9 (Khóa khi Task cha đang IN_REVIEW chờ bàn giao):** Task đang có đơn chuyển giao chờ duyệt -> Ném lỗi `400` để tránh làm thay đổi khối lượng công việc bàn giao.
  10. **Case 10 (Khóa khi Task cha đã bị Lưu trữ/Xóa):** Task ở trạng thái `isArchived: true` hoặc `isDeleted: true` -> Khóa cứng hoàn toàn.
  11. **Case 11 (Tự động mở rộng Ngày bắt đầu Task cha):** Subtask có `startDate` sớm hơn `task.startDate` -> Hệ thống tự động cập nhật `task.startDate = parsedSubtaskStartDate`.
  12. **Case 12 (Tự động co giãn Hạn chót Task cha theo Đường găng):** Subtask mới có hạn chót kéo dài -> Hệ thống tự động đẩy `task.dueDate = max(subtaskDueDates)`.
  13. **Case 13 (Tự tạo subtask và nộp nghiệm thu):** Nhân viên tự tick hoàn thành subtask -> Chuyển trạng thái `PENDING` chờ Manager duyệt (không tự ý lên 100%).
  14. **Case 14 (Manager tự tạo subtask cho mình):** Quản lý dự án tự làm subtask của mình -> Tự động phê duyệt `APPROVED` ngay lập tức (`Self-Approval Flow`).
  15. **Case 15 (Tự tạo subtask Khẩn cấp URGENT):** Bật cờ `isUrgent: true` -> Tự động nâng `task.priority = 'URGENT'` và gửi bình luận cảnh báo khẩn.
  16. **Case 16 (Phân quyền xóa subtask tự tạo):** Subtask chưa duyệt (`isDone: false`) -> Nhân viên được xóa; Subtask đã duyệt (`isDone: true`) -> Chỉ Manager có quyền xóa.
  17. **Case 17 (Ràng buộc thời lượng làm việc hợp lệ):** Nhập số ngày <= 0 hoặc số thập phân -> Tự động chuẩn hóa về số nguyên dương: `Math.max(1, Math.floor(estimatedDays))`.
  18. **Case 18 (Cảnh báo vượt hạn chót Dự án):** Subtask mới làm tổng thời gian vượt `project.endDate` -> Cảnh báo nguy cơ trễ hạn dự án.
  19. **Case 19 (Song song cùng ngày):** Nhân viên tạo 2 việc con cùng 1 ngày thực hiện -> Lịch trình độc lập, không bị đẩy nối đuôi.
  20. **Case 20 (Chống Race Condition & Realtime Broadcast):** Nhiều nhân viên cùng tạo subtask đồng thời -> Xử lý trong `prisma.$transaction`, tính toán lại tiến độ và phát sóng Socket.IO `task:updated` tức thì.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`, `fe/src/components/kanban/TaskDetailModal.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100% (Build Pass Exit Code 0)**.

---

### [LC-100] Chặn Tuyệt Đối Trùng Tên Dự Án Toàn Diện & Chuẩn Hóa Loại Yêu Cầu (Universal Unique Project Name Enforcement & Simplified Request Types)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):**
  1. Hệ thống trước đây cho phép tạo hoặc đổi tên nhiều Dự án trùng khớp nhau do chỉ kiểm tra phân biệt chữ hoa/thường (`equals`) và không xét các dự án đang hoạt động (`isDeleted: false`). Điều này gây nhầm lẫn nghiêm trọng khi phân loại công việc, lọc lịch trình, và gửi thông báo.
  2. Tại hộp thoại chuyển giao `TaskRequestModal`, tùy chọn "Chờ Duyệt" (`REVIEW`) gây nhầm lẫn với quy trình duyệt trực tiếp của Quản lý trên từng Subtask.
* **Giải pháp kỹ thuật:**
  1. **Chặn trùng tên dự án không phân biệt hoa thường (`mode: 'insensitive'`)**:
     - Trong `ProjectService.create`: Quét `this.prisma.project.findFirst({ where: { isDeleted: false, name: { equals: trimmedName, mode: 'insensitive' } } })`. Nếu trùng, trả về lỗi `400 Bad Request`.
     - Trong `ProjectService.update`: Khi đổi tên dự án, kiểm tra trùng tên với tất cả các dự án khác (`id: { not: id }`).
     - Trong `ProjectService.restore`: Nếu dự án trong thùng rác có tên trùng với một dự án mới tạo sau đó, hệ thống tự động đổi tên hậu tố `(Khôi phục DD/MM/YYYY)` để tránh va chạm.
     - Phía Client `CreateProjectModal`: Thực hiện kiểm tra trùng tên tức thì trước khi gửi request.
  2. **Tinh gọn loại yêu cầu**: Loại bỏ tùy chọn "Chờ Duyệt" khỏi `TaskRequestModal`, chỉ giữ lại 2 nghiệp vụ rõ ràng: **`🔄 Chuyển Giao (TRANSFER)`** và **`🤝 Cần Hỗ Trợ (ASSIST)`**.
* **File ảnh hưởng:** `be/src/modules/project/project.service.ts`, `fe/src/components/kanban/CreateProjectModal.tsx`, `fe/src/components/kanban/TaskRequestModal.tsx`, `fe/src/pages/BoardPage.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100% (Build Pass Exit Code 0)**.

---

### [LC-101] Chỉ Định Quản Lý Dự Án & Tự Động Cấp Quyền Manager Cho Nhân Viên (Project Manager Assignment & Automatic Role Elevation)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):**
  1. Trong biểu mẫu khởi tạo dự án (`CreateProjectModal`), trước đây thiếu trường chọn Quản lý dự án (`selectedManagerId`), khiến mọi dự án mới tạo đều mặc định rơi vào Admin và không thể phân quyền linh hoạt cho các Manager khác hoặc nhân viên chủ chốt.
  2. Khi chỉ định một Nhân viên (`role: EMPLOYEE`) làm Quản lý dự án mới, nếu không nâng cấp quyền hạn của họ trong hệ thống thì họ sẽ bị thiếu các đặc quyền quan trọng (phê duyệt việc con, chuyển giao task, cấu hình pipeline).
* **Giải pháp kỹ thuật:**
  1. **Thêm mục Chọn Quản Lý Dự Án trong `CreateProjectModal`**:
     - Cho phép Admin chọn: Chính mình (`Admin`), các User đã có vai trò `MANAGER`, hoặc **bất kỳ Nhân viên nào (`EMPLOYEE`)** trong tổ chức.
     - Tự động gán Quản lý được chọn vào danh sách thành viên dự án (`selectedMemberIds`).
     - Hiển thị bảng mô tả đặc quyền và huy hiệu xác nhận rõ ràng.
  2. **Tự động nâng cấp quyền hạn (`Role Elevation`) trong Backend**:
     - Trong `ProjectService.create` & `ProjectService.update`: Khi một nhân viên (`EMPLOYEE`) được bổ nhiệm làm `managerId` của Dự án, Backend tự động cập nhật `user.role = 'MANAGER'`.
     - Người này ngay lập tức sở hữu đầy đủ quyền hạn của Quản lý: Phê duyệt/từ chối Task con (`Subtask Approval/Reject`), điều phối tiến độ, phân công thành viên và đóng/mở giai đoạn dự án.
* **File ảnh hưởng:** `fe/src/components/kanban/CreateProjectModal.tsx`, `be/src/modules/project/project.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100% (Build Pass Exit Code 0)**.

---

### [LC-102] Khóa Tài Khoản & Bảo Vệ Phiên Làm Việc Nhân Sự (Account Lock & Immediate Session Protection)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):**
  1. Khi tài khoản nhân sự bị khóa (`isActive: false`), người quản trị cần có cơ chế dọn dẹp/xóa vĩnh viễn bản ghi nếu nhân sự đã thôi việc.
  2. Nếu tài khoản chưa bị khóa mà có nút xóa ngay, Admin có thể vô tình bấm nhầm làm mất dữ liệu nhân sự đang làm việc.
* **Giải pháp kỹ thuật:**
  1. **Quy trình 2 bước bảo vệ an toàn (Two-Step Deletion Flow)**:
     - Nhân sự đang hoạt động (`Active`) chỉ có tùy chọn Khóa tài khoản (`Lock`).
     - Chỉ sau khi tài khoản đã bị Khóa (`Locked`), hệ thống mới kích hoạt hiển thị thêm **Nút Xóa Tài Khoản (Icon `Trash2` đỏ)**.
  2. **Modal Xác Nhận Độc Lập**:
     - Bật hộp thoại cảnh báo với thông điệp rõ ràng trước khi xóa vĩnh viễn khỏi danh bạ.
* **File ảnh hưởng:** `fe/src/pages/AdminUsersPage.tsx`, `fe/src/store/useUserStore.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100% (Build Pass Exit Code 0)**.

---

### [LC-103] Bảo Vệ CSDL PostgreSQL Chống Drop Dữ Liệu Tự Động (Database Persistence & Data Loss Prevention)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Lệnh khởi động container Backend chứa cờ `npx prisma db push --accept-data-loss`. Mỗi khi có sự sai khác nhẹ về schema khi restart container, Prisma tự ý xóa trắng bảng hoặc drop cột trong CSDL, gây mất dữ liệu người dùng.
* **Giải pháp kỹ thuật:**
  1. Loại bỏ hoàn toàn cờ `--accept-data-loss` khỏi `docker-compose.yml`, chuyển thành `npx prisma db push && node dist/main`.
  2. Thiết lập PostgreSQL 16 (`task_management_db`) làm Nguồn Dữ Liệu Duy Nhất (Single Source of Truth) cho toàn bộ Hồ sơ, Task, Dự án, Bình luận và Thùng rác.
* **File ảnh hưởng:** `docker-compose.yml`, `be/src/modules/profile/profile.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100% (Build Pass Exit Code 0)**.

---

### [LC-104] Kiểm Soát Quyền & Xác Thực WebSocket Gateway (Socket.IO Room Authorization & JWT Handshake Authentication)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Cổng kết nối WebSocket (`SocketGateway`) không kiểm tra chữ ký số JWT và quyền sở hữu room khi client phát lệnh `joinUser` hoặc `joinProject`. Bất kỳ client nào cũng có thể gửi event gia nhập phòng riêng của người khác và nghe lén toàn bộ tin nhắn, thông báo, cập nhật Task theo thời gian thực.
* **Hậu quả:** Nguy cơ rò rỉ dữ liệu nghiêm trọng, vi phạm tính riêng tư và bảo mật cấp doanh nghiệp.
* **Giải pháp kỹ thuật:**
  1. Tích hợp `JwtService` và `PrismaService` vào `SocketGateway` và `SocketModule`.
  2. Tự động xác thực JWT Token từ `client.handshake.auth.token` hoặc `client.handshake.headers.authorization` ngay khi kết nối.
  3. Tại `handleJoinUser`: Kiểm tra `userId` phải trùng khớp với `client.user.id` (ngoại trừ tài khoản `ADMIN`).
  4. Tại `handleJoinProject`: Truy vấn CSDL xác minh user là thành viên (`ProjectMember`), Quản lý (`managerId`), Người tạo (`createdById`) hoặc `ADMIN` trước khi cho phép `client.join(room)`.
* **File ảnh hưởng:** `be/src/modules/socket/socket.gateway.ts`, `be/src/modules/socket/socket.module.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100% (Build Pass Exit Code 0)**.

---

### [LC-105] Đồng Bộ Vai Trò Động Trong Phiên Làm Việc (JWT Dynamic Role Elevation Synchronization)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** `AuthService` tính toán nâng quyền `MANAGER` cho nhân viên đang điều hành dự án và ghi vào `payload.role` của JWT Token. Tuy nhiên, `JwtStrategy.validate` chỉ truy vấn trực tiếp bảng `users` (nơi lưu `EMPLOYEE`) và trả về `user.role = 'EMPLOYEE'`, khiến `RolesGuard` `@Roles(Role.MANAGER)` từ chối quyền truy cập (403 Forbidden).
* **Hậu quả:** Quản lý dự án không thể gọi các API quản lý được phân quyền.
* **Giải pháp kỹ thuật:**
  - Trong `JwtStrategy.validate(payload: JwtPayload)`: Đồng bộ `role: payload.role || user.role` và `globalRole: payload.role || user.role` vào `request.user` để đảm bảo `RolesGuard` nhận diện chính xác vai trò hiệu dụng.
* **File ảnh hưởng:** `be/src/modules/auth/strategies/jwt.strategy.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100% (Build Pass Exit Code 0)**.

---

### [LC-106] Khắc Phục Sai Số Thống Kê Năng Suất Cá Nhân (Personal Task Statistics Calculation Accuracy)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Hàm `ProfileService.getPersonalStats` cộng gộp `totalAssignedTasks = completedTasks + overdueTasks + inProgressTasks`. Khi 1 task `IN_PROGRESS` bị quá hạn (`overdue`), task đó bị tính trùng 2 lần; đồng thời các task ở trạng thái `TODO`, `PAUSED`, `BLOCKED`, `IN_REVIEW` chưa đến hạn bị bỏ sót hoàn toàn.
* **Hậu quả:** Số liệu tổng Task được giao bị sai lệch, biểu đồ hiệu suất nhân viên không chính xác.
* **Giải pháp kỹ thuật:**
  - Đếm `totalAssignedTasks` độc lập bằng `await this.prisma.task.count({ where: { assigneeId, isDeleted: false } })`.
  - Phân loại song song chính xác: `completedTasks` (`status: 'DONE'`), `inProgressTasks` (`status: 'IN_PROGRESS'`), `overdueTasks` (`status: { not: 'DONE' }, dueDate: { lt: now }`).
* **File ảnh hưởng:** `be/src/modules/profile/profile.service.ts`, `be/src/modules/profile/profile.service.spec.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Unit Test Passed 100%**.

---

### [LC-107] Phân Quyền Kéo Thả Điều Phối Kanban Toàn Diện Cho Quản Lý Dự Án (Manager Kanban Drag & Drop Authorization)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Backend cho phép Admin và Project Manager cập nhật trạng thái Task của nhân viên, nhưng Frontend `BoardPage.tsx` chỉ cho phép duy nhất `ADMIN` kéo thả (`isAdmin = user?.globalRole === 'ADMIN'`), khiến Manager bị khóa kéo thả và nhận thông báo lỗi quyền hạn khi điều phối công việc trên Kanban.
* **Hậu quả:** Trải nghiệm điều phối dự án của Manager bị gián đoạn.
* **Giải pháp kỹ thuật:**
  - Cập nhật điều kiện kiểm tra `isAdminOrManager` đồng bộ trên Frontend tại `handleDragEnd`, `handlePipelineDragEnd` và `isDragDisabled` trong `BoardPage.tsx`.
* **File ảnh hưởng:** `fe/src/pages/BoardPage.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100% (Build Pass Exit Code 0)**.

---

### [LC-108] Chống Rò Rỉ Bộ Nhớ Idempotency Cache (LRU/TTL Bounded Idempotency Memory Management)
* **Mức độ:** 🔵 **MEDIUM**
* **Vấn đề (Root Cause):** `IdempotencyInterceptor` lưu trữ các transaction key trong một biến JavaScript `Map` trên RAM mà không có cơ chế định kỳ giải phóng bộ nhớ cho các key quá hạn 5 phút. Khi hệ thống nhận hàng trăm nghìn request, Map sẽ phình to gây Memory Leak.
* **Hậu quả:** Làm tăng dần dung lượng RAM của Node.js process theo thời gian.
* **Giải pháp kỹ thuật:**
  - Thiết lập cơ chế tự động dọn dẹp theo chu kỳ: `setInterval(() => this.purgeExpired(), 5 * 60 * 1000).unref()`.
  - Giới hạn dung lượng tối đa `maxEntries = 2000` kèm cơ chế thu hồi FIFO khi vượt ngưỡng.
* **File ảnh hưởng:** `be/src/common/interceptors/idempotency.interceptor.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-109] Đồng Bộ Dữ Liệu Phòng Ban & Danh Sách Dự Án Thực Tế Trong Hồ Sơ Cá Nhân (Profile Department & Assigned Projects Dynamic Linking)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** API `ProfileService.updateProfile` và `getProfile` trước đây trả về chuỗi tên phòng ban tĩnh hoặc thiếu liên kết quan hệ thực (`include: { department: true }`), dẫn đến việc khi cập nhật hồ sơ cá nhân, tên Phòng ban bị mất đồng bộ hoặc hiển thị sai lệch so với bảng danh mục CSDL `Department`.
* **Giải pháp kỹ thuật:**
  - Trong `ProfileService.updateProfile`: Thêm `include: { department: true }` vào truy vấn Prisma update.
  - Phía Frontend `ProfilePage.tsx`: Hiển thị chính xác tên phòng ban từ quan hệ `user.department.name` và danh sách các dự án nhân sự đang tham gia quản lý/thực hiện.
* **File ảnh hưởng:** `be/src/modules/profile/profile.service.ts`, `fe/src/pages/ProfilePage.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-110] Tự Động Sinh & Đồng Bộ Lịch Làm Việc Theo Dải Ngày Khi Phê Duyệt Nghỉ Phép Nhiều Ngày (Multi-day Leave Request Approval Auto-Schedule Generation & GMT+7 Date Shift Prevention)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Nhân viên nộp đơn xin nghỉ phép / làm việc từ xa (WFH) kéo dài nhiều ngày (ví dụ: từ ngày 15 đến ngày 18). Khi Quản lý bấm Duyệt đơn (`reviewLeaveRequest`), hệ thống chỉ ghi nhận trạng thái của đơn mà không tự động cập nhật bảng lịch biểu làm việc hàng ngày (`WorkSchedule`), khiến lịch làm việc của nhân viên trong những ngày đó vẫn hiển thị là làm việc bình thường tại văn phòng (`OFFICE`).
* **Giải pháp kỹ thuật:**
  - Trong `ScheduleService.reviewLeaveRequest`: Khi trạng thái là `APPROVED`, hệ thống tự động duyệt vòng lặp qua từng ngày trong khoảng từ `startDate` đến `endDate`.
  - Với mỗi ngày, kích hoạt `upsert` vào bảng `WorkSchedule`: Gán `shiftType = request.type` (`LEAVE` hoặc `WFH`), ghi chú lý do và người phê duyệt.
* **File ảnh hưởng:** `be/src/modules/schedule/schedule.service.ts`, `fe/src/store/useScheduleStore.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-111] Chuẩn Hóa Lớp Phòng Thủ Type-Safety Toàn Diện & Sanitize Tệp Đính Kèm Multer (Strict Type-Safe Request Payload & Multer Buffer Security)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Nhiều hàm xử lý nghiệp vụ cốt lõi trong `TaskService` và `SocketGateway` sử dụng kiểu lỏng lẻo `user?: any`, tiềm ẩn nguy cơ runtime error khi truy cập thuộc tính `user.role` hoặc `user.id`. Đồng thời khi upload file đính kèm qua Multer memory storage, buffer chưa được ghi ra đĩa đúng cách và tên file chưa được khử độc tố (sanitize) chống path traversal.
* **Giải pháp kỹ thuật:**
  - Định nghĩa interface chuẩn `AuthUserPayload` và `AuthenticatedSocket` trong `be/src/common/interfaces/auth-user.interface.ts`.
  - Thay thế toàn bộ `user?: any` bằng `AuthUserPayload` có kiểm tra null-safety chặt chẽ.
  - Trong `TaskService.addAttachment`: Sanitize tên file bằng Regex loại bỏ toàn bộ ký tự điều khiển/path traversal, tự động tạo thư mục `uploads/` và ghi đĩa an toàn bằng `fs.writeFileSync(uploadPath, file.buffer)`.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`, `be/src/modules/socket/socket.gateway.ts`, `be/src/common/interfaces/auth-user.interface.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100% (Build Pass Exit Code 0)**.

---

### [LC-112] Tích Hợp Thống Nhất Quản Lý Lịch Trình & Đơn Từ Trực Tiếp Vào Trang Lịch & Hồ Sơ (Unified Schedule & Leave Request Routing & Navigation Redundancy Elimination)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Hệ thống có các mục điều hướng trùng lặp hoặc chưa hoàn thiện trên thanh menu (`/meetings`, `/messages`, `/remote-requests`), gây rối loạn luồng trải nghiệm của người dùng.
* **Giải pháp kỹ thuật:**
  - Loại bỏ các đường dẫn thừa khỏi thanh menu cạnh `MeteorEdgeMenu.tsx` và `App.tsx`.
  - Tích hợp trực tiếp toàn bộ luồng Đăng ký nghỉ phép / WFH (`CreateLeaveRequestModal`), Duyệt đơn nghỉ phép (`ReviewLeaveRequestsModal`) và Phân ca làm việc (`AssignScheduleModal`) vào trung tâm `/schedule` và `/profile`.
* **File ảnh hưởng:** `fe/src/App.tsx`, `fe/src/components/navigation/MeteorEdgeMenu.tsx`, `fe/src/pages/SchedulePage.tsx`, `fe/src/pages/ProfilePage.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-113] Chống Lệch Múi Giờ UTC Khi Chọn Ngày Lịch Trình & Nghỉ Phép (Timezone-Safe YYYY-MM-DD Date Key Conversion)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Khi người dùng chọn ngày 17/09/2026 ở múi giờ Việt Nam (GMT+7), hàm `date.toISOString()` tự động trừ 7 tiếng và chuyển về `2026-09-16T17:00:00.000Z`, khiến ngày hiển thị trên lịch bị thụt lùi 1 ngày so với ngày người dùng thực sự chọn.
* **Giải pháp kỹ thuật:**
  - Viết hàm helper chuẩn hóa thời gian địa phương `formatDateToKey(date: Date): string`: Trích xuất trực tiếp `date.getFullYear()`, `date.getMonth() + 1`, `date.getDate()` với tiền tố `0` để sinh định dạng `YYYY-MM-DD` cố định không phụ thuộc vào UTC offset.
* **File ảnh hưởng:** `fe/src/store/useScheduleStore.ts`, `fe/src/components/schedule/AssignScheduleModal.tsx`, `fe/src/components/schedule/CreateLeaveRequestModal.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-114] Kiểm Soát Trùng Lặp Khoảng Thời Gian Đơn Xin Nghỉ & Quy Trình Hủy Đơn An Toàn (Leave Request Overlap Prevention & Safe Cancellation Flow)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Nhân viên có thể nộp nhiều đơn xin nghỉ / WFH có dải ngày trùng lặp nhau (`startDate..endDate`), gây xung đột trong việc phân bổ ca làm việc và trùng lặp bản ghi lịch. Đồng thời thiếu cơ chế hủy đơn (`cancelLeaveRequest`) để hoàn tác lại lịch khi đơn đã được duyệt.
* **Giải pháp kỹ thuật:**
  - Trong `useScheduleStore.addLeaveRequest`: Thêm điều kiện kiểm tra giao thoa khoảng ngày `reqData.startDate <= existingEnd && reqData.endDate >= existingStart` đối với các đơn chưa bị từ chối/hủy. Ném lỗi cảnh báo nếu phát hiện trùng lặp.
  - Bổ sung hàm `cancelLeaveRequest`: Cho phép chủ sở hữu hoặc Admin hủy đơn và tự động dọn dẹp các bản ghi ca làm việc đã sinh tự động.
* **File ảnh hưởng:** `fe/src/store/useScheduleStore.ts`, `fe/src/components/schedule/CreateLeaveRequestModal.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-115] Tự Động Hủy Yêu Cầu Chuyển Giao & Hỗ Trợ Đang Treo Khi Xóa Thành Viên Khỏi Dự Án (Project Member Removal Pending Request Purge)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Khi Admin hoặc Quản lý xóa một nhân viên khỏi Dự án (`removeMember`), toàn bộ Task và Subtask được chuyển giao an toàn cho Manager. Tuy nhiên, các `TaskRequest` chuyển giao/hỗ trợ đang ở trạng thái `PENDING` do nhân viên đó gửi đi (`senderId`) hoặc gửi tới nhân viên đó (`receiverId`) vẫn bị treo trong CSDL, gây lỗi khi người nhận bấm duyệt sau đó.
* **Giải pháp kỹ thuật:**
  - Trong `ProjectService.removeMember`: Bổ sung bước dọn dẹp trong giao dịch `prisma.$transaction`, tự động cập nhật `status: 'REJECTED'` kèm ghi chú `"Tự động hủy vì nhân sự đã rời khỏi dự án"` cho toàn bộ các `TaskRequest` đang treo liên quan đến nhân sự đó trên các Task của dự án.
* **File ảnh hưởng:** `be/src/modules/project/project.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-116] Khóa Chặn Quản Trị Viên Tự Hạ Cấp Vai Trò Admin Của Chính Mình (Admin Self-Demotion Lockout Prevention)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Quản trị viên trong trang Quản lý tài khoản (`/admin/users`) có thể vô tình hoặc thao tác nhầm đổi vai trò của chính mình từ `ADMIN` thành `EMPLOYEE` qua API `updateRoleAndDepartment`, dẫn đến mất quyền truy cập Admin vĩnh viễn (Admin Lockout).
* **Giải pháp kỹ thuật:**
  - Trong `UserService.updateRoleAndDepartment`: Thêm kiểm tra `if (currentAdminId && id === currentAdminId && dto.role && dto.role !== 'ADMIN')` và ném ngoại lệ `400 Bad Request: Bạn không thể tự hạ cấp vai trò Quản trị viên (Admin) của chính mình!`.
* **File ảnh hưởng:** `be/src/modules/user/user.service.ts`, `be/src/modules/user/user.controller.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-117] Loại Bỏ Task Trong Thùng Rác & Lưu Trữ Khỏi Báo Cáo Năng Suất Phòng Ban (Department Workload Active Task Filter)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** API `DepartmentService.getWorkload` trước đây truy vấn toàn bộ các Task được gán cho nhân sự phòng ban mà không lọc cờ `isDeleted: false` và `isArchived: false`. Các Task đã bị xóa vào Thùng Rác vẫn bị tính vào tổng số lượng Task và số Task quá hạn của phòng ban.
* **Giải pháp kỹ thuật:**
  - Bổ sung `isDeleted: false, isArchived: false` vào mệnh đề `where` trong `DepartmentService.getWorkload`.
* **File ảnh hưởng:** `be/src/modules/department/department.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-118] Kiểm Tra Trùng Tên & Mã Phòng Ban Toàn Diện (Department Unique Name & Code Case-Insensitive Check)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Khi tạo mới hoặc đổi tên phòng ban, hệ thống chỉ kiểm tra phân biệt chữ hoa/thường hoặc không kiểm tra trùng lặp với các phòng ban khác khi cập nhật (`id: { not: id }`), gây lỗi vi phạm ràng buộc CSDL 500 hoặc cho phép tạo các phòng ban trùng lặp vô lý.
* **Giải pháp kỹ thuật:**
  - Trong `DepartmentService.create` & `DepartmentService.update`: Sử dụng `mode: 'insensitive'` và tự động chuẩn hóa `.trim()`, mã phòng ban tự động viết hoa `.toUpperCase()`.
* **File ảnh hưởng:** `be/src/modules/department/department.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-119] Tự Động Nhận Diện @Mention Trong Bình Luận & Gửi Thông Báo Nhắc Tên Thành Viên Dự Án (Comment @Mention Detection & Realtime Notification)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Trường thông báo `NotificationType.MENTION` đã được thiết lập trong schema nhưng chưa được kích hoạt trong `TaskService.addComment`. Khi nhân viên nhắc tên đồng nghiệp (`@FullName`) trong thảo luận, người được nhắc không nhận được thông báo chuông.
* **Giải pháp kỹ thuật:**
  - Trong `TaskService.addComment`: Tự động quét nội dung bình luận, nhận diện các thành viên dự án được nhắc tên và gửi thông báo `MENTION` qua Socket.IO và CSDL.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-120] Tự Động Sinh Task Lặp Lại & Chống Vòng Lặp Vô Hạn (Recurring Task Auto-Generation & Loop Protection)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Task có quy tắc lặp lại (`recurrenceRule: 'DAILY' | 'WEEKLY' | 'MONTHLY'`) khi hoàn thành (`status = 'DONE'`) không tự động sinh chu kỳ tiếp theo, khiến nhân sự phải tạo lại thủ công.
* **Giải pháp kỹ thuật:**
  - Trong `TaskService.updateStatus`: Khi Task có `recurrenceRule` chuyển sang `DONE`, hệ thống tự động cộng dải ngày tương ứng (+1 ngày cho DAILY, +7 ngày cho WEEKLY, +30 ngày cho MONTHLY), tạo bản ghi Task mới ở trạng thái `TODO` với tiến độ 0%, sao chép toàn bộ việc con và phát sự kiện Socket `task:created`.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-121] Chuẩn Hóa Thứ Tự Việc Con Không Âm & Chống Lỗ Hổng Khoảng Trống (Subtask Order Gap Normalization)
* **Mức độ:** 🔵 **MEDIUM**
* **Vấn đề (Root Cause):** Khi xóa hoặc kéo thả sắp xếp lại các việc con (Subtasks), chỉ số `order` có thể bị âm hoặc sinh ra các khoảng trống cách quãng (sparse indexing).
* **Giải pháp kỹ thuật:**
  - Tự động chuẩn hóa `order = max(0, maxOrder + 1)` khi tạo mới và sắp xếp theo `[order: asc, createdAt: asc]`.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-122] Khử Trùng Lặp Thẻ Nhãn Theo Dự Án & Chống Lỗ Hổng Tiêm CSS (Tag Cross-Project Isolation & Color Sanitization)
* **Mức độ:** 🔵 **MEDIUM**
* **Vấn đề (Root Cause):** Tên thẻ nhãn (Tags) có thể bị trùng lặp trong cùng một dự án hoặc mã màu tùy chỉnh không hợp lệ làm vỡ layout giao diện.
* **Giải pháp kỹ thuật:**
  - Khử trùng lặp thẻ nhãn bằng `findFirst({ where: { name, projectId } })` và áp dụng bảng màu tiêu chuẩn hệ thống Solaris Amber/Cyan/Emerald.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`, `fe/src/components/kanban/KanbanCard.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-123] Chuyển Giao An Toàn Việc Con Khi Nhân Sự Bị Xóa Khỏi Hệ Thống (Subtask Assignee Unassigned Fallback)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Khi một tài khoản nhân viên bị xóa vĩnh viễn, các việc con được gán cho nhân viên đó có nguy cơ bị lỗi khóa ngoại Foreign Key Constraint hoặc giữ ID rác.
* **Giải pháp kỹ thuật:**
  - Trong `UserService.remove`: Tự động cập nhật `subtask.assigneeId = null` trong cùng giao dịch `prisma.$transaction`.
* **File ảnh hưởng:** `be/src/modules/user/user.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-124] Phòng Vệ Chia Cho 0 Khi Tính Toán Tiến Độ Việc Con (Empty Subtasks Division-By-Zero Progress Guard)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Khi toàn bộ việc con bị xóa khỏi Task, phép tính `(completedEstimatedDays / totalEstimatedDays) * 100` có thể gặp lỗi `0 / 0 = NaN`.
* **Giải pháp kỹ thuật:**
  - Trong `recalculateTaskProgress`: Đặt điều kiện an toàn `totalEstimatedDays > 0 ? Math.round(...) : 0` đảm bảo luôn trả về số nguyên hợp lệ [0..100].
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-125] Tự Động Chuyển Giai Đoạn Mặc Định Khi Xóa Cấu Hình Pipeline (Task Stage Reassignment on Pipeline Reconfiguration)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Khi Quản lý cấu hình lại các giai đoạn trong `project.stagesJson`, các Task đang nằm ở giai đoạn bị xóa có thể mang `stageId` không còn tồn tại.
* **Giải pháp kỹ thuật:**
  - Frontend và Backend tự động gán fallback về cột mặc định theo `task.status` nếu `stageId` không khớp với danh sách pipeline hiện hành.
* **File ảnh hưởng:** `fe/src/pages/BoardPage.tsx`, `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-126] Bảo Toàn Cờ Khẩn Cấp Của Task Cha Khi Còn Việc Con Khẩn Cấp Khác (Urgent Subtask Sibling Conflict Guard)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Task cha có 2 việc con khẩn cấp (A và B). Khi hoàn thành việc con A, hệ thống không được vội hạ cờ `priority` của Task cha xuống `NORMAL` vì việc con B vẫn chưa hoàn thành.
* **Giải pháp kỹ thuật:**
  - Kiểm tra `hasUnfinishedUrgentSubtasks = subtasks.some((st) => st.isUrgent && !st.isDone)`: Chỉ hạ cờ khi toàn bộ việc con khẩn cấp đã hoàn tất.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-127] Tự Động Hoàn Tác Kéo Thả Kanban Khi Gặp Lỗi Mạng (Kanban Optimistic Rollback on Failure)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Khi người dùng kéo thẻ Kanban và mất kết nối mạng hoặc server trả về lỗi 400/403, giao diện có nguy cơ hiển thị thẻ ở cột mới sai lệch so với CSDL.
* **Giải pháp kỹ thuật:**
  - Lưu trạng thái ban đầu (`previousTasks`) trước khi kéo thả và khôi phục ngay lập tức trong khối `catch` kèm thông báo Toast lỗi.
* **File ảnh hưởng:** `fe/src/pages/BoardPage.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-128] Giải Quyết Xung Đột Kéo Thả Thẻ Đồng Thời Giữa Nhiều Quản Lý (Concurrent Multi-User Kanban Drag Resolution)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Hai Quản lý cùng mở 1 bảng Kanban và kéo cùng 1 Task sang 2 cột khác nhau trong cùng một giây.
* **Giải pháp kỹ thuật:**
  - Server thực thi trong `prisma.$transaction` và phát sóng `task:updated` qua WebSocket để toàn bộ client đồng bộ lại vị trí thẻ mới nhất.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`, `be/src/modules/socket/socket.gateway.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-129] Dọn Dẹp Phòng WebSocket Khi Chuyển Đổi Dự Án (Multi-Project Switch Socket Room Cleanup)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Khi người dùng chuyển từ Dự án A sang Dự án B, client không rời phòng socket của Dự án A (`leaveProject`), dẫn đến việc nhận thông báo và event kéo thẻ của dự án cũ.
* **Giải pháp kỹ thuật:**
  - Tự động phát `socket.emit('leaveProject', { projectId: oldId })` trước khi gia nhập phòng dự án mới `socket.emit('joinProject', { projectId: newId })`.
* **File ảnh hưởng:** `fe/src/pages/BoardPage.tsx`, `be/src/modules/socket/socket.gateway.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-130] Cô Lập Tìm Kiếm Khỏi Dữ Liệu Lưu Trữ & Thùng Rác (Kanban Search Archive & Trash Exclusion)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Thanh tìm kiếm trên Bảng Kanban có nguy cơ hiển thị các Task đã xóa hoặc đã lưu trữ nếu không ràng buộc `isDeleted: false` và `isArchived: false`.
* **Giải pháp kỹ thuật:**
  - Áp dụng bộ lọc `where.isArchived = false, where.isDeleted = false` mặc định trong toàn bộ các truy vấn tìm kiếm của Bảng công việc.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`, `fe/src/pages/BoardPage.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-131] Xác Thực Độc Lập Cho Từng Task Khi Cập Nhật Trạng Thái Hàng Loạt (Bulk Status Transition Independent Validation)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Khi cập nhật nhiều Task cùng lúc, nếu 1 Task vi phạm điều kiện (còn việc con chưa duyệt) không được để làm sập toàn bộ các Task hợp lệ khác.
* **Giải pháp kỹ thuật:**
  - Xử lý kiểm tra điều kiện độc lập trên từng Task và tổng hợp kết quả chi tiết từng mục.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-132] Tự Động Cập Nhật Huy Hiệu Số Lượng Task Trên Tiêu Đề Cột Kanban (Dynamic Column Header Badge Sync)
* **Mức độ:** 🔵 **MEDIUM**
* **Vấn đề (Root Cause):** Số lượng hiển thị trên đầu mỗi cột Kanban (ví dụ: `CẦN LÀM (5)`) không tự động nhảy số khi có Task mới tạo hoặc di chuyển qua WebSockets.
* **Giải pháp kỹ thuật:**
  - Sử dụng computed selector từ Zustand store cập nhật phản ứng tức thì (reactive) theo mảng Task thời gian thực.
* **File ảnh hưởng:** `fe/src/pages/BoardPage.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-133] Cảnh Báo Vượt Hạn Chót Dự Án Khi Mở Rộng Deadline Task (Project EndDate Schedule Overrun Alert)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Khi tạo hoặc tăng số ngày việc con khiến `task.dueDate` vượt quá ngày kết thúc của Dự án (`project.endDate`), hệ thống cần đưa ra cảnh báo kịp thời.
* **Giải pháp kỹ thuật:**
  - Hiển thị badge cảnh báo tiến độ màu hổ phách trên thẻ Task và Modal chi tiết khi `task.dueDate > project.endDate`.
* **File ảnh hưởng:** `fe/src/components/kanban/TaskDetailModal.tsx`, `fe/src/components/kanban/KanbanCard.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-134] Đóng Băng Toàn Diện Mọi Thao Tác Khi Dự Án Đã Nghiệm Thu Đóng (Completed Project Comprehensive Freeze)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Dự án đã hoàn thành (`isCompleted: true`) vẫn có nguy cơ bị nhân viên gửi yêu cầu chuyển giao hoặc thêm việc con nếu không có chốt chặn ở tầng Backend.
* **Giải pháp kỹ thuật:**
  - Kiểm tra `project.isCompleted` trong toàn bộ các API: `createTask`, `updateStatus`, `addSubtask`, `createTaskRequest`, `restoreTask` và từ chối với lỗi `400 Bad Request`.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`, `be/src/modules/project/project.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-135] Kế Thừa & Chuyển Giao Quyền Quản Lý Dự Án Toàn Diện (Project Manager Succession & Cascading Rights)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Khi bổ nhiệm Quản lý mới cho dự án, người cũ cần được giữ lại trong danh sách thành viên và người mới phải nhận ngay quyền `MANAGER`.
* **Giải pháp kỹ thuật:**
  - Tự động thêm Quản lý mới vào `ProjectMember`, nâng quyền `user.role = 'MANAGER'` và phát sóng Socket `project:updated`.
* **File ảnh hưởng:** `be/src/modules/project/project.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-136] Toàn Vẹn Liên Kết Phòng Ban Đa Chiều Cho Dự Án (Project-Department Many-to-Many Link Integrity)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Một dự án có thể phối hợp nhiều phòng ban (`ProjectDepartment`). Khi phòng ban bị xóa hoặc cập nhật, các liên kết phải được bảo toàn hoặc xóa theo tầng `onDelete: Cascade`.
* **Giải pháp kỹ thuật:**
  - Sử dụng bảng liên kết `project_departments` với khóa chính tổng hợp `@@id([projectId, departmentId])`.
* **File ảnh hưởng:** `be/prisma/schema.prisma`, `be/src/modules/department/department.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-137] Bảo Vệ Quyền Thành Viên Của Chủ Sở Hữu Dự Án (Owner Permanent Membership Protection)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Quản lý dự án không được phép xóa Chủ dự án (`createdById`) ra khỏi bảng thành viên của chính họ.
* **Giải pháp kỹ thuật:**
  - Trong `ProjectService.removeMember`: Kiểm tra `if (userIdToRemove === project.createdById)` và ném lỗi `400 Bad Request: Không thể xóa Chủ dự án khỏi dự án`.
* **File ảnh hưởng:** `be/src/modules/project/project.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-138] Bảo Toàn Lịch Sử Công Việc Khi Mở Lại Dự Án Đã Đóng (Project Reopening State Retention)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Khi mở lại một dự án đã đóng (`isCompleted: false`), trạng thái của các Task không được reset về ban đầu mà phải giữ nguyên hiện trạng lịch sử.
* **Giải pháp kỹ thuật:**
  - Chỉ cập nhật cờ `project.isCompleted = false` mà không làm thay đổi các bảng ghi `Task` và `Subtask`.
* **File ảnh hưởng:** `be/src/modules/project/project.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-139] Phân Biệt Ngày Làm Việc & Ngày Nghỉ Cuối Tuần Trong Lịch Trình (Weekend & Business Day Schedule Differentiation)
* **Mức độ:** 🔵 **MEDIUM**
* **Vấn đề (Root Cause):** Bảng lịch làm việc hiển thị các ngày Thứ 7 và Chủ Nhật cần có dấu hiệu phân biệt trực quan để tránh nhân viên nhầm lẫn ca làm việc thường nhật.
* **Giải pháp kỹ thuật:**
  - Giao diện `/schedule` hiển thị cột cuối tuần với tone màu tối dịu và biểu tượng nghỉ ngơi.
* **File ảnh hưởng:** `fe/src/pages/SchedulePage.tsx`, `fe/src/store/useScheduleStore.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-140] Kiểm Soát Dải Ngày Khi Quản Lý Phê Duyệt Nghỉ Phép Điều Chỉnh (Modified Leave Approval Date Boundary Check)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Khi Quản lý chọn duyệt đơn kèm điều chỉnh ngày (`approvedStartDate..approvedEndDate`), nếu chọn ngày bắt đầu lớn hơn ngày kết thúc sẽ làm sai lệch bảng lịch.
* **Giải pháp kỹ thuật:**
  - Ràng buộc `modifiedDates.startDate <= modifiedDates.endDate` trước khi áp dụng ca làm việc vào `workSchedules`.
* **File ảnh hưởng:** `fe/src/store/useScheduleStore.ts`, `fe/src/components/schedule/ReviewLeaveRequestsModal.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-141] Theo Dõi Quỹ Phép Năm Cá Nhân (Annual Leave Balance Tracking)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Nhân viên cần biết số ngày phép năm đã sử dụng và số ngày còn lại ngay trên trang Hồ sơ cá nhân.
* **Giải pháp kỹ thuật:**
  - Tự động cộng dồn số ngày nghỉ phép `ANNUAL_LEAVE` đã được `APPROVED` và hiển thị đồng hồ đo trực quan trong `/profile`.
* **File ảnh hưởng:** `fe/src/pages/ProfilePage.tsx`, `fe/src/store/useScheduleStore.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-142] Ưu Tiên Nguồn Dữ Liệu Khi Xếp Đè Lịch Làm Việc (Schedule Precedence & Override Hierarchy)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Lịch trình có 3 nguồn: Đơn nghỉ phép đã duyệt, Lịch do Admin xếp, và Mặc định tại văn phòng. Cần quy định rõ thứ tự ưu tiên khi hiển thị.
* **Giải pháp kỹ thuật:**
  - Thứ tự ưu tiên chuẩn: `1. Đơn Nghỉ/WFH đã duyệt > 2. Lịch Admin xếp thủ công > 3. Mặc định tại văn phòng`.
* **File ảnh hưởng:** `fe/src/store/useScheduleStore.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-143] Tính Toán Tỷ Lệ Hiện Diện Quân Số Chuẩn Xác (Daily Attendance Rate Calculation Precision)
* **Mức độ:** 🔵 **MEDIUM**
* **Vấn đề (Root Cause):** Widget thống kê quân số trong ngày cần hiển thị tỷ lệ % có mặt tại văn phòng, WFH, nghỉ phép chính xác mà không bị tràn số thập phân.
* **Giải pháp kỹ thuật:**
  - Sử dụng hàm làm tròn 1 chữ số thập phân `Math.round((count / total) * 1000) / 10` kèm bảo vệ chia cho 0.
* **File ảnh hưởng:** `fe/src/store/useScheduleStore.ts`, `fe/src/pages/SchedulePage.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-144] Luồng Đăng Ký WFH Khẩn Cấp Trong Ngày (Emergency Same-Day WFH Instant Dispatch)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Nhân sự gặp sự cố đột xuất cần WFH ngay trong buổi sáng cần gửi thông báo khẩn cấp tới Quản lý để không bị tính vắng mặt.
* **Giải pháp kỹ thuật:**
  - Hỗ trợ chọn ngày hiện tại với loại `WFH` và bắn thông báo Realtime ưu tiên cao tới Quản lý dự án.
* **File ảnh hưởng:** `fe/src/components/schedule/CreateLeaveRequestModal.tsx`, `fe/src/store/useScheduleStore.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-145] Bắt Buộc Đổi Mật Khẩu Khi Đăng Nhập Lần Đầu (First-Time Login Password Change Enforcement)
* **Mức độ:** 🔴 **CRITICAL (Security Policy)**
* **Vấn đề (Root Cause):** Tài khoản mới tạo mang mật khẩu mặc định (ví dụ: `USER123456`). Nếu người dùng không đổi mật khẩu, nguy cơ bị xâm nhập rất cao.
* **Giải pháp kỹ thuật:**
  - Kiểm tra cờ `user.isFirstLogin: true` và tự động điều hướng sang trang `OnboardingProfilePage` để thiết lập mật khẩu mới an toàn trước khi vào Dashboard.
* **File ảnh hưởng:** `be/src/modules/auth/auth.service.ts`, `fe/src/pages/OnboardingProfilePage.tsx`, `fe/src/App.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-146] Thu Hồi Refresh Token Ngay Lập Tức Khi Đăng Xuất & Khóa Tài Khoản (Immediate RefreshToken Revocation)
* **Mức độ:** 🔴 **CRITICAL (Security Policy)**
* **Vấn đề (Root Cause):** Khi tài khoản bị Admin khóa hoặc người dùng bấm Đăng xuất, nếu không xóa `refreshToken` trong CSDL thì kẻ tấn công có token cũ vẫn có thể refresh lấy AccessToken mới.
* **Giải pháp kỹ thuật:**
  - Trong `AuthService.logout` và `UserService.lockOrUnlockUser`: Gán `refreshToken = null` trong PostgreSQL ngay lập tức.
* **File ảnh hưởng:** `be/src/modules/auth/auth.service.ts`, `be/src/modules/user/user.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-147] Giao Dịch Nguyên Tố Khi Dọn Sạch Toàn Bộ Thùng Rác (Empty Trash Atomic Transaction & Cascading Purge)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Thao tác "Dọn Sạch Thùng Rác" (Empty All) nếu không bọc trong transaction có thể xóa nửa chừng gây lỗi CSDL dở dang.
* **Giải pháp kỹ thuật:**
  - Toàn bộ thao tác xóa vĩnh viễn các Task và Dự án trong thùng rác được thực thi trong 1 `prisma.$transaction`.
* **File ảnh hưởng:** `be/src/modules/trash/trash.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-148] Phân Trang & Bộ Lọc Nâng Cao Cho Nhật Ký Hoạt Động Task (Task Activity Log Multi-Filter & Pagination)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Task có hàng trăm bình luận và lịch sử cập nhật làm chậm thời gian tải modal chi tiết.
* **Giải pháp kỹ thuật:**
  - Hỗ trợ bộ lọc `filter: 'all' | 'comments' | 'history'` và sắp xếp theo `createdAt: desc` trong `TaskActivityService`.
* **File ảnh hưởng:** `be/src/modules/task/task-activity.service.ts`, `fe/src/components/kanban/TaskDetailModal.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-149] Kiểm Soát Định Dạng MIME & Dung Lượng Ảnh Đại Diện Hồ Sơ (Profile Image MIME & 5MB Size Validation)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Người dùng có thể chọn tệp không phải hình ảnh hoặc tệp dung lượng quá lớn làm avatar/ảnh bìa gây tràn bộ nhớ client.
* **Giải pháp kỹ thuật:**
  - Giới hạn dung lượng tối đa 5MB, kiểm tra định dạng ảnh hợp lệ (`image/jpeg`, `image/png`, `image/webp`) và preview tức thì trong `ProfilePage.tsx`.
* **File ảnh hưởng:** `fe/src/pages/ProfilePage.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-150] Chuẩn Hóa Độ Bền Vững Kiến Trúc & Kiểm Định 0 Lỗi Toàn Hệ Thống (Zero-Error Architectural Resilience & Strict Verification)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Hệ thống Fullstack TypeScript cần đảm bảo 100% không có lỗi biên dịch (Compilation Error), không có lỗi Type lỏng lẻo (`any`), và toàn bộ các API/Stores hoạt động mượt mà đồng bộ.
* **Giải pháp kỹ thuật:**
  - Hoàn thành kiểm định nghiêm ngặt: `nest build` và `npx tsc -b` đều đạt **Exit Code 0** trên toàn bộ 2 kho mã nguồn `be` và `fe`.
* **File ảnh hưởng:** Toàn bộ hệ thống Backend và Frontend.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100% (Milestone 150/150)**.

---

### [LC-151] Chặn Chuyển Giao Task Cho Người Đang Đảm Nhiệm Trực Tiếp (Redundant Task Assignee Assignment Guard)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Khi gửi yêu cầu chuyển giao toàn bộ Task (`createTaskRequest`), nếu người nhận (`receiverId`) trùng với người đang được phân công (`task.assigneeId`), hệ thống sẽ tạo ra yêu cầu chuyển giao dư thừa và gây khóa trạng thái `IN_REVIEW` vô nghĩa.
* **Giải pháp kỹ thuật:**
  - Trong `TaskService.createTaskRequest`: Bổ sung điều kiện kiểm tra `if (!dto.subtaskId && targetTask.assigneeId === effectiveReceiverId)` và ném lỗi `400 Bad Request: Nhân sự này đã đang trực tiếp đảm nhiệm Task này.`
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-152] Chuẩn Hóa Chuỗi Nhập Tiêu Đề / Mô Tả Task Chống Khoảng Trắng Rỗng (Task Whitespace Sanitization & Non-Empty Validation)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Người dùng nhập tiêu đề hoặc tên việc con toàn ký tự khoảng trắng (ví dụ: `"   "`), khiến thẻ Kanban hiển thị dạng ô trống vô hình làm vỡ giao diện.
* **Giải pháp kỹ thuật:**
  - Áp dụng `.trim()` cho `title`, `description`, `note` trước khi lưu vào CSDL. Từ chối nếu sau khi trim độ dài chuỗi bằng 0.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`, `be/src/modules/task/dto/create-task.dto.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-153] Kiểm Soát Toàn Vẹn Khóa Ngoại Khi Tách Thẻ Nhãn Khỏi Dự Án (Project Tag Detachment & Relational Cascade Safety)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Khi xóa hoặc gỡ thẻ nhãn (Tag) khỏi dự án, nếu bảng liên kết `TaskTag` không được xóa an toàn theo tầng có thể gây lỗi vi phạm ràng buộc Foreign Key constraint.
* **Giải pháp kỹ thuật:**
  - Thực thi xóa liên kết `TaskTag` trong `prisma.$transaction` trước khi cập nhật thẻ nhãn hoặc xóa tag của dự án.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-154] Chống Trùng Lặp Yêu Cầu Chuyển Giao / Hỗ Trợ Đang Treo (Pending TaskRequest Duplicate Guard)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Người dùng nhấp liên tục nút "Gửi Yêu Cầu" có thể tạo ra nhiều bản ghi `TaskRequest` trạng thái `PENDING` cho cùng một Task/Minitask.
* **Giải pháp kỹ thuật:**
  - Kiểm tra `findFirst({ where: { taskId, type, status: 'PENDING' } })` và từ chối nếu đang có yêu cầu chờ xử lý.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-155] Bảo Vệ An Toàn Bộ Đệm Tệp Tải Lên & Chặn Ký Tự Điều Khiển (Attachment Upload Buffer Safety & Filename Sanitization)
* **Mức độ:** 🔴 **CRITICAL (Security Policy)**
* **Vấn đề (Root Cause):** Tên file tải lên chứa ký tự điều khiển hoặc đường dẫn tương đối (`../`) có nguy cơ tấn công Path Traversal ghi đè file hệ thống.
* **Giải pháp kỹ thuật:**
  - Làm sạch tên file `file.originalname.replace(/[/\\?%*:|"<>]/g, '_')`, gắn timestamp tiền tố và ghi `file.buffer` an toàn vào thư mục `uploads/`.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-156] Kiểm Soát Tham Số Phân Trang & Chống Tràn Bộ Nhớ Thùng Rác (Trash Pagination Negative & Limit Overflow Guard)
* **Mức độ:** 🔵 **MEDIUM**
* **Vấn đề (Root Cause):** Tham số truy vấn `page <= 0` hoặc `limit` quá lớn (hàng triệu bản ghi) có thể làm tràn bộ nhớ heap Node.js hoặc gây lỗi truy vấn SQL.
* **Giải pháp kỹ thuật:**
  - Chuẩn hóa phân trang `page = Math.max(1, page)` và `limit = Math.min(100, Math.max(1, limit))`.
* **File ảnh hưởng:** `be/src/modules/trash/trash.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-157] Đóng Băng Thao Tác Khi Task Đang Nằm Trong Thùng Rác (Trash Task Mutation Comprehensive Freeze)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Người dùng có thể cố ý gọi API sửa trạng thái, bình luận hoặc chỉnh sửa việc con trên một Task đã bị chuyển vào Thùng rác (`isDeleted: true`).
* **Giải pháp kỹ thuật:**
  - Bổ sung chốt chặn `if (task.isDeleted) throw new NotFoundException('Task không tồn tại hoặc đã bị xóa vào thùng rác')` trên toàn bộ các phương thức cập nhật Subtask, Status, Comment và Attachment.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-158] Tự Động Hủy / Dọn Dẹp Thông Báo Khi Task Bị Xóa Vĩnh Viễn (Permanent Delete Notification Cascade Clean)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Khi Task bị xóa vĩnh viễn (Permanent Delete hoặc Auto-Purge 14 ngày), các thông báo cũ trỏ đến `taskId` đã mất khiến người dùng nhấp vào bị lỗi Not Found 404.
* **Giải pháp kỹ thuật:**
  - Trong quá trình xóa vĩnh viễn, thực thi xóa hoặc giải phóng liên kết các bản ghi `Notification` có `taskId` tương ứng trong cùng `prisma.$transaction`.
* **File ảnh hưởng:** `be/src/modules/trash/trash.service.ts`, `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-159] Khóa Toàn Diện Cập Nhật / Xóa Việc Con Của Task Đã Lưu Trữ (Archived Task Subtask Mutation Freeze Guard)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Task đã được đưa vào lưu trữ (`isArchived: true`) cần được bảo toàn nguyên trạng dữ liệu lịch sử, không được phép thêm, sửa hay xóa bất kỳ việc con nào.
* **Giải pháp kỹ thuật:**
  - Kiểm tra `if (subtask.task.isArchived) throw new BadRequestException('Task này đã được lưu trữ (Archived)...')` trong cả `updateSubtask` và `deleteSubtask`.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-160] Bảo Toàn Đồng Bộ Phiên Đăng Nhập & Hồ Sơ Đa Tab Trình Duyệt (Multi-Tab Auth & Session State Broadcast Synchronization)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Người dùng mở nhiều tab trình duyệt: Khi đăng xuất hoặc chuyển đổi tài khoản ở Tab 1, Tab 2 vẫn giữ nguyên token và UI cũ gây ra lỗi 401 Unauthenticated khi thao tác.
* **Giải pháp kỹ thuật:**
  - Lắng nghe sự kiện `storage` event giữa các tab để đồng bộ hóa `auth-storage` và tự động điều hướng về `/login` khi phát hiện phiên đăng nhập bị thu hồi.
* **File ảnh hưởng:** `fe/src/store/useAuthStore.ts`, `fe/src/App.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100% (Milestone 160/160)**.

---

### [LC-161] Khóa Bình Luận Khi Task Đã Lưu Trữ Hoặc Dự Án Đã Nghiệm Thu Đóng (Archived Task & Completed Project Comment Freeze)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Người dùng vẫn có thể gửi bình luận vào các Task đã lưu trữ (`isArchived: true`) hoặc thuộc Dự án đã nghiệm thu đóng (`isCompleted: true`), làm sai lệch lịch sử nghiệm thu.
* **Giải pháp kỹ thuật:**
  - Trong `TaskService.addComment`: Kiểm tra `if (targetTask.isArchived) throw new BadRequestException(...)` và `if (targetTask.project?.isCompleted) throw new BadRequestException(...)`.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-162] Giới Hạn Chiều Dài Tối Đa 5.000 Ký Tự Cho Bình Luận (Comment 5,000 Chars Max Length Boundary)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Bình luận chứa chuỗi văn bản quá dài (hàng trăm ngàn ký tự) có thể gây tràn bộ nhớ đệm WebSocket và làm nghẽn hiển thị của modal chi tiết.
* **Giải pháp kỹ thuật:**
  - Giới hạn `cleanContent.length <= 5000` và ném lỗi `400 Bad Request` nếu vượt quá ngưỡng an toàn.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-163] Chặn Thêm Thành Viên Đang Bị Khóa Tài Khoản Vào Dự Án (Locked User Project Assignment Guard)
* **Mức độ:** 🔴 **CRITICAL (Security Policy)**
* **Vấn đề (Root Cause):** Nhân viên đã bị Admin khóa tài khoản (`isLocked: true`) vẫn có nguy cơ bị Quản lý vô tình thêm vào Dự án mới.
* **Giải pháp kỹ thuật:**
  - Trong `ProjectService.addMember`: Kiểm tra `userToAdd.isLocked` và từ chối `400 Bad Request: Không thể thêm nhân sự đang bị khóa tài khoản vào dự án!`.
* **File ảnh hưởng:** `be/src/modules/project/project.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-164] Khóa Thay Đổi Thành Viên Khi Dự Án Đã Nghiệm Thu Đóng (Completed Project Member Mutation Lock)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Dự án đã đóng (`isCompleted: true`) bị chỉnh sửa thêm bớt thành viên, làm sai lệch báo cáo nhân sự tham gia dự án.
* **Giải pháp kỹ thuật:**
  - Kiểm tra `project.isCompleted` trong `addMember` và `removeMember`, chặn thao tác với lỗi `400 Bad Request`.
* **File ảnh hưởng:** `be/src/modules/project/project.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-165] Tự Động Giải Phóng Liên Kết Phòng Ban Khi Xóa Phòng Ban Khỏi Hệ Thống (Department Deletion Project Cascading Link Safety)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Khi Admin xóa phòng ban, các nhân viên thuộc phòng ban đó cần được gán `departmentId = null` an toàn trong một giao dịch.
* **Giải pháp kỹ thuật:**
  - Thực thi cập nhật `user.updateMany({ where: { departmentId: id }, data: { departmentId: null } })` trước khi xóa bản ghi `Department`.
* **File ảnh hưởng:** `be/src/modules/department/department.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-166] Kiểm Tra & Tự Động Phân Bổ Giai Đoạn Mặc Định Khi Khôi Phục Task Từ Thùng Rác (Restored Task Stage Fallback Normalization)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Task được khôi phục từ thùng rác có thể mang `stageId` của một giai đoạn quy trình đã bị Quản lý xóa hoặc sửa tên trong thời gian task nằm ở thùng rác.
* **Giải pháp kỹ thuật:**
  - Tự động map fallback về cột mặc định theo `task.status` nếu `stageId` không còn tồn tại trong cấu hình `project.stagesJson`.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`, `fe/src/pages/BoardPage.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-167] Khử Trùng Lặp Tiêu Đề Việc Con Trong Cùng Một Task (Duplicate Subtask Title Sanitization)
* **Mức độ:** 🔵 **MEDIUM**
* **Vấn đề (Root Cause):** Tạo nhiều việc con trùng tên chính xác trong cùng một Task cha gây nhầm lẫn khi nghiệm thu và gửi yêu cầu phê duyệt.
* **Giải pháp kỹ thuật:**
  - Kiểm tra trùng lặp tiêu đề việc con không phân biệt chữ hoa thường và cảnh báo người dùng.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-168] Ràng Buộc Số Ngày Dự Kiến (EstimatedDays) Phải Là Số Không Âm (Subtask Estimated Days Non-Negative Constraint)
* **Mức độ:** 🟡 **HIGH**
* **Vấn đề (Root Cause):** Nhập số ngày dự kiến âm (`estimatedDays < 0`) làm sai lệch phép tính tổng số ngày công và tỷ lệ % tiến độ của Task cha.
* **Giải pháp kỹ thuật:**
  - Ràng buộc `estimatedDays >= 0` (mặc định là 1 ngày nếu không nhập) trong toàn bộ API tạo và sửa Subtask.
* **File ảnh hưởng:** `be/src/modules/task/task.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-169] Đánh Dấu Đã Đọc Toàn Bộ Thông Báo Nguyên Tố Theo Người Dùng (Mark All Notifications Read Atomic Update)
* **Mức độ:** 🔵 **MEDIUM**
* **Vấn đề (Root Cause):** Thao tác "Đánh dấu tất cả là đã đọc" nếu không bọc an toàn theo `userId` có thể cập nhật nhầm sang thông báo của người khác hoặc bỏ sót bản ghi.
* **Giải pháp kỹ thuật:**
  - Thực thi `updateMany({ where: { userId, isRead: false }, data: { isRead: true } })` nguyên tố theo phiên người dùng hiện tại.
* **File ảnh hưởng:** `be/src/modules/notification/notification.service.ts`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-170] Khóa Tự Phê Duyệt Đơn Nghỉ Phép & Chặn Phê Duyệt Đơn Đã Đóng (Self-Approval & Finalized Leave Request Review Lock)
* **Mức độ:** 🔴 **CRITICAL**
* **Vấn đề (Root Cause):** Quản lý hoặc nhân sự có quyền duyệt không được phép tự duyệt đơn xin nghỉ phép / WFH của chính mình (`approverId === request.userId`), đồng thời các đơn đã có kết quả (`status !== 'PENDING'`) phải bị khóa không cho phép duyệt đè nhiều lần làm sai lệch dữ liệu lịch trình `workSchedules`.
* **Giải pháp kỹ thuật:**
  - Trong `useScheduleStore.ts`: Bổ sung kiểm tra `if (targetReq.userId === approverId)` và `if (targetReq.status !== 'PENDING')` trong `reviewLeaveRequest`, từ chối thao tác và giữ nguyên trạng thái Store.
* **File ảnh hưởng:** `fe/src/store/useScheduleStore.ts`, `fe/src/components/schedule/ReviewLeaveRequestsModal.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100%**.

---

### [LC-171] Đặc Quyền Admin Nghiệm Thu & Xác Nhận Hoàn Thành Dự Án Khi Roadmap Đạt 100% (Admin-Exclusive 100% Roadmap Project Completion)
* **Mức độ:** 🔴 **CRITICAL (Governance Policy)**
* **Vấn đề (Root Cause):** Việc chốt nghiệm thu đóng toàn diện một dự án (`isCompleted: true`) là quyết định quan trọng cấp tổ chức. Nếu để Quản lý dự án hoặc Nhân viên tự do đóng dự án khi chưa hoàn thành 100% tiến độ Roadmap có thể dẫn đến việc kết thúc sớm dự án sai quy định.
* **Giải pháp kỹ thuật:**
  - **Backend Guard:** Trong `ProjectService.update`, khi `updateProjectDto.isCompleted !== undefined`, kiểm tra nghiêm ngặt `user.role === 'ADMIN' || user.globalRole === 'ADMIN'`, từ chối với lỗi `403 Forbidden` nếu là tài khoản khác.
  - **Frontend UI:** Trên màn hình Master Plan & Roadmap (`BoardPage.tsx`), nút `🏆 Xác Nhận Hoàn Thành Dự Án (100% Roadmap)` chỉ được kích hoạt và hiển thị cho Quản trị viên (Admin) khi tiến độ Roadmap đạt đúng **100%** và toàn bộ các Task trong dự án đã hoàn thành. Cung cấp nút `🔄 Mở Lại Dự Án` dành riêng cho Admin nếu cần mở lại dự án sau nghiệm thu.
* **File ảnh hưởng:** `be/src/modules/project/project.service.ts`, `fe/src/pages/BoardPage.tsx`.
* **Trạng thái:** ✅ **Đã hoàn thành & Kiểm thử 100% (Milestone 171/171)**.

---

## 3. DANH MỤC CÁC CONFLICT ĐANG TIẾP TỤC THEO DÕI & TỐI ƯU HÓA (BACKLOG CONFLICTS)

| Mã ID | Tên Luồng Conflict | Mức Độ | Trạng Thái |
|:---:|:---|:---:|:---:|
| **LC-18** | Khóa sửa đổi ngày bắt đầu (`startDate`) khi đã có việc con hoàn thành | 🔴 CRITICAL | 📋 Đang theo dõi |
| **LC-19** | Cảnh báo hạn chót của Task vượt quá thời hạn kết thúc của Dự án (`project.endDate`) | 🟡 HIGH | 📋 Đang theo dõi |

---

## 📌 HƯỚNG DẪN CẬP NHẬT TÀI LIỆU DÀNH CHO DEVELOPERS
1. Khi xử lý xong bất kỳ conflict nào, ghi nhận chi tiết đầy đủ vào Mục 2 (Resolved).
2. Trình bày đầy đủ: Mức độ, Vấn đề gốc (Root Cause), Hậu quả, Giải pháp kỹ thuật, Files ảnh hưởng và Kết quả test.
3. Đảm bảo chạy `npm run test` và `npm run build` ở cả `be` và `fe` đạt **Exit Code 0** trước khi bàn giao.

