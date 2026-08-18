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

## 3. DANH MỤC CÁC CONFLICT ĐANG TIẾP TỤC THEO DÕI & TỐI ƯU HÓA (BACKLOG CONFLICTS)

| Mã ID | Tên Luồng Conflict | Mức Độ | Trạng Thái |
|:---:|:---|:---:|:---:|
| **LC-18** | Khóa sửa đổi ngày bắt đầu (`startDate`) khi đã có việc con hoàn thành | 🔴 CRITICAL | 📋 Đang theo dõi |
| **LC-19** | Cảnh báo hạn chót của Task vượt quá thời hạn kết thúc của Dự án (`project.endDate`) | 🟡 HIGH | 📋 Đang theo dõi |
| **LC-56** | Khóa đảo lộn thứ tự việc con đối với các việc con đang `PENDING` hoặc `APPROVED` | 🟡 HIGH | 📋 Đang theo dõi |

---

## 📌 HƯỚNG DẪN CẬP NHẬT TÀI LIỆU DÀNH CHO DEVELOPERS
1. Khi xử lý xong bất kỳ conflict nào, ghi nhận chi tiết đầy đủ vào Mục 2 (Resolved).
2. Trình bày đầy đủ: Mức độ, Vấn đề gốc (Root Cause), Hậu quả, Giải pháp kỹ thuật, Files ảnh hưởng và Kết quả test.
3. Đảm bảo chạy `npm run build` ở cả `be` và `fe` đạt **Exit Code 0** trước khi bàn giao.
