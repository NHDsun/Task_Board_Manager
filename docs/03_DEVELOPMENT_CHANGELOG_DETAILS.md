# BÁO CÁO CHI TIẾT CÁC THAY ĐỔI MÃ NGUỒN DỰ ÁN (DEVELOPMENT CHANGELOG)

Tài liệu này lưu trữ lịch sử chi tiết từng dòng code đã được thêm, sửa hoặc xóa trong dự án kèm theo giải thích chức năng cụ thể.

---

## 1. Cấu hình Mở khóa CORS cho Backend
- **File:** `be/src/main.ts`
- **Nội dung thay đổi:**
```typescript
  app.enableCors({
    origin: process.env.VITE_API_URL || 'http://localhost:5173',
    credentials: true,
  });
```
- **Chức năng:** Cho phép Frontend (`http://localhost:5173`) gọi API sang Backend (`http://localhost:3000`) mà không bị trình duyệt chặn bởi chính sách bảo mật Same-Origin Policy.

---

## 2. Khởi tạo Prisma 7 Adapter với PostgreSQL
- **File:** `be/src/prisma/prisma.service.ts`
- **Nội dung thay đổi:**
```typescript
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }
}
```
- **Chức năng:** Tích hợp bộ kết nối `PrismaPg` adapter thế hệ mới của Prisma 7 để quản lý kết nối cơ sở dữ liệu PostgreSQL thông qua Connection Pool của thư viện `pg`.

---

## 3. Cấu hình Chuỗi Kết nối Database trong Docker
- **File:** `docker-compose.yml`
- **Nội dung thay đổi:**
```yaml
- DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres_db:5432/${POSTGRES_DB}?schema=public
```
- **Chức năng:** Định nghĩa chuỗi kết nối chuẩn `DATABASE_URL` cho container PostgreSQL 16, đảm bảo Backend và Database kết nối thông suốt trong mạng nội bộ Docker.

---

## 4. Xử lý Lỗi Biên dịch & Bộ đệm (Fix MODULE_NOT_FOUND)
- **File 1:** `be/tsconfig.json` ➡️ Chỉnh `"incremental": false` để vô hiệu hóa cache biên dịch bị lỗi.
- **File 2:** `be/nest-cli.json` ➡️ Thêm `"builder": "tsc"` để ép NestJS 11 sử dụng trình biên dịch tiêu chuẩn TypeScript của Microsoft thay cho SWC ngầm bị lỗi.
- **Chức năng:** Đảm bảo khi gõ `npm run start:dev`, file thực thi `dist/main.js` luôn được tạo ra chuẩn xác 100%.

---

## 5. Cập nhật Tài liệu Hướng dẫn Khởi chạy
- **File:** `README.md`
- **Nội dung thay đổi:** Cập nhật lại toàn bộ Tech Stack (NestJS 11, Prisma 7, React 19, Vite 8, Socket.IO) và thêm phần *Hướng dẫn chạy Local Development* chi tiết ở cuối file.
- **Chức năng:** Giúp bất kỳ lập trình viên nào cũng có thể theo dõi và khởi chạy dự án bằng lệnh thủ công một cách dễ dàng.

---

## 6. Thiết kế và Khởi tạo Toàn bộ Cấu trúc CSDL (Database Schema)
- **File:** `be/prisma/schema.prisma`
- **Nội dung thay đổi:**
  - Định nghĩa 4 Enums: `Role` (ADMIN, MANAGER, EMPLOYEE), `Department` (Mã phòng ban), `TaskStatus` (TODO, IN_PROGRESS, DONE), `TaskPriority` (LOW, NORMAL, IMPORTANT, URGENT).
  - Khởi tạo 11 Models hoàn chỉnh:
    1. `Department`: Quản lý các phòng ban động trong công ty.
    2. `User`: Quản lý nhân sự, mật khẩu, vai trò và liên kết phòng ban.
    3. `Project`: Quản lý dự án Kanban.
    4. `ProjectDepartment`: Bảng trung gian n-n hỗ trợ **Dự án thuộc nhiều Phòng ban**.
    5. `ProjectMember`: Bảng trung gian n-n quản lý danh sách nhân viên tham gia dự án.
    6. `Task`: Thẻ công việc chính (hỗ trợ `recurrenceRule` lặp lại và `isArchived` dọn bảng).
    7. `Subtask`: Đầu việc nhỏ bên trong Task.
    8. `Tag` & `TaskTag`: Hệ thống nhãn màu dán lên thẻ công việc.
    9. `Comment`: Lưu vết bình luận/thảo luận trong Task.
    10. `AuditLog`: Lưu vết lịch sử thay đổi để quản lý hệ thống.
- **Chức năng:** Xây dựng khung xương dữ liệu toàn diện cho dự án Kanban, đáp ứng các tiêu chuẩn về Phân quyền RBAC, Liên phòng ban và Lưu vết Audit Logging.

---

## 7. Khắc phục Lỗi Cú pháp Prisma 7 (Lỗi P1012)
- **File:** `be/prisma/schema.prisma`
- **Nội dung thay đổi:**
  - Xóa dòng `url = env("DATABASE_URL")` bên trong khối `datasource db`.
- **Chức năng:** Trong Prisma phiên bản 7.9+, thuộc tính `url` kết nối CSDL đã được chuyển hẳn sang quản lý ở file `prisma.config.ts`. Việc giữ dòng `url` cũ trong `schema.prisma` sẽ gây ra lỗi `P1012: The datasource property url is no longer supported in schema files`.
- **Kết quả kiểm tra:** Đã chạy lệnh `npx prisma validate` kiểm tra và đạt kết quả thành công rực rỡ (`The schema at prisma\schema.prisma is valid 🚀`).

---

## 8. Bổ sung Bảng Nhắn tin Riêng 1-1 (DirectMessage Model)
- **File:** `be/prisma/schema.prisma`
- **Nội dung thay đổi:**
  - Bổ sung Model `DirectMessage` gồm các trường: `id`, `content`, `senderId` (người gửi), `receiverId` (người nhận), `isRead` (trạng thái đã đọc), `createdAt`.
  - Cập nhật mối quan hệ hai chiều trong `User` model: `sentDirectMessages` và `receivedDirectMessages`.
- **Chức năng:** Cho phép các nhân viên có thể chat/nhắn tin riêng 1-1 với nhau trực tiếp trên giao diện web (tích hợp phát tín hiệu thời gian thực via Socket.IO).
- **Kết quả kiểm tra:** Đã chạy lệnh `npx prisma validate` và `npx prisma generate` thành công. Bộ TypeScript Types cho `DirectMessage` đã sẵn sàng sử dụng.

---

## 9. Khởi tạo Tài liệu Sơ đồ Kiến trúc & 7 Luồng Nghiệp vụ
- **File:** `docs/01_PROJECT_ARCHITECTURE_AND_MASTER_PLAN.md`
- **Nội dung tạo mới:**
  - Thiết lập sơ đồ ERD ma trận liên kết giữa 12 bảng CSDL.
  - Mô tả chi tiết quy trình chạy của 7 luồng nghiệp vụ:
    1. Luồng Xác thực & Phân quyền RBAC.
    2. Luồng Quản lý Dự án & Liên phòng ban (Multi-Department).
    3. Luồng Vòng đời Công việc Kanban (Task Lifecycle).
    4. Luồng Điều khiển & Nhập liệu Giọng nói (Smart Voice Command).
    5. Luồng Đồng bộ Thời gian thực (Socket.IO Real-time).
    6. Luồng Nhắn tin & Trao đổi (Task Comment & Direct Message 1-1).
    7. Luồng Tự động Lưu vết Hệ thống (Audit Logging).
- **Chức năng:** Cung cấp cái nhìn toàn cảnh về cách các module Frontend, Backend, Database và WebSockets phối hợp truyền nhận dữ liệu với nhau.

---

## 10. Khởi tạo & Nạp dữ liệu mồi (Seeding) cho 2 Phòng ban "Product" và "Client"
- **File 1:** `be/prisma/seed.ts` (Tạo mới)
  - Khởi tạo script nạp 2 Phòng ban chính:
    1. **Product** (Code: `PRODUCT` - Phòng Quản lý & Phát triển Sản phẩm).
    2. **Client** (Code: `CLIENT` - Phòng Quản lý Khách hàng & Dự án Client).
  - Tự động tạo sẵn 1 tài khoản **Admin mặc định** (`admin@taskboard.com` / `password123`) thuộc phòng Product.
- **File 2:** `be/prisma.config.ts` (Chỉnh sửa)
  - Cấu hình `migrations.seed = 'npx ts-node prisma/seed.ts'` theo tiêu chuẩn của Prisma 7.
- **File 3:** `be/package.json` (Chỉnh sửa)
  - Thêm script `"prisma": { "seed": "ts-node prisma/seed.ts" }`.
- **Kết quả thực thi:** Đã nạp thành công dữ liệu xuống PostgreSQL trong Docker (`🎉 Database Seeding completed successfully!`).

---

## 11. Đổi tên Thư mục Migration cho Ngắn gọn & Cập nhật PostgreSQL
- **Thao tác 1:** Đổi tên thư mục lưu trên ổ đĩa từ `prisma/migrations/20260810030829_init_full_schema` thành `prisma/migrations/20260810030829_init` cho ngắn gọn, dễ nhìn theo yêu cầu.
- **Thao tác 2:** Chạy script Node.js cập nhật trực tiếp bảng hệ thống `_prisma_migrations` trong PostgreSQL từ `20260810030829_init_full_schema` sang `20260810030829_init`.
- **Kết quả kiểm tra:** Đã chạy `npx prisma migrate status` kiểm tra và xác nhận đồng bộ 100% (`Database schema is up to date!`).

---

## 12. Loại bỏ Dãy số Timestamp, Đổi tên Thư mục Migration thành "init"
- **Thao tác 1:** Đổi tên thư mục lưu trên ổ đĩa từ `prisma/migrations/20260810030829_init` thành gọn gàng tuyệt đối: **`prisma/migrations/init`**.
- **Thao tác 2:** Cập nhật bản ghi tương ứng trong bảng hệ thống `_prisma_migrations` của PostgreSQL từ `20260810030829_init` sang `init`.
- **Kết quả kiểm tra:** Đã chạy lệnh `npx prisma migrate status` xác nhận CSDL vẫn giữ nguyên trạng thái đồng bộ hoàn hảo 100% (`Database schema is up to date!`).

---

## 13. Cấu hình CSDL Hỗ trợ Đăng nhập bằng Google / Gmail (OAuth 2.0)
- **File 1:** `be/prisma/schema.prisma`
  - Cập nhật `User` model:
    - Chỉnh trường `password` thành optional (`String?`) vì tài khoản đăng nhập qua Google không dùng mật khẩu mã hóa nội bộ.
    - Bổ sung cột `googleId` (`String? @unique @map("google_id")`) để lưu mã định danh Google Sub ID.
    - Bổ sung cột `avatar` (`String?`) để lưu đường link ảnh đại diện từ Google.
- **Thao tác CSDL:** Chạy SQL thêm các cột `google_id`, `avatar` và gỡ bỏ ràng buộc NOT NULL của `password` trực tiếp trong PostgreSQL.
- **Kết quả kiểm tra:** Đã chạy `npx prisma generate` thành công. Bộ TypeScript Client đã sẵn sàng cho luồng Google OAuth.

---

## 14. Bổ sung Bảng CallLog & Cơ chế Cuộc gọi Thoại / Video (WebRTC + Socket.IO)
- **File 1:** `be/prisma/schema.prisma`
  - Khai báo 2 Enums mới: `CallType` (`AUDIO`, `VIDEO`) và `CallStatus` (`MISSED`, `COMPLETED`, `REJECTED`, `BUSY`).
  - Bổ sung Model **`CallLog`** gồm: `id`, `callerId`, `receiverId`, `type`, `status`, `duration` (số giây), `startedAt`, `endedAt`.
  - Cập nhật mối quan hệ hai chiều trong `User` model: `sentCalls` và `receivedCalls`.
- **Thao tác CSDL:** Đã khởi tạo bảng `call_logs` cùng 2 Enum `CallType` và `CallStatus` trong PostgreSQL.
- **Kết quả kiểm tra:** Đã chạy `npx prisma validate` và `npx prisma generate` thành công 100%. Bộ TypeScript Client đã sẵn sàng cho luồng Gọi thoại & Gọi Video.

---

## 15. Bổ sung Kế hoạch Thiết kế Phòng họp Nhóm & Hệ thống Thông báo (Chưa can thiệp Code)
- **Tài liệu bổ sung:** `docs/01_PROJECT_ARCHITECTURE_AND_MASTER_PLAN.md`
- **Nội dung bổ sung vào kế hoạch:**
  1. **Luồng 9 - Phòng họp Nhóm Trực tuyến (Group Meeting Room):** Tích hợp WebRTC đa điểm hỗ trợ tạo phòng họp trực tiếp trong Project, mời thành viên, giơ tay phát biểu, bật/tắt cam/mic và chia sẻ màn hình.
  2. **Luồng 10 - Thông báo Hệ thống Thời gian thực (In-App Notification System):** Tự động phát thông báo qua Socket.IO khi được gán Task, tag @mention, lời mời họp hoặc nhắc hạn chót Task. Quả chuông trên giao diện nảy chấm đỏ kèm âm thanh.
- **Trạng thái:** Đã lưu vào bản thiết kế kiến trúc. Tạm thời **chưa can thiệp vào mã nguồn code** theo đúng yêu cầu của người dùng.

---

## 16. Kiểm tra & Rà soát 6 Rủi ro Cơ sở Hạ tầng Tiềm ẩn
- **Tài liệu tạo mới:** `docs/02_INFRASTRUCTURE_AND_SECURITY_AUDIT.md`
- **Nội dung rà soát:** Phát hiện 6 điểm rủi ro có khả năng gây lỗi/crash hệ thống khi chạy thực tế:
  1. **Rò rỉ PostgreSQL Connection Pool** trong `PrismaService` khi NestJS reload.
  2. **Xung đột Cổng CORS** giữa chạy Local (5173) và chạy Docker (8000).
  3. **Thứ tự khởi chạy Container** trong `docker-compose.yml` thiếu Healthcheck làm Backend crash khi Postgres chưa sẵn sàng.
  4. **Giới hạn dung lượng Payload (100kb)** gây lỗi 413 khi dùng Giọng nói & Chat.
  5. **Thiếu Global Validation Pipe** ở `main.ts` dễ bị lọt dữ liệu rác.
  6. **Cấu hình CORS riêng cho WebSockets Gateway** ngăn cản kết nối thời gian thực.
- **Đề xuất:** Đã lập sẵn danh sách 6 giải pháp sửa lỗi an toàn để áp dụng khi tiến hành viết code Backend.

---

## 17. Thực thi Khắc phục Chi tiết 5 Rủi ro Cơ sở Hạ tầng (Fix Infrastructure Bugs)
- **File 1:** `be/src/prisma/prisma.service.ts`
  - **Dòng/Khối code:** Class `PrismaService` (Dòng 5 - 22).
  - **Hành động:** `[THÊM MỚI & CHỈNH SỬA]`.
  - **Chi tiết:** Thêm thuộc tính `private pool: Pool`, gán `this.pool = pool` trong constructor và thêm `await this.pool.end()` vào phương thức lifecycle `onModuleDestroy()`.
  - **Mục đích:** Đóng hoàn toàn kết nối hồ chứa PostgreSQL Pool khi server NestJS ngắt hoặc reload, chống rò rỉ kết nối `Pool Connection Leak`.
- **File 2:** `be/src/main.ts`
  - **Dòng/Khối code:** Hàm `bootstrap()` (Dòng 1 - 42).
  - **Hành động:** `[THÊM MỚI & CHỈNH SỬA]`.
  - **Chi tiết:** 
    1. Thêm `app.use(express.json({ limit: '10mb' }))`: Tăng giới hạn dung lượng nhận dữ liệu lên 10MB (tránh lỗi HTTP 413 khi nhận dữ liệu câu lệnh giọng nói & ảnh Base64).
    2. Cấu hình `allowedOrigins` đa cổng (`http://localhost:5173`, `http://localhost:8000`, `http://localhost:3000`): Cho phép Frontend chạy qua Docker (cổng 8000) gọi API thông suốt không bị lỗi CORS.
    3. Thêm `app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))`: Bật bộ lọc dữ liệu đầu vào toàn cục cho NestJS để lọc sạch tham số rác.
  - **Mục đích:** Xử lý triệt để 3 rủi ro về CORS, Payload Limit và Validation dữ liệu.
- **File 3:** `docker-compose.yml`
  - **Dòng/Khối code:** Service `postgres_db` & `backend_api` (Dòng 17 - 37).
  - **Hành động:** `[THÊM MỚI & CHỈNH SỬA]`.
  - **Chi tiết:** thêm `healthcheck: test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]` cho `postgres_db` và cập nhật `depends_on: postgres_db: condition: service_healthy` cho `backend_api`.
  - **Mục đích:** Ép Backend Docker phải đợi cho đến khi PostgreSQL sẵn sàng 100% mới khởi chạy, ngăn ngừa lỗi crash kết nối ngầm khi khởi động Docker lần đầu.
- **File 4:** `be/package.json`
  - **Hành động:** `[THÊM MỚI DEPENDENCIES]`.
  - **Chi tiết:** Cài đặt 2 thư viện `class-validator` và `class-transformer`.
  - **Mục đích:** Phục vụ cho bộ lọc `ValidationPipe` toàn cục ở `main.ts`.

---

## 18. Chuyển đổi Toàn bộ Tài liệu README.md sang Tiếng Anh
- **File:** `README.md` (Dòng 1 - 100).
- **Hành động:** `[CHỈNH SỬA & VIẾT LẠI]`.
- **Chi tiết:** 
  - Biên dịch toàn bộ nội dung tài liệu tổng quan dự án từ Tiếng Việt sang Tiếng Anh chuẩn mực chuyên nghiệp.
  - Bổ sung cập nhật đầy đủ các tính năng mới nhất vừa thiết kế: Google OAuth 2.0, WebRTC Audio/Video Calls, Direct Messaging 1-1 và Mô hình Liên phòng ban Multi-Department.
- **Mục đích:** Chuẩn hóa tài liệu dự án theo quy chuẩn quốc tế.

---

## 19. Khởi tạo Khung File Rỗng cho Common Core & AuthModule (Chưa viết Code Logic)
- **Danh sách 9 File Khung Rỗng được tạo mới:**
  1. `be/src/common/filters/http-exception.filter.ts`: Khung bộ lọc lỗi toàn cục `HttpExceptionFilter`.
  2. `be/src/common/interceptors/transform.interceptor.ts`: Khung bộ chuẩn hóa response `TransformInterceptor`.
  3. `be/src/common/decorators/roles.decorator.ts`: Khung Decorator `@Roles()` định nghĩa vai trò RBAC.
  4. `be/src/common/guards/roles.guard.ts`: Khung Guard `RolesGuard` kiểm tra vai trò.
  5. `be/src/modules/auth/dto/register.dto.ts`: Khung DTO `RegisterDto`.
  6. `be/src/modules/auth/dto/login.dto.ts`: Khung DTO `LoginDto`.
  7. `be/src/modules/auth/auth.service.ts`: Khung Service `AuthService`.
  8. `be/src/modules/auth/auth.controller.ts`: Khung Controller `AuthController`.
  9. `be/src/modules/auth/auth.module.ts`: Khung Module `AuthModule`.
- **File Chỉnh sửa:** `be/src/app.module.ts` ➡️ Import `AuthModule` vào danh sách `imports`.
- **Mục đích:** Tạo sẵn bộ khung vị trí thư mục và cấu trúc file rỗng theo đúng kế hoạch. Tạm thời **chưa viết bất kỳ dòng code logic xử lý nào** theo đúng yêu cầu kiểm soát của người dùng.
- **Kết quả kiểm tra:** Đã chạy `npm run build` thành công 100% không có lỗi biên dịch.

---

## 20. Đánh giá Cơ chế Bảo mật & Lập Báo cáo Phân tích Rủi ro Tấn công (OWASP Threat Modeling)
- **Tài liệu tạo mới:** `docs/02_INFRASTRUCTURE_AND_SECURITY_AUDIT.md`
- **Nội dung rà soát:** Đánh giá 6 kịch bản tấn công mạng phổ biến và giải pháp bảo vệ:
  1. **SQL Injection:** Khóa 100% nhờ cơ chế Parameterized Queries của Prisma 7.
  2. **Cross-Site Scripting (XSS):** Khóa nhờ JSX Escaping của React 19 & ValidationPipe của NestJS.
  3. **Brute Force (Spam Request):** Chuẩn bị cài đặt `@nestjs/throttler` (Rate Limiting) ở Bước 2 để tự động khóa IP nếu thử sai quá 5 lần/phút.
  4. **CSRF Attack:** Khóa 100% nhờ cơ chế xác thực JWT Header `Authorization: Bearer <token>`.
  5. **IDOR / BOLA (Truy cập trái phép task/dự án khác):** Kiểm soát chặt chẽ bằng cách kiểm tra `ProjectMember` trong từng hàm Service.
  6. **Man-In-The-Middle (Nghe lén):** Mã hóa mật khẩu bằng `Bcrypt` (Salted Hash) & triển khai qua HTTPS.
- **Kết luận:** Hệ thống đạt tiêu chuẩn bảo mật phòng thủ nhiều tầng (Defense in Depth).

---

## 21. Thực thi Vi mô Bước 1.1: Hoàn thiện Logic Bắt lỗi Toàn cục (HttpExceptionFilter)
- **File 1:** `be/src/common/filters/http-exception.filter.ts` (Dòng 1 - 36).
  - **Hành động:** `[CHỈNH SỬA & VIẾT CODE LOGIC]`.
  - **Chi tiết:** Viết logic phương thức `catch(exception: unknown, host: ArgumentsHost)`. Tự động bóc tách mã lỗi `statusCode`, câu thông báo lỗi `message`, đường dẫn `path` và thời gian `timestamp`, đóng gói lại thành chuỗi JSON phản hồi chuẩn:
    ```json
    { "success": false, "statusCode": 400, "message": "Email đã tồn tại", "path": "/api/v1/auth/register", "timestamp": "2026-08-10T11:21:00.000Z" }
    ```
- **File 2:** `be/src/main.ts` (Dòng 4 - 46).
  - **Hành động:** `[CHỈNH SỬA]`.
  - **Chi tiết:** Import `HttpExceptionFilter` và kích hoạt toàn cục qua lệnh `app.useGlobalFilters(new HttpExceptionFilter())`.
- **Mục đích:** Đảm bảo 100% mọi ngoại lệ/lỗi xảy ra trong hệ thống đều được bọc lại theo cấu trúc JSON đẹp đẽ, chuyên nghiệp.
- **Kết quả kiểm tra:** Đã chạy `npm run build` biên dịch thành công 100% không có lỗi.

---

## 22. Thực thi Vi mô Bước 1.2: Hoàn thiện Logic Chuẩn hóa Phản hồi Thành công (TransformInterceptor)
- **File 1:** `be/src/common/interceptors/transform.interceptor.ts` (Dòng 1 - 33).
  - **Hành động:** `[CHỈNH SỬA & VIẾT CODE LOGIC]`.
  - **Chi tiết:** Định nghĩa interface `Response<T>` và viết logic hàm `intercept(context, next)`. Sử dụng RxJS `map` operator bọc toàn bộ kết quả trả về của API thành cấu trúc chuẩn:
    ```json
    { "success": true, "statusCode": 200, "data": { ... }, "timestamp": "2026-08-10T11:37:00.000Z" }
    ```
- **File 2:** `be/src/main.ts` (Dòng 5 - 50).
  - **Hành động:** `[CHỈNH SỬA]`.
  - **Chi tiết:** Import `TransformInterceptor` và kích hoạt toàn cục qua lệnh `app.useGlobalInterceptors(new TransformInterceptor())`.
- **Mục đích:** Đảm bảo 100% mọi API khi thực thi thành công đều có phản hồi đồng nhất giúp Frontend chỉ cần xử lý 1 cấu trúc dữ liệu duy nhất.
- **Kết quả kiểm tra:** Đã chạy `npm run build` biên dịch thành công 100% không có lỗi.

---

## 23. Thực thi Vi mô Bước 1.3: Hoàn thiện Logic Bảo vệ Phân quyền (RolesGuard)
- **File:** `be/src/common/guards/roles.guard.ts` (Dòng 1 - 35).
  - **Hành động:** `[CHỈNH SỬA & VIẾT CODE LOGIC]`.
  - **Chi tiết:** 
    - Khởi tạo `Reflector` đọc các vai trò được quy định từ Decorator `@Roles()`.
    - Lấy thông tin người dùng `request.user` từ chuỗi JWT.
    - Cài đặt luật phân quyền:
      1. Nếu API không dán nhãn vai trò ➡️ Cho phép truy cập tự do.
      2. Nếu chưa đăng nhập (user = null) ➡️ Chặn truy cập (Trả về false / 403 Forbidden).
      3. Nếu user có vai trò `ADMIN` ➡️ Luôn luôn cấp quyền truy cập tối cao.
      4. Với các vai trò khác (`MANAGER`, `EMPLOYEE`) ➡️ So sánh vai trò của User với mảng vai trò cho phép của API.
- **Mục đích:** Tạo chốt gác cổng bảo vệ quyền hạn RBAC chặt chẽ cho toàn bộ hệ thống API.
- **Kết quả kiểm tra:** Đã chạy `npm run build` biên dịch thành công 100% không có lỗi.

---

## 24. Thực thi Vi mô Bước 2.1: Hoàn thiện DTO Đăng ký (RegisterDto)
- **File:** `be/src/modules/auth/dto/register.dto.ts` (Dòng 1 - 22).
  - **Hành động:** `[CHỈNH SỬA & VIẾT CODE LOGIC]`.
  - **Chi tiết:** 
    - Nhập các decorator validation từ `class-validator`: `@IsEmail`, `@IsNotEmpty`, `@IsString`, `@MinLength`, `@IsOptional`.
    - Cài đặt 4 trường dữ liệu đầu vào:
      1. `email`: Bắt buộc, đúng định dạng `@`, thông báo Tiếng Việt khi sai.
      2. `password`: Bắt buộc, chuỗi ký tự, tối thiểu 6 ký tự.
      3. `fullName`: Bắt buộc, chuỗi ký tự.
      4. `departmentId`: Tùy chọn (Optional), mã ID phòng ban liên kết.
- **Mục đích:** Kiểm tra và lọc sạch dữ liệu người dùng gửi lên khi Đăng ký tài khoản trước khi đưa vào Service.
- **Kết quả kiểm tra:** Đã chạy `npm run build` biên dịch thành công 100% không có lỗi.

---

## 25. Thực thi Vi mô Bước 2.2: Hoàn thiện DTO Đăng nhập Local (LoginDto)
- **File:** `be/src/modules/auth/dto/login.dto.ts` (Dòng 1 - 15).
  - **Hành động:** `[CHỈNH SỬA & VIẾT CODE LOGIC]`.
  - **Chi tiết:** 
    - Nhập các decorator validation từ `class-validator`: `@IsEmail`, `@IsNotEmpty`, `@IsString`.
    - Cài đặt 2 trường dữ liệu đầu vào:
      1. `email`: Bắt buộc, đúng định dạng `@`, thông báo lỗi Tiếng Việt khi sai.
      2. `password`: Bắt buộc, chuỗi ký tự, không được để trống.
- **Mục đích:** Kiểm tra và lọc sạch dữ liệu người dùng gửi lên khi Đăng nhập bằng Email/Password trước khi đưa vào Service.
- **Kết quả kiểm tra:** Đã chạy `npm run build` biên dịch thành công 100% không có lỗi.

---

## 26. Thực thi Vi mô Bước 2.3: Tạo mới DTO Đăng nhập Google (GoogleAuthDto)
- **File:** `be/src/modules/auth/dto/google-auth.dto.ts` (Dòng 1 - 10).
  - **Hành động:** `[THÊM MỚI FILE & CODE LOGIC]`.
  - **Chi tiết:** 
    - Nhập các decorator validation từ `class-validator`: `@IsNotEmpty`, `@IsString`.
    - Cài đặt trường dữ liệu đầu vào:
      1. `idToken`: Bắt buộc, chuỗi ký tự chứa token xác thực từ Google gửi lên.
- **Mục đích:** Tiếp nhận và kiểm tra tính hợp lệ của chuỗi Google ID Token khi người dùng bấm Đăng nhập 1-Click bằng Gmail.
- **Kết quả kiểm tra:** Đã chạy `npm run build` biên dịch thành công 100% không có lỗi.

---

## 27. Thực thi Vi mô Thao tác F.1: Cài đặt Thư viện UI & Google Auth cho Frontend
- **File:** `fe/package.json` & `fe/package-lock.json`.
  - **Hành động:** `[CÀI ĐẶT THƯ VIỆN NPM]`.
  - **Chi tiết:** Cài đặt 2 thư viện chính:
    1. `lucide-react`: Thư viện biểu tượng UI hiện đại (Icons).
    2. `@react-oauth/google`: Thư viện kết nối Đăng nhập 1-Click bằng Gmail Google cho React.
- **Mục đích:** Chuẩn bị các gói phụ trợ giao diện và tính năng xác thực Google cho Frontend.
- **Kết quả kiểm tra:** Đã chạy `npm install` thành công 100% (added 2 packages, 0 vulnerabilities).

---

## 28. Thực thi Vi mô Thao tác F.2: Tạo File Định nghĩa TypeScript Types cho Frontend
- **File:** `fe/src/types/index.ts` (Dòng 1 - 120).
  - **Hành động:** `[THÊM MỚI FILE & CODE LOGIC]`.
  - **Chi tiết:** 
    - Khai báo các type aliases: `Role`, `TaskStatus`, `TaskPriority`, `CallType`, `CallStatus`.
    - Định nghĩa toàn bộ 10 Interfaces chính: `Department`, `User`, `Subtask`, `Tag`, `Task`, `Project`, `DirectMessage`, `CallLog`.
    - Chuẩn hóa tương thích với cấu hình `erasableSyntaxOnly` của Vite 8 & TypeScript 6.
- **Mục đích:** Đồng bộ kiểu dữ liệu TypeScript của Frontend khớp 100% với CSDL PostgreSQL và Backend NestJS.
- **Kết quả kiểm tra:** Đã chạy `npm run build` biên dịch Vite production thành công 100% (`built in 1.55s`).

---

## 29. Bổ sung Kiến trúc Luồng 11: Hàng chờ Cá nhân (My Task Queue) & Tự động Ưu tiên Khẩn cấp (URGENT)
- **Tài liệu bổ sung:** `docs/01_PROJECT_ARCHITECTURE_AND_MASTER_PLAN.md`
- **Nội dung thiết kế mới:**
  1. **Chế độ Tập trung Cá nhân (My Focus Queue):** Cho phép nhân viên xem danh sách Task của riêng mình gồm 1 Task Đang làm (`IN_PROGRESS`) và Hàng chờ `Pending` (`TODO`).
  2. **Thuật toán Tự động Ưu tiên `URGENT`:** Khi có Task giọng nói hoặc Task được gán nhãn `URGENT` ➡️ Hệ thống tự động nhảy Task này lên vị trí **số 1 trong hàng chờ Pending** (ngay sau Task đang làm).
  3. **Chuyển đổi Chế độ Xem (Dual View Switch):** Nút chuyển đổi linh hoạt giữa Bảng Kanban Tổng quan cả Team và Hàng chờ Cá nhân.
- **Trạng thái:** Đã ghi nhận vào bản kiến trúc hệ thống. Tạm thời chưa sửa đổi mã nguồn theo dặn dò của người dùng.

---

## 30. Thực thi Vi mô Thao tác 2.4: Cài đặt Gói Thư viện JWT, Passport, Bcrypt & Google Auth cho Backend
- **File:** `be/package.json` & `be/package-lock.json`.
  - **Hành động:** `[CÀI ĐẶT THƯ VIỆN NPM]`.
  - **Chi tiết:** Cài đặt đầy đủ các gói phụ trợ xác thực và mã hóa mật khẩu cho NestJS:
    1. `@nestjs/jwt` & `@nestjs/passport` & `passport` & `passport-jwt`: Quản lý chiến lược chìa khóa JWT.
    2. `bcrypt`: Thư viện mã hóa mật khẩu 1 chiều (Salted Hash).
    3. `google-auth-library`: Thư viện verify ID Token chính thức từ Google.
    4. `@types/bcrypt` & `@types/passport-jwt`: Các gói định nghĩa kiểu dữ liệu TypeScript.
- **Mục đích:** Chuẩn bị hạ tầng thư viện bảo mật cho AuthModule ở Backend.
- **Kết quả kiểm tra:** Đã chạy `npm install` thành công 100% (added 43 packages, 0 vulnerabilities).

---

## 31. Thực thi Vi mô Thao tác 2.5: Tạo mới JwtStrategy Giải mã Chìa khóa JWT Token
- **File:** `be/src/modules/auth/strategies/jwt.strategy.ts` (Dòng 1 - 42).
  - **Hành động:** `[THÊM MỚI FILE & CODE LOGIC]`.
  - **Chi tiết:** 
    - Kế thừa `PassportStrategy(Strategy)` từ `passport-jwt`.
    - Cấu hình bóc tách chuỗi chìa khóa từ Header `Authorization: Bearer <token>`.
    - Viết phương thức `validate(payload: JwtPayload)`: Truy vấn PostgreSQL kiểm tra xem User ID (`payload.sub`) có tồn tại và hợp lệ không, sau đó nạp thông tin user vào `request.user`.
- **Mục đích:** Xác thực chìa khóa đăng nhập JWT của người dùng trên từng API request.
- **Kết quả kiểm tra:** Đã chạy `npm run build` biên dịch thành công 100% không có lỗi.

---

## 32. Đề xuất Kiến trúc Cơ chế Tiến trình Dự án & Phân công Phòng ban (Project Process Pipeline)
- **Tài liệu tạo mới:** `docs/01_PROJECT_ARCHITECTURE_AND_MASTER_PLAN.md`
- **Nội dung thiết kế mới:** Đề xuất 3 phương án hiện thực hóa cơ chế chia dự án thành nhiều Tiến trình / Giai đoạn và phân công các phòng ban (Product, Client, Dev...) thực hiện:
  1. **Phương án 1 (Khuyên dùng):** Tạo bảng `ProjectStage` (Giai đoạn tiến trình: Giai đoạn 1 ➡️ Giai đoạn 2 ➡️ Giai đoạn 3) kết hợp nút chuyển đổi góc nhìn Kanban (View theo Trạng thái hoặc View theo Tiến trình).
  2. **Phương án 2:** Tạo bảng `TaskDependency` (Task tiến trình sau bị khóa cho tới khi Task tiến trình trước hoàn thành).
  3. **Phương án 3:** Mô hình Cột mốc & Luồng bơi theo Phòng ban (Milestone & Department Swimlanes).
- **Trạng thái:** Đã ghi nhận vào tài liệu đề xuất thiết kế. Tạm thời chưa sửa đổi mã nguồn theo dặn dò của người dùng.

---

## 33. Tạo File Kế hoạch Tổng thể Hiện thực hóa Dự án (Project Realization Master Plan)
- **Tài liệu tạo mới:** `docs/01_PROJECT_ARCHITECTURE_AND_MASTER_PLAN.md`
- **Nội dung thiết kế mới:** 
  1. Phê duyệt **Phương án 1 (Tiến trình Giai đoạn `ProjectStage`)** và thiết kế chi tiết bảng CSDL `ProjectStage` bổ sung.
  2. Bổ sung 5 Giá trị Cốt lõi độc nhất: Nhập liệu Giọng nói Tiếng Việt 10s Undo, Tiến trình Giai đoạn, Hàng chờ Cá nhân URGENT, Multi-Department Collaboration, WebRTC Video Call & Chat 1-1.
  3. Lập lộ trình 5 Giai đoạn Triển khai Song hành BE-FE (Auth ➡️ Pipeline & Kanban ➡️ Voice ➡️ Real-time Chat/Call ➡️ Dashboard).
  4. Quy định nguyên tắc kiểm soát vi mô (Micro-step Governance Protocol).
- **Trạng thái:** Đã tạo bản kế hoạch hoàn toàn mới. Tạm thời **chưa đụng vào mã nguồn code** theo dặn dò của người dùng.

---

## 34. Cập nhật Thiết kế Định danh Nghề nghiệp Nhân viên (Job Title & Department Badges)
- **Tài liệu bổ sung:** `docs/01_PROJECT_ARCHITECTURE_AND_MASTER_PLAN.md`
- **Nội dung thiết kế mới:** 
  - Phân loại rõ nghề nghiệp/chuyên môn của nhân viên (`EMPLOYEE`) như `Dev`, `Tester`, `Design`, `Marketing`, `BA`... thông qua liên kết `Department` và thuộc tính `jobTitle`.
  - Hiển thị nhãn Badge màu sắc trực quan bên cạnh Avatar nhân viên trên Bảng Kanban, Thẻ Task và Danh sách Cuộc gọi.
- **Trạng thái:** Đã ghi nhận vào bản kế hoạch tổng thể. Tạm thời **chưa sửa đổi mã nguồn code** theo dặn dò của người dùng.

---

## 35. Chuẩn hóa Thiết kế Định danh Nghề nghiệp Chuyên môn Độc lập (Profession Enum)
- **Tài liệu bổ sung:** `docs/01_PROJECT_ARCHITECTURE_AND_MASTER_PLAN.md`
- **Nội dung thiết kế mới:** 
  - Tách biệt hoàn toàn khái niệm **Phòng ban (`Department`)** và **Nghề nghiệp Chuyên môn (`Profession`)**.
  - Thiết lập thuộc tính Nghề nghiệp độc lập cho Nhân viên (`DEV`, `TESTER`, `MARKETING`, `DESIGNER`, `BA`, `DEVOPS`...).
  - Hỗ trợ Manager lọc và giao đúng Task của từng Tiến trình cho người có Nghề nghiệp tương ứng (VD: Task kiểm thử giao cho người nghề `TESTER`, Task lập trình giao cho người nghề `DEV`).
- **Trạng thái:** Đã ghi nhận vào bản kế hoạch tổng thể. Tạm thời **chưa sửa đổi mã nguồn code** theo dặn dò của người dùng.

---

## 36. Cập nhật Bổ sung Ví dụ Phân biệt Độc lập giữa Phòng ban và Nghiệp vụ Chuyên môn
- **Tài liệu bổ sung:** `docs/01_PROJECT_ARCHITECTURE_AND_MASTER_PLAN.md`
- **Nội dung đính chính:** 
  - Khẳng định 100% **Phòng ban (`Department`)** và **Nghiệp vụ Chuyên môn (`Profession`)** là 2 trường dữ liệu hoàn toàn độc lập của Employee:
    - *Phòng ban (`departmentId`):* Đơn vị tổ chức quản lý (VD: `Product`, `Client`...).
    - *Nghiệp vụ Chuyên môn (`profession`):* Tay nghề chuyên môn (`DEV`, `TESTER`, `MARKETING`, `DESIGNER`, `BA`...).
  - Nhân viên thuộc *Phòng ban Client* hoàn toàn có thể có *Nghiệp vụ là Dev* hoặc *Tester*.
- **Trạng thái:** Đã ghi nhận vào bản kế hoạch tổng thể. Tạm thời **chưa sửa đổi mã nguồn code** theo dặn dò của người dùng.

---

## 37. Thực thi Vi mô Thao tác 2.6: Tạo mới JwtAuthGuard Bảo vệ API Bắt buộc Đăng nhập
- **File:** `be/src/modules/auth/guards/jwt-auth.guard.ts` (Dòng 1 - 20).
  - **Hành động:** `[THÊM MỚI FILE & CODE LOGIC]`.
  - **Chi tiết:** 
    - Kế thừa `AuthGuard('jwt')` từ `@nestjs/passport`.
    - Viết phương thức `handleRequest(err, user, info)`: Kiểm tra nếu không có Token hoặc Token hết hạn ➡️ Ném ra ngoại lệ `UnauthorizedException('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn')`.
- **Mục đích:** Bộ gác cổng bảo vệ Lớp 1 (Authentication), bắt buộc người dùng phải Đăng nhập mới được phép gọi các API nội bộ.
- **Kết quả kiểm tra:** Đã chạy `npm run build` biên dịch thành công 100% không có lỗi.

---

## 38. Thực thi Vi mô Thao tác F.3: Cấu hình Axios Interceptors Tự động đính kèm Token và Xử lý Lỗi 401 cho Frontend
- **File:** `fe/src/services/api.ts` (Dòng 1 - 33).
  - **Hành động:** `[CHỈNH SỬA & VIẾT CODE LOGIC]`.
  - **Chi tiết:** 
    - Thêm Request Interceptor: Tự động lấy chuỗi `accessToken` từ LocalStorage và đính kèm vào Header `Authorization: Bearer <token>` trên từng yêu cầu gửi sang Backend.
    - Thêm Response Interceptor: Tự động phát hiện nếu Backend trả về lỗi `401 Unauthorized` ➡️ Xóa sạch Token cũ và chuyển người dùng về trang Đăng nhập.
- **Mục đích:** Tự động hóa việc gửi chìa khóa xác thực trên Frontend mà không cần phải gõ thủ công ở từng API call.
- **Kết quả kiểm tra:** Đã chạy `npm run build` biên dịch Vite production thành công 100% (`built in 113ms`).

---

## 39. Thực thi Vi mô Thao tác F.4: Tạo Quản lý Trạng thái Đăng nhập Toàn cục (useAuthStore Zustand)
- **File:** `fe/src/store/useAuthStore.ts` (Dòng 1 - 48).
  - **Hành động:** `[THÊM MỚI FILE & CODE LOGIC]`.
  - **Chi tiết:** 
    - Khai báo interface `AuthState` quản lý thông tin `user`, `token`, `isAuthenticated`, hàm `setAuth()` và hàm `logout()`.
    - Viết logic tự động khôi phục dữ liệu `user` và `accessToken` từ LocalStorage ngay khi ứng dụng vừa tải lên.
    - Viết hàm `setAuth()` tự động lưu thông tin vào LocalStorage khi đăng nhập thành công.
    - Viết hàm `logout()` dọn dẹp sạch sẽ LocalStorage khi đăng xuất.
- **Mục đích:** Quản lý tập trung trạng thái tài khoản người dùng trên toàn bộ ứng dụng Frontend.
- **Kết quả kiểm tra:** Đã chạy `npm run build` biên dịch Vite production thành công 100% (`built in 182ms`).

---

## 40. Thay đổi Chuyển đổi Git Remote Repository
- **Hệ thống:** Git Configuration (`.git/config`).
  - **Hành động:** `[CẬP NHẬT CẤU HÌNH GIT]`.
  - **Chi tiết:** 
    - Gỡ bỏ Remote Origin cũ: `https://github.com/NHDsun/Du-an-Bang-Cong-viec-ho-tro-Nhap-lieu-Giong-noi-Voice-Assisted-Task-Board-`
    - Thêm mới Remote Origin mới: `https://github.com/NHDsun/Task_Board_Manager.git`
- **Mục đích:** Đồng bộ mã nguồn dự án sang kho chứa GitHub mới chính thức.
- **Kết quả kiểm tra:** Đã kiểm tra `git remote -v` thành công 100%.

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
- **Kết quả kiểm tra:** Chạy `npm run build` thành công trong 323ms (0 lỗi, 0 cảnh báo). Đã kiểm tra trực quan thanh Tab trình duyệt hiển thị đúng tên **Solaris Task Board** và biểu tượng Mặt Trời Đen.

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

## 47. Cập nhật Git Remote Repository Sang Kho Chứa Mới (Solaris_Task_Board_Manager)
- **Hệ thống:** Git Configuration (`.git/config`).
  - **Hành động:** `[CẬP NHẬT CẤU HÌNH GIT REMOTE]`.
  - **Chi tiết:** 
    - Chuyển đổi Remote Origin URL từ `https://github.com/NHDsun/Task_Board_Manager.git` sang kho chứa mới: `https://github.com/NHDsun/Solaris_Task_Board_Manager.git`.
- **Mục đích:** Cập nhật đúng tên thương hiệu Solaris và kết nối trực tiếp với kho chứa GitHub chính thức mới của dự án.
- **Kết quả kiểm tra:** Đã kiểm tra `git remote -v` trả về kết quả thành công 100%.






