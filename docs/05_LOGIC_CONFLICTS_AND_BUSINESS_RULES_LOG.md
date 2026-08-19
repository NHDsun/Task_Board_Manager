# 🛡️ 05. NHẬT KÝ XỬ LÝ XUNG ĐỘT LOGIC & QUY TẮC NGHIỆP VỤ (LOGIC CONFLICTS & BUSINESS RULES LOG)

Tài liệu này là **nơi ghi nhận chính thức và duy nhất** cho toàn bộ các **Luồng Xung Đột Logic (Logic Conflicts), Điểm Nghẽn Nghiệp Vụ (Deadlocks/Race Conditions) và Quy Tắc Ràng Buộc (Business Constraints)** trong dự án Task Board Manager.

> [!IMPORTANT]
> **QUY TẮC BẮT BUỘC TỪ NAY VỀ SAU**:
> Mỗi khi phát hiện, xử lý hoặc tối ưu hóa bất kỳ Luồng Logic Conflict nào, **BẮT BUỘC PHẢI GHI NHẬN CHI TIẾT** vào tài liệu này theo đúng định dạng chuẩn dưới đây trước khi bàn giao.

---

## 📑 MỤC LỤC TỔNG QUAN

- [1. Quy Chuẩn Đánh Giá & Phân Loại Conflict](#1-quy-chuẩn-đánh-giá--phân-loại-conflict)
- [2. Danh Sách Các Logic Conflict ĐÃ XỬ LÝ TRIỆT ĐỂ (Resolved Conflicts)](#2-danh-sách-các-logic-conflict-đã-xử-lý-triệt-để-resolved-conflicts)
  - [LC-01: Tự Động Duyệt Cho Quản Lý (Self-Approval Flow)](#lc-01-tự-động-duyệt-cho-quản-lý-self-approval-flow)
  - [LC-02: Quyền Mở Lại Việc Con Đã Duyệt Nhầm (Reopen Subtask Flow)](#lc-02-quyền-mở-lại-việc-con-đã-duyệt-nhầm-reopen-subtask-flow)
  - [LC-03: Gửi Duyệt Lại Khi Bị Từ Chối (Resubmit Subtask Flow)](#lc-03-gửi-duyệt-lại-khi-bị-từ-chối-resubmit-subtask-flow)
  - [LC-04: Tự Động Đồng Bộ & Co Giãn Deadline Tổng (Dynamic DueDate Sync)](#lc-04-tự-động-đồng-bộ--co-giãn-deadline-tổng-dynamic-duedate-sync)
  - [LC-05: Dọn Dẹp Yêu Cầu Duyệt Treo Khi Chuyển Giao Task (Task Transfer Cleanup)](#lc-05-dọn-dẹp-yêu-cầu-duyệt-treo-khi-chuyển-giao-task-task-transfer-cleanup)
  - [LC-06: Chống Giật Nhấp Nháy Tiến Độ Khi Nhân Viên Nộp Duyệt (Optimistic UI Progress Lock)](#lc-06-chống-giật-nhấp-nháy-tiến-độ-khi-nhân-viên-nộp-duyệt-optimistic-ui-progress-lock)
  - [LC-07: Ràng Buộc Bắt Buộc Phân Công Task Trước Khi Thực Hiện (Unassigned Task Freeze)](#lc-07-ràng-buộc-bắt-buộc-phân-công-task-trước-khi-thực-hiện-unassigned-task-freeze)
  - [LC-08: Chặn Lách Duyệt Bằng Kéo Thả Thẻ Kanban Sang DONE (Kanban DONE Drag Block)](#lc-08-chặn-lách-duyệt-bằng-kéo-thả-thẻ-kanban-sang-done-kanban-done-drag-block)
  - [LC-09: Tự Động Chuyển Trạng Thái DONE & IN_PROGRESS Khi Đạt 100% (Auto Status Sync)](#lc-09-tự-động-chuyển-trạng-thái-done--in_progress-khi-đạt-100-auto-status-sync)
  - [LC-10: Đóng Băng Thao Tác Subtask Khi Task Đang PAUSED / BLOCKED (State Freeze)](#lc-10-đóng-băng-thao-tác-subtask-khi-task-đang-paused--blocked-state-freeze)
  - [LC-11: Loại Bỏ Thông Báo Ma Cho Task Đã Bị Xóa (Ghost Notification Elimination)](#lc-11-loại-bỏ-thông-báo-ma-cho-task-đã-bị-xóa-ghost-notification-elimination)
  - [LC-12: Khóa Sửa Số Ngày Ước Lượng & Phân Quyền Subtask Assignee (EstimatedDays Lock)](#lc-12-khóa-sửa-số-ngày-ước-lượng--phân-quyền-subtask-assignee-estimateddays-lock)
- [3. Danh Mục Các Conflict Đang Phân Tích & Chuẩn Bị Xử Lý (Backlog Conflicts)](#3-danh-mục-các-conflict-đang-phân-tích--chuẩn-bị-xử-lý-backlog-conflicts)

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

## 3. DANH MỤC CÁC CONFLICT ĐANG TIẾP TỤC THEO DÕI & TỐI ƯU HÓA (BACKLOG CONFLICTS)

| Mã ID | Tên Luồng Conflict | Mức Độ | Trạng Thái |
|:---:|:---|:---:|:---:|
| **LC-18** | Khóa sửa đổi ngày bắt đầu (`startDate`) khi đã có việc con hoàn thành | 🔴 CRITICAL | 📋 Đang theo dõi |
| **LC-19** | Cảnh báo hạn chót của Task vượt quá thời hạn kết thúc của Dự án (`project.endDate`) | 🟡 HIGH | 📋 Đang theo dõi |

---

## 📌 HƯỚNG DẪN CẬP NHẬT TÀI LIỆU DÀNH CHO DEVELOPERS
1. Khi xử lý xong bất kỳ conflict nào, ghi nhận chi tiết đầy đủ vào Mục 2 (Resolved).
2. Trình bày đầy đủ: Mức độ, Vấn đề gốc (Root Cause), Hậu quả, Giải pháp kỹ thuật, Files ảnh hưởng và Kết quả test.
3. Đảm bảo chạy `npm run build` ở cả `be` và `fe` đạt **Exit Code 0** trước khi bàn giao.
