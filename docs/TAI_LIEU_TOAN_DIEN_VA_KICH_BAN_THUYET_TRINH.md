# 🌟 SOLARIS - TÀI LIỆU TOÀN DIỆN HỆ THỐNG VÀ KỊCH BẢN THUYẾT TRÌNH DỰ ÁN

> **Phiên bản:** 2.0 (Cập nhật toàn diện sau khi quét mã nguồn)  
> **Nền tảng:** Enterprise Agile Task Board & Workflow Management Platform  
> **Ngôn ngữ:** Tiếng Việt & English (Bilingual Tech Terms)  
> **Mục đích:** Tài liệu tham chiếu chi tiết từng chức năng kỹ thuật và Kịch bản Demo / Thuyết trình trực tiếp cho buổi bảo vệ dự án / thuyết trình sản phẩm.

---

## MỤC LỤC TỔNG QUAN

1. [TỔNG QUAN HỆ THỐNG & BỐI CẢNH DỰ ÁN](#1-tổng-quan-hệ-thống--bối-cảnh-dự-án)
2. [KIẾN TRÚC KỸ THUẬT & CÔNG NGHỆ (TECH STACK)](#2-kiến-trúc-kỹ-thuật--công-nghệ-tech-stack)
3. [CHI TIẾT CƠ SỞ DỮ LIỆU & PRISMA SCHEMA](#3-chi-tiết-cơ-sở-dữ-liệu--prisma-schema)
4. [PHÂN TÍCH TỪNG MODULE CHỨC NĂNG CỐT LÕI](#4-phân-tích-từng-module-chức-năng-cốt-lõi)
   - 4.1. [Xác Thực & Phân Quyền Đa Tầng (Auth & RBAC)](#41-xác-thực--phân-quyền-đa-tầng-auth--rbac)
   - 4.2. [Bảng Công Việc Kanban 6 Trạng Thái & Fixed DND Portal](#42-bảng-công-việc-kanban-6-trạng-thái--fixed-dnd-portal)
   - 4.3. [Quy Trình Pipeline Giai Đoạn & Chế Độ Focus](#43-quy-trình-pipeline-giai-đoạn--chế-độ-focus)
   - 4.4. [Vòng Đời Subtask & Cơ Chế Phê Duyệt Kỹ Thuật](#44-vòng-đời-subtask--cơ-chế-phê-duyệt-kỹ-thuật)
   - 4.5. [Ủy Quyền & Chuyển Giao Công Việc (Task Delegation)](#45-ủy-quyền--chuyển-giao-công-việc-task-delegation)
   - 4.6. [Trợ Lý Giọng Nói AI Song Ngữ (Groq Whisper & LLaMA 3.3)](#46-trợ-lý-giọng-nói-ai-song-ngữ-groq-whisper--llama-33)
   - 4.7. [Quản Lý Lịch Trình, Đi Ca & Nghỉ Phép (WFH / Leave Management)](#47-quản-lý-lịch-trình-đi-ca--nghỉ-phép-wfh--leave-management)
   - 4.8. [Quản Trị Tổ Chức, Phòng Ban & Hồ Sơ Nhân Sự](#48-quản-trị-tổ-chức-phòng-ban--hồ-sơ-nhân-sự)
   - 4.9. [Thùng Rác Hệ Thống Lưu Trữ An Toàn 14 Ngày (14-Day Recycle Bin)](#49-thùng-rác-hệ-thống-lưu-trữ-an-toàn-14-ngày-14-day-recycle-bin)
   - 4.10. [Hạ Tầng Đồng Bộ Thời Gian Thực (Socket.IO Real-time Engine)](#410-hạ-tầng-đồng-bộ-thời-gian-thực-socketio-real-time-engine)
5. [KỊCH BẢN / LUỒNG ĐI THUYẾT TRÌNH DEMO HOÀN CHỈNH (STEP-BY-STEP)](#5-kịch-bản--luồng-đi-thuyết-trình-demo-hoàn-chỉnh-step-by-step)
6. [BẢNG CÂU HỎI VÀ TRẢ LỜI PHẢN BIỆN (Q&A DEFENSE)](#6-bảng-câu-hỏi-và-trả-lời-phản-biện-qa-defense)

---

## 1. TỔNG QUAN HỆ THỐNG & BỐI CẢNH DỰ ÁN

### 1.1. Vấn đề thực tế (Pain Points)
Trong các doanh nghiệp phần mềm và các đội ngũ công nghệ hiện đại:
- **Tạo task thủ công rườm rà:** Kỹ sư hoặc Project Manager (PM) thường mất từ 2-4 phút để điền form, gắn tag, chọn deadline và gán người thực hiện trên các nền tảng như Jira hay Trello.
- **Rào cản ngôn ngữ Code-Switching (Vietglish):** Khi giao tiếp hàng ngày, lập trình viên thường nói xen kẽ thuật ngữ kỹ thuật tiếng Anh (*"Fix bug API Authentication", "Review PR Backend", "Deploy Staging"*). Các trợ lý ảo thông thường không nhận diện được ngữ âm này mà biến thành văn bản sai chính tả trầm trọng.
- **Tách rời giữa Tiến độ dự án và Sự hiện diện nhân sự (Presence & Availability):** Giao việc cho một nhân sự đang nghỉ phép hoặc WFH mà không nắm rõ lịch trình dẫn đến chậm trễ sprint.
- **Thiếu cơ chế an toàn dữ liệu:** Xóa nhầm task hoặc project dẫn đến mất mát dữ liệu vĩnh viễn nếu không có cơ chế thùng rác tạm giữ có thời hạn.

### 1.2. Giải pháp của SOLARIS
**SOLARIS** là nền tảng quản trị công việc và quy trình doanh nghiệp khép kín, kết hợp:
1. **Quản lý linh hoạt:** Kanban Matrix 6 cột, Pipeline quản lý tiến trình bàn giao, và Focus Mode ưu tiên việc cấp bách.
2. **AI Voice Assistant đột phá:** Nhận diện giọng nói song ngữ Tiếng Việt & Tiếng Anh, trích xuất cấu trúc công việc tự động và hiển thị modal xác nhận thông minh.
3. **Quản trị hiện diện nhân sự (Workforce Scheduling):** Lịch công tác/WFH/Nghỉ phép tích hợp trực tiếp cạnh tiến độ task.
4. **Cơ chế an toàn 14 ngày (Soft-delete Recycle Bin):** Tự động đếm ngược và khôi phục toàn vẹn dữ liệu cha-con.
5. **Real-time WebSockets:** Mọi thao tác kéo thả, giao việc, phê duyệt được cập nhật tức thì tới toàn bộ thành viên.

---

## 2. KIẾN TRÚC KỸ THUẬT & CÔNG NGHỆ (TECH STACK)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND CLIENT (React 19)                      │
│  - Vite 8, TypeScript 6.0, TailwindCSS v4                              │
│  - Zustand 5 (Global Stores: Auth, User, Kanban, Schedule, Notify)     │
│  - @hello-pangea/dnd (Custom Fixed DND Portal Container)               │
│  - Web Audio API (MediaRecorder WebM -> Float32 Audio Stream)          │
│  - Socket.io Client (Real-time Event Listeners & Room Synchronization) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP REST / WebSocket
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND API (NestJS 11)                         │
│  - TypeScript, Modular Architecture, Nest Guards & Interceptors        │
│  - JWT & Passport Authentication, Refresh Token Rotation               │
│  - Socket.IO Gateway (Room-based: project:{id}, user:{id})             │
│  - Idempotency Interceptor (Chống trùng lặp dữ liệu)                  │
│  - Notification Engine (In-app + Realtime WebSockets)                 │
└──────────────┬──────────────────────────────────────────┬──────────────┘
               │                                          │
               ▼                                          ▼
┌──────────────────────────────┐          ┌──────────────────────────────┐
│     POSTGRESQL 16 DATABASE   │          │       GROQ AI CLOUD API      │
│  - Prisma ORM 7 Engine       │          │  - Whisper Large-v3 (STT)    │
│  - 14 Relational Models      │          │  - LLaMA 3.3 70B (NLU/JSON)  │
│  - Soft Delete & Retention   │          │  - Phonetic Normalizer       │
└──────────────────────────────┘          └──────────────────────────────┘
```

### Chi tiết các tầng công nghệ:
| Tầng | Công nghệ / Thư viện | Vai trò & Điểm nổi bật |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + Vite 8 | Tối ưu hóa hiệu năng render, khởi động cực nhanh với Hot Module Replacement. |
| **Giao diện & Styling** | TailwindCSS v4 + Lucide Icons | Thiết kế Dark Mode phong cách Sci-fi/Cyberpunk, hiệu ứng kính mờ Glassmorphism. |
| **State Management** | Zustand 5 | Quản lý state gọn nhẹ, loại bỏ boilerplate phức tạp của Redux, chia nhỏ store theo miền nghiệp vụ. |
| **Drag and Drop** | @hello-pangea/dnd | Xây dựng cơ chế **Dedicated Portal (`solar-dnd-portal`)** cố định, triệt tiêu hoàn toàn lỗi nhấp nháy thanh cuộn. |
| **Backend Framework** | NestJS 11 | Kiến trúc module tiêu chuẩn doanh nghiệp, Dependency Injection mạnh mẽ, hỗ trợ Interceptor và Pipes. |
| **Cơ sở dữ liệu & ORM** | PostgreSQL 16 + Prisma ORM 7 | Hệ thống định kiểu TypeScript nghiêm ngặt từ database đến code, quan hệ thực thể an toàn. |
| **Xử lý AI / LLM** | Groq Whisper Large-v3 & LLaMA 3.3 70B | Tốc độ suy luận (Inference) siêu nhanh (dưới 1 giây), xử lý chuẩn xác khẩu lệnh song ngữ. |
| **Realtime Engine** | Socket.IO 4.x | Quản lý kết nối theo Room bảo mật, phân phối sự kiện tức thời. |
| **Bảo mật & Auth** | JWT, Passport, BCrypt, Google OAuth | Token phân cấp, refresh token định kỳ, xác thực OAuth2 với Google. |

---

## 3. CHI TIẾT CƠ SỞ DỮ LIỆU & PRISMA SCHEMA

Hệ thống sở hữu cơ sở dữ liệu quan hệ hoàn chỉnh với **14 bảng thực thể chính** và các **Enum nghiệp vụ**:

### 3.1. Danh mục Enum cốt lõi
- `Role`: `ADMIN` | `MANAGER` | `EMPLOYEE`
- `Profession`: `DEV` | `TESTER` | `DESIGNER` | `BA` | `MARKETING` | `DEVOPS` | `PRODUCT_OWNER`
- `UserStatusSignal`: `ONLINE` | `BUSY` | `IN_MEETING` | `AWAY` | `OFFLINE`
- `TaskStatus`: `TODO` | `IN_PROGRESS` | `PAUSED` | `BLOCKED` | `IN_REVIEW` | `DONE`
- `TaskPriority`: `LOW` | `NORMAL` | `IMPORTANT` | `URGENT`
- `WorkType`: `OFFICE` | `WFH` | `ON_SITE` | `LEAVE`
- `WorkShift`: `FULL_DAY` | `MORNING` (0.5 ngày) | `AFTERNOON` (0.5 ngày)
- `LeaveType`: `WFH` | `ANNUAL_LEAVE` | `SICK_LEAVE` | `UNPAID_LEAVE` | `MATERNITY_LEAVE` | `OTHER`
- `LeaveStatus`: `PENDING` | `APPROVED` | `APPROVED_MODIFIED` | `REJECTED` | `CANCELLED`
- `TaskRequestType`: `TRANSFER` | `ASSIST` | `REVIEW` | `SUBTASK_APPROVAL`
- `TaskRequestStatus`: `PENDING` | `ACCEPTED` | `REJECTED` | `CANCELLED`

### 3.2. Sơ đồ các bảng dữ liệu (Data Models)
1. **`users`**: Thông tin người dùng, mật khẩu mã hóa BCrypt, Google ID, trạng thái hiện diện, avatar, coverImage, liên kết phòng ban, token.
2. **`departments`**: Phòng ban tổ chức doanh nghiệp (IT, Design, Product, QC...).
3. **`projects`**: Dự án làm việc, người sở hữu (`createdById`), quản lý (`managerId`), cấu hình giai đoạn (`stagesJson`), cờ xóa mềm (`isDeleted`, `deletedAt`).
4. **`project_members` & `project_departments`**: Quan hệ Many-to-Many giữa dự án với thành viên và phòng ban.
5. **`tasks`**: Bảng dữ liệu trung tâm. Lưu trạng thái (6 cột), độ ưu tiên (4 mức), tiến độ (0-100%), hạn chót (`dueDate`), ghi âm gốc (`rawVoice`), giai đoạn (`stageId`), cờ xóa mềm 14 ngày (`isDeleted`, `deletedAt`).
6. **`subtasks`**: Nhiệm vụ con chi tiết. Quản lý hạn mức thời gian (`estimatedDays`), người làm riêng biệt, trạng thái duyệt (`approvalStatus`: `PENDING` / `APPROVED` / `REJECTED`) và lý do từ chối.
7. **`task_requests`**: Quản lý các yêu cầu điều phối việc: Chuyển giao task, nhờ hỗ trợ, gửi review và duyệt subtask giữa các nhân sự.
8. **`task_histories`**: Nhật ký kiểm toán (Audit Trail) ghi lại mọi thay đổi trên task: ai đã đổi trạng thái, đổi hạn chót, đổi độ ưu tiên.
9. **`comments` & `attachments`**: Thảo luận theo thời gian thực và đính kèm tài liệu/đường link tham chiếu.
10. **`tags` & `task_tags`**: Hệ thống nhãn màu phân loại công việc theo dự án.
11. **`voice_command_logs`**: Nhật ký lưu trữ mọi khẩu lệnh giọng nói: văn bản thô (`rawAudioText`), JSON phân tích (`parsedJson`), thời gian xử lý (`processingTimeMs`), trạng thái (`SUCCESS`/`FAILED`).
12. **`work_schedules`**: Lịch trực và ca làm việc chi tiết của từng nhân sự theo ngày và ca (`userId`, `date`, `shift`, `workType`).
13. **`leave_requests`**: Đơn xin nghỉ phép, xin WFH, kế hoạch bàn giao công việc (`handoverPlan`), phản hồi duyệt và kế hoạch điều chỉnh của cấp quản lý (`modifiedTasksPlan`).
14. **`notifications`**: Trung tâm thông báo đẩy đa loại hình (phân công việc, duyệt đơn, nhắc hạn, chuyển giao task).

---

## 4. PHÂN TÍCH TỪNG MODULE CHỨC NĂNG CỐT LÕI

### 4.1. Xác Thực & Phân Quyền Đa Tầng (Auth & RBAC)
- **Cơ chế:** Kết hợp xác thực truyền thống (Email/Password mã hóa Salted BCrypt) và Google OAuth2 Single Sign-On (SSO).
- **Hệ thống phân quyền 3 cấp độ:**
  - **ADMIN:** Toàn quyền hệ thống. Quản trị toàn bộ nhân sự, tạo/sửa phòng ban, điều chuyển nhân sự hàng loạt, can thiệp thùng rác 14 ngày, phân bổ lịch làm việc trực tiếp cho bất kỳ ai.
  - **MANAGER:** Quản lý dự án, điều phối công việc, duyệt đơn xin nghỉ phép/WFH của phòng ban, duyệt các yêu cầu subtask và bàn giao việc.
  - **EMPLOYEE:** Nhận việc, kéo thả trạng thái task của chính mình, cập nhật checklist subtask, gửi đơn xin nghỉ/WFH, yêu cầu chuyển giao công việc.
- **Onboarding cho người dùng mới:** Người dùng đăng nhập lần đầu được chuyển hướng đến màn hình Onboarding để cập nhật ảnh đại diện, chức danh, chuyên môn trước khi vào không gian làm việc.

### 4.2. Bảng Công Việc Kanban 6 Trạng Thái & Fixed DND Portal
- **6 Cột quy trình chuẩn mực:**
  1. `TODO`: Chờ thực hiện.
  2. `IN_PROGRESS`: Đang tiến hành.
  3. `PAUSED`: Tạm hoãn (chờ thông tin bên ngoài).
  4. `BLOCKED`: Bị nghẽn (gặp sự cố kỹ thuật cần gỡ).
  5. `IN_REVIEW`: Chờ kiểm thử & đánh giá chất lượng.
  6. `DONE`: Đã nghiệm thu và hoàn tất.
- **Giải pháp kỹ thuật Fixed Portal:** Sử dụng `@hello-pangea/dnd` kết hợp với thẻ Portal cố định trên DOM (`solar-dnd-portal`, `position: fixed, z-index: 999999`). Giải pháp này giải quyết triệt để lỗi giật giao diện (layout shift) hoặc xuất hiện thanh cuộn ngang/dọc bất thường khi kéo card trên màn hình lớn.
- **Quy tắc sở hữu (Ownership Rules):** Kiểm tra quyền sở hữu trước khi kéo thả. Thành viên chỉ được phép di chuyển task thuộc quyền hạn của mình hoặc do mình tạo.

### 4.3. Quy Trình Pipeline Giai Đoạn & Chế Độ Focus
- **Chế độ xem Pipeline:** Theo dõi dự án theo chuỗi 6 giai đoạn phát triển phần mềm:
  1. *Yêu Cầu & Phân Tích* -> 2. *Thiết Kế UI/UX* -> 3. *Lập Trình Backend/Frontend* -> 4. *Kiểm Thử QA/QC* -> 5. *Chạy Thử Staging* -> 6. *Bàn Giao & Nghiệm Thu*.
- **Stage Locking:** Cho phép Quản lý khóa/mở các giai đoạn để kiểm soát tiến độ bàn giao sprint.
- **Focus Mode:** Bộ lọc tập trung loại bỏ nhiễu, chỉ hiển thị những task thuộc diện `URGENT` hoặc đang `IN_PROGRESS` của người dùng hiện tại.

### 4.4. Vòng Đời Subtask & Cơ Chế Phê Duyệt Kỹ Thuật
- Cho phép chia nhỏ 1 task lớn thành nhiều subtask độc lập, có thể giao cho nhiều nhân sự khác nhau với số ngày ước tính (man-days).
- **Cơ chế duyệt 3 trạng thái:** `PENDING` -> `APPROVED` hoặc `REJECTED`. Khi người thực hiện hoàn thành một subtask quan trọng, hệ thống tự động gửi thông báo đến Manager/Creator để nghiệm thu kèm lý do phản hồi nếu từ chối.

### 4.5. Ủy Quyền & Chuyển Giao Công Việc (Task Delegation)
- Khi một lập trình viên bị quá tải hoặc cần nghỉ ốm đột xuất, họ có thể dùng tính năng **Chuyển giao task (Task Transfer / Delegation)**.
- Người nhận sẽ nhận được thông báo thời gian thực và mục kiểm tra trong **Hộp thư chuyển giao (Transfer Inbox)** để xem chi tiết lý do, chấp thuận (nhận trách nhiệm) hoặc từ chối (trả về người cũ).

### 4.6. Trợ Lý Giọng Nói AI Song Ngữ (Groq Whisper & LLaMA 3.3)
Đây là **tính năng sáng tạo và công nghệ nổi bật nhất** của Solaris:
1. **Thu âm trình duyệt:** Sử dụng Web Audio API thu âm trực tiếp định dạng WebM.
2. **Groq Whisper Large-v3 STT:** Chuyển đổi giọng nói thành văn bản cực nhanh với prompt ngữ cảnh ép nhận diện chuẩn xác thuật ngữ kỹ thuật IT.
3. **Bộ chuẩn hóa ngữ âm âm học (Phonetic Normalizer):** Xử lý triệt để các biến thể phát âm Vietglish của lập trình viên:
   - *"phích bấc"* -> `"fix bug"`
   - *"đét lai / đết lai"* -> `"deadline"`
   - *"bác en / ba ken"* -> `"backend"`
   - *"o thên / ót thên"* -> `"authentication"`
   - *"súp tát / súp task"* -> `"subtask"`
   - *"u gần / ưa gần"* -> `"urgent"`
4. **LLaMA 3.3 70B Structured Extraction:** Trích xuất thông minh thành JSON: Tách biệt rõ ràng Title công việc, Độ ưu tiên (`LOW`, `NORMAL`, `IMPORTANT`, `URGENT`), Deadline tính toán theo ngữ cảnh ngày hiện tại, và tự động đối soát (Fuzzy matching) tên nhân sự với cơ sở dữ liệu thật.
5. **Modal Xem Trước & Tương Tác (Preview & Edit Modal):** Trước khi task được tạo vào database, người dùng được xem trước toàn bộ thông tin đã trích xuất, có thể chỉnh sửa lại tiêu đề, đổi nhân sự hoặc chọn lại dự án rồi mới ấn xác nhận.

### 4.7. Quản Lý Lịch Trình, Đi Ca & Nghỉ Phép (WFH / Leave Management)
- **Lịch làm việc đa góc nhìn (Calendar Header):** Chế độ xem theo Tháng (Month), theo Tuần (Week Timeline), và theo Ngày (Day Schedule).
- **Đăng ký nghỉ / WFH:** Hỗ trợ chọn ca (Cả ngày, Ca sáng 0.5 ngày, Ca chiều 0.5 ngày), nhập kế hoạch bàn giao công việc (`handoverPlan`).
- **Trung tâm xét duyệt của Quản lý:** Manager/Admin có thể phê duyệt nguyên trạng, từ chối kèm lý do, hoặc điều chỉnh ngày duyệt và kế hoạch xử lý task (`APPROVED_MODIFIED`).
- **Phân bổ ca trực tiếp (Direct Shift Assignment):** Cấp quản trị có thể gán lịch làm việc trực tiếp (Văn phòng, WFH, Công tác, Nghỉ) cho nhân viên mà không cần chờ nộp đơn.

### 4.8. Quản Trị Tổ Chức, Phòng Ban & Hồ Sơ Nhân Sự
- **Tín hiệu hiện diện thời gian thực (Presence Signal):** Hiển thị trạng thái Online, Bận, Trong cuộc họp, Đi vắng, Offline tự động theo hành vi người dùng.
- **Tín hiệu địa điểm làm việc (Work Location Signal):** Tại văn phòng (Office HQ), Làm việc từ xa (WFH), Đi công tác (On-Site), Nghỉ phép (On Leave).
- **Quản lý phòng ban & Điều chuyển hàng loạt:** Admin có thể tạo mới phòng ban, chuyển toàn bộ nhân viên từ phòng ban này sang phòng ban khác chỉ với 1 cú click.

### 4.9. Thùng Rác Hệ Thống Lưu Trữ An Toàn 14 Ngày (14-Day Recycle Bin)
- **Bảo vệ an toàn dữ liệu:** Task hoặc Project khi bị xóa sẽ không mất vĩnh viễn mà được chuyển vào trạng thái xóa mềm (`isDeleted = true, deletedAt = now()`).
- **Đồng hồ đếm ngược 14 ngày:** Giao diện hiển thị rõ ràng số ngày và giờ còn lại trước khi bị thanh trừng tự động.
- **Khôi phục liên kết cha-con (Cascade Restore):** Khi khôi phục một task mà dự án cha của nó cũng đang trong thùng rác, hệ thống tự động thông báo và hỗ trợ khôi phục trọn vẹn cả dự án cha.
- **Quyền hạn Admin:** Chỉ Admin mới có quyền xóa vĩnh viễn (Permanent Purge) hoặc dọn sạch thùng rác (Empty All).

### 4.10. Hạ Tầng Đồng Bộ Thời Gian Thực (Socket.IO Real-time Engine)
- **Phân chia phòng thông minh:**
  - `project:${projectId}`: Phát sự kiện tạo task (`task:created`), di chuyển task (`task:moved`), cập nhật trạng thái (`task:updated`), xóa task (`task:deleted`).
  - `user:${userId}`: Phát thông báo cá nhân bảo mật (`notification:new`), yêu cầu duyệt subtask, lời mời chuyển giao task.

---

## 5. KỊCH BẢN / LUỒNG ĐI THUYẾT TRÌNH DEMO HOÀN CHỈNH (STEP-BY-STEP)

> **Thời lượng đề xuất:** 12 - 15 phút  
> **Tài khoản chuẩn bị sẵn:**
> - `huydatne@gmail.com` / `admin123` (Admin - Toàn quyền)
> - `manager@solaris.io` / `manager123` (Manager - Trình duyệt ẩn danh 1)
> - `employee@solaris.io` / `employee123` (Employee - Trình duyệt ẩn danh 2)

```
┌────────────────────────────────────────────────────────────────────────┐
│                   TIMELINE THUYẾT TRÌNH ĐỀ XUẤT                         │
│                                                                        │
│  [00:00 - 02:00]  Đặt Vấn Đề & Giới Thiệu Dự Án SOLARIS                │
│  [02:00 - 03:30]  Kiến Trúc Kỹ Thuật & Giao Diện Tổng Quan             │
│  [03:30 - 06:00]  LIVE DEMO 1: Kanban Matrix 6 Cột & Subtask Lifecycle │
│  [06:00 - 08:00]  LIVE DEMO 2: Lịch Trực & Quản Lý WFH / Nghỉ Phép     │
│  [08:00 - 10:00]  LIVE DEMO 3: Quản Trị RBAC & Thùng Rác An Toàn 14D   │
│  [10:00 - 13:00]  LIVE DEMO 4 (GRAND FINALE): AI Voice Assistant Song Ngữ🔥│
│  [13:00 - 15:00]  Tổng Kết, Định Hướng Tương Lai & Q&A                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

### BƯỚC 1: MỞ ĐẦU & ĐẶT VẤN ĐỀ (00:00 - 02:00)
- **Lời dẫn gợi ý:**
  > *"Kính chào quý thầy cô / ban giám khảo / quý đối tác. Trong kỷ nguyên phát triển phần mềm Agile hiện nay, sự phối hợp nhịp nhàng giữa Product Owner, Project Manager và Software Engineer là yếu tố sống còn. Tuy nhiên, các công cụ hiện nay như Jira hay Trello thường quá nặng nề, tốn nhiều thời gian tạo task thủ công, và hoàn toàn tách rời giữa tiến độ công việc với sự hiện diện thực tế (WFH/Nghỉ phép) của nhân sự.*  
  > *Đặc biệt tại Việt Nam, các lập trình viên thường giao tiếp bằng ngôn ngữ pha trộn (Vietglish), khiến các công cụ nhận diện giọng nói thông thường hoàn toàn bất lực.*  
  > *Để giải quyết triệt để những bài toán trên, nhóm chúng em đã phát triển **SOLARIS** - Nền tảng điều phối công việc và quy trình doanh nghiệp thế hệ mới, tích hợp ma trận Kanban 6 trạng thái, quản lý lịch làm việc linh hoạt, cơ sở hạ tầng thời gian thực WebSockets và đặc biệt là Trợ lý giọng nói AI song ngữ đột phá."*

---

### BƯỚC 2: KIẾN TRÚC KỸ THUẬT & GIAO DIỆN CHÍNH (02:00 - 03:30)
- **Thao tác:** Đăng nhập tài khoản Admin `huydatne@gmail.com`.
- **Điểm nhấn trình bày:**
  - Giới thiệu giao diện Cyberpunk Dark Theme hiện đại, giảm mỏi mắt cho lập trình viên.
  - Thanh điều hướng thông minh **MeteorEdgeMenu** mượt mà bên cánh trái.
  - Tín hiệu hiện diện đa trạng thái (Online/Busy/In Meeting) và vị trí làm việc (Office/WFH/On-site).
  - Tóm tắt nhanh Tech Stack: **React 19 + TypeScript + NestJS 11 + PostgreSQL + Prisma + Groq AI + Socket.IO**.

---

### BƯỚC 3: LIVE DEMO 1 - MA TRẬN KANBAN 6 CỘT & VÒNG ĐỜI SUBTASK (03:30 - 06:00)
- **Mục tiêu:** Trình diễn năng lực quản trị quy trình Agile nền tảng và trải nghiệm người dùng mượt mà.
- **Thao tác demo:**
  1. **Trình diễn Kéo - Thả (Drag & Drop):** Kéo card từ `TODO` sang `IN_PROGRESS`, sau đó sang `IN_REVIEW`.
     - *Nhấn mạnh giải pháp kỹ thuật:* Card di chuyển êm ái nhờ cơ chế **Dedicated Fixed Portal (`solar-dnd-portal`)**, không bị giật trang hay xuất hiện thanh cuộn nhấp nháy.
  2. **Chuyển đổi góc nhìn:**
     - Bấm chuyển sang **Pipeline View:** Trình bày 6 giai đoạn phát triển phần mềm (Phân tích -> Thiết kế -> Lập trình -> QA -> Staging -> Bàn giao), demo tính năng khóa/mở Stage.
     - Bấm chuyển sang **Focus Mode:** Giao diện lập tức lọc sạch các task không liên quan, chỉ giữ lại task quan trọng hoặc đang làm dở của người dùng.
  3. **Mở Modal Chi Tiết Task (Task Detail Modal):**
     - Tạo 1 subtask: *"Viết unit test cho AuthService"*, gán người phụ trách, set thời gian 2 man-days.
     - Trình bày vòng đời nghiệm thu subtask: Trạng thái `PENDING` -> Quản lý vào duyệt `APPROVED` hoặc từ chối kèm lý do `REJECTED`.
     - Trình chiếu tab **Lịch sử hoạt động (Audit Trail):** Mọi hành động kéo trạng thái, đổi hạn chót đều được hệ thống ghi vết minh bạch.
  4. **Ủy quyền & Chuyển giao Task (Task Delegation):** Demo gửi yêu cầu chuyển giao task cho thành viên khác qua **Hộp thư chuyển giao (Transfer Inbox)**.

---

### BƯỚC 4: LIVE DEMO 2 - QUẢN LÝ LỊCH TRỰC, WFH & PHÊ DUYỆT NGHỈ PHÉP (06:00 - 08:00)
- **Mục tiêu:** Chứng minh sự kết hợp độc đáo giữa quản lý tiến độ task và sự hiện diện của nhân sự.
- **Thao tác demo:**
  1. Điều hướng sang trang **Lịch Làm Việc (`/schedule`)**.
  2. Trình diễn 3 chế độ xem: **Lịch Tháng (Month View)**, **Lịch Tuần (Week Timeline)**, và **Lịch Ngày (Day View)**.
  3. **Kịch bản xin WFH / Nghỉ phép:**
     - Nhấn nút **"Tạo Yêu Cầu Nghỉ Phép / WFH"**.
     - Chọn loại hình: `Làm việc từ xa (WFH)`, chọn ca `Buổi sáng (0.5 ngày)`.
     - Nhập kế hoạch bàn giao: *"Đã bàn giao task review PR cho đồng nghiệp"*.
     - Gửi đơn -> Đơn chuyển trạng thái `PENDING`.
  4. **Kịch bản duyệt của Quản lý:**
     - Mở modal **"Xét Duyệt Đơn Nghỉ Phép"** (dành cho Admin/Manager).
     - Trình diễn quyền phê duyệt linh hoạt: Chấp thuận trực tiếp, hoặc điều chỉnh ngày duyệt và kế hoạch công việc (`APPROVED_MODIFIED`).
  5. **Tính năng Phân bổ lịch trực tiếp (Assign Schedule):** Admin có thể gán nhanh ca trực On-site cho nhân viên đi công tác ngay trên bảng lịch.

---

### BƯỚC 5: LIVE DEMO 3 - PHÂN QUYỀN RBAC & THÙNG RÁC AN TOÀN 14 NGÀY (08:00 - 10:00)
- **Mục tiêu:** Thể hiện độ vững chắc trong quản trị doanh nghiệp và an toàn dữ liệu.
- **Thao tác demo:**
  1. Mở trang **Quản Lý Nhân Sự (`/admin/users`)**:
     - Hiển thị danh sách nhân sự với chức danh, phân quyền và bộ lọc phòng ban.
     - Trình diễn tính năng **Điều chuyển phòng ban hàng loạt**: Chọn nhiều nhân viên và chuyển sang phòng ban mới chỉ trong vài giây.
  2. Mở trang **Thùng Rác Hệ Thống (`/admin/trash`)**:
     - Quay lại bảng Kanban, bấm xóa 1 task thử nghiệm.
     - Vào Thùng rác: Task lập tức xuất hiện kèm đồng hồ đếm ngược **14 ngày**.
     - Bấm nút **"Khôi Phục" (Restore)**: Task lập tức quay trở lại vị trí cũ trên bảng Kanban.
     - Giải thích cơ chế bảo vệ: Nhân viên không thể xóa vĩnh viễn, ngăn chặn hoàn toàn rủi ro mất dữ liệu do phá hoại hoặc thao tác nhầm.

---

### BƯỚC 6: LIVE DEMO 4 (GRAND FINALE) - TRỢ LÝ GIỌNG NÓI AI SONG NGỮ (10:00 - 13:00) 🔥
- **Lời dẫn chuyển ý cao trào (The Climax Bridge):**
  > *"Kính thưa hội đồng, tất cả những tính năng quản lý công việc, phân chia subtask, gán người thực hiện, set deadline và độ ưu tiên mà quý vị vừa theo dõi đều vô cùng chặt chẽ. Tuy nhiên, một vấn đề lớn trong thực tế là: **Lập trình viên và Quản lý mất quá nhiều thời gian để click chuột và điền form thủ công**.*  
  > *Ngay sau đây, chúng em xin giới thiệu tính năng đột phá nhất, là 'trái tim công nghệ' của SOLARIS: **Trợ Lý Giọng Nói AI Song Ngữ Code-Switching** - biến toàn bộ quy trình phức tạp trên thành một khẩu lệnh duy nhất trong vòng 2 giây!"*
- **Thao tác demo trực tiếp:**
  1. Nhấn nút Micro trên thanh menu hoặc nhấn phím tắt `Space`.
  2. **Thử nghiệm khẩu lệnh thực tế có chứa tiếng lóng IT:**
     > *"Tạo task Fix bug API Authentication cho Nam mức độ khẩn cấp deadline ngày mai"*
  3. **Phân tích kết quả trực quan trên màn hình:**
     - **Tốc độ:** Groq Whisper Large-v3 bóc băng âm thanh chỉ trong tích tắc.
     - **Chuẩn hóa âm học (Phonetic Normalization):** Giải thích cách hệ thống biến các từ đọc lệch như *"phích bấc"* -> *"fix bug"*, *"o thên"* -> *"Authentication"*, *"u gần"* -> *"urgent"*.
     - **LLaMA 3.3 70B bóc tách cấu trúc hoàn hảo:**
       - **Tiêu đề công việc:** `Fix bug API Authentication` (thông minh loại bỏ phần người nhận và hạn chót).
       - **Người phụ trách:** Tự động fuzzy matching chính xác với tài khoản `Nam` trong hệ thống.
       - **Mức độ ưu tiên:** Nhận diện chữ 'khẩn cấp' -> Thiết lập `URGENT`.
       - **Hạn chót:** Tính toán chính xác ngày mai dựa trên thời gian thực.
  4. **Tương tác trên Modal Xác Nhận (Preview Dialog):** Người dùng có quyền xem lại, bổ sung ghi chú hoặc bấm xác nhận.
  5. **Hiệu ứng thời gian thực bùng nổ:** Ngay khi bấm Tạo, thẻ Task mới ngay lập tức bay vào cột `TODO` của bảng Kanban và Socket.IO phát thông báo tức thì tới tài khoản của Nam!

---

### BƯỚC 7: TỔNG KẾT & ĐỊNH HƯỚNG TƯƠNG LAI (13:00 - 15:00)
- **Tóm tắt giá trị đạt được:**
  - ✅ Giảm **80% thời gian tạo task** nhờ AI Voice Assistant song ngữ.
  - ✅ Nâng cao tính kỷ luật và minh bạch trong quy trình giao việc và nghiệm thu subtask.
  - ✅ Kết nối liền mạch giữa tiến độ dự án kỹ thuật và quản trị nhân sự thực tế.
  - ✅ Kiến trúc vững chắc, chuẩn TypeScript toàn diện từ Database đến UI.
- **Định hướng phát triển tiếp theo:**
  - Tích hợp AI Smart Sprint Planning (AI tự động phân bổ khối lượng công việc cho các thành viên dựa trên lịch trực rảnh).
  - Kết nối trực tiếp Webhook với GitHub / GitLab (tự động chuyển trạng thái task khi Pull Request được merge).
  - Mở rộng ứng dụng Mobile App (React Native) cho phép nói lệnh khi đang di chuyển ngoài văn phòng.
- **Lời kết:**
  > *"Trên đây là toàn bộ phần trình bày về nền tảng SOLARIS. Chúng em xin chân thành cảm ơn quý thầy cô và hội đồng đã lắng nghe. Rất mong nhận được những câu hỏi và đóng góp quý báu!"*

---

## 6. BẢNG CÂU HỎI VÀ TRẢ LỜI PHẢN BIỆN (Q&A DEFENSE)

Dưới đây là tập hợp các câu hỏi kỹ thuật hóc búa nhất mà hội đồng hoặc nhà tuyển dụng có thể đặt ra, kèm câu trả lời chuẩn xác dựa trên mã nguồn:

### Câu 1: Tại sao hệ thống lại xử lý được tiếng lóng CNTT (Vietglish) mà không bị sai chính tả như các trợ lý thông thường?
- **Trả lời:**
  Hệ thống áp dụng kiến trúc xử lý 3 giai đoạn:
  1. Sử dụng **Groq Whisper Large-v3** đi kèm tham số `prompt` đặc biệt chứa ngữ cảnh và các thuật ngữ IT quen thuộc.
  2. Bổ sung tầng **Chuẩn hóa âm học (Phonetic Normalization)** sử dụng biểu thức chính quy (Regex) trong hàm `normalizeBilingualText()`. Tầng này ánh xạ các phát âm sai lệch phổ biến như *"phích bấc"* thành `"fix bug"`, *"o thên"* thành `"authentication"`, *"đét lai"* thành `"deadline"`.
  3. Dùng mô hình ngôn ngữ lớn **LLaMA 3.3 70B** để suy luận ngữ nghĩa, tự động bóc tách tiêu đề chuẩn và đối chiếu tên nhân sự với danh sách User thực tế trong cơ sở dữ liệu.

### Câu 2: Trong giao diện kéo thả Kanban, các bạn đã giải quyết bài toán giật layout và thanh cuộn xuất hiện bất thường như thế nào?
- **Trả lời:**
  Khi kéo một phần tử trên giao diện web có thanh cuộn hoặc flex layout, phần tử kéo thường bị ảnh hưởng bởi `overflow: hidden/auto` của cột cha. Nhóm đã triển khai kỹ thuật **Dedicated Fixed Portal Container (`solar-dnd-portal`)**:
  - Khi bắt đầu kéo, phần tử card được React Portal chuyển ra một container độc lập nằm ở root DOM với thuộc tính `position: fixed; pointer-events: none; z-index: 999999`.
  - Nhờ đó, card di chuyển hoàn toàn tách biệt khỏi cấu trúc cây DOM của bảng Kanban, triệt tiêu 100% hiện tượng rung lắc màn hình và nhấp nháy thanh cuộn.

### Câu 3: Làm sao đảm bảo hai người dùng không thao tác xung đột (Conflict) khi cùng sửa hoặc di chuyển một task?
- **Trả lời:**
  - Hệ thống sử dụng **Socket.IO** phát sự kiện ngay khi có thay đổi trạng thái (`task:moved`). Phía client nhận sự kiện và cập nhật trực tiếp vào Zustand store theo cơ chế lạc quan (Optimistic update) có kiểm chứng.
  - Phía backend có **Idempotency Interceptor** và kiểm tra `updatedAt` trong Prisma để đảm bảo tính nhất quán dữ liệu (Data Consistency). Nếu một thao tác không hợp lệ, hệ thống sẽ rollback và thông báo Toast tới client.

### Câu 4: Cơ chế thùng rác 14 ngày (14-day Recycle Bin) hoạt động như thế nào về mặt cơ sở dữ liệu? Có tốn tài nguyên không?
- **Trả lời:**
  - Hệ thống áp dụng mô hình **Xóa mềm (Soft Delete)**. Trong schema Prisma, bảng `tasks` và `projects` sở hữu trường `isDeleted: Boolean` và `deletedAt: DateTime`.
  - Khi truy vấn bình thường, hệ thống luôn thêm điều kiện `where: { isDeleted: false }` và đã được đánh index (`@@index([isDeleted])`) để đảm bảo tốc độ truy vấn không bị suy giảm.
  - Trang Admin Trash tính toán thời gian hết hạn (`expiresAt = deletedAt + 14 ngày`). Một cronjob định kỳ hoặc thao tác "Dọn sạch thùng rác" của Admin mới thực thi câu lệnh xóa vĩnh viễn (`deleteMany`) khỏi database.

### Câu 5: Hệ thống bảo mật như thế nào đối với các kết nối thời gian thực qua WebSocket?
- **Trả lời:**
  - Tại `SocketGateway`, khi client kết nối thông qua handshake, middleware trích xuất JWT Token từ header hoặc `auth.token` và xác thực qua `JwtService.verify()`.
  - Khi client gửi sự kiện tham gia phòng dự án (`joinProject`), gateway truy vấn database kiểm tra xem người dùng đó có thuộc danh sách `members` hoặc là `manager/owner` của dự án đó hay không. Nếu không có quyền, kết nối lập tức bị từ chối truy cập phòng (`Unauthorized project access`).
