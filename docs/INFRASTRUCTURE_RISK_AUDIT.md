# BÁO CÁO KIỂM TRẢ RỦI RÔ & LỖI TIỀM ẨN Ở CƠ SỞ HẠ TẦNG

Tài liệu này tổng hợp kết quả rà soát chi tiết mã nguồn hạ tầng (Docker, NestJS Main, Prisma Connection, CORS, Ports) và chỉ ra các rủi ro có khả năng gây ra lỗi/crash hệ thống khi vận hành thực tế.

---

## 🔍 6 RỦI RO CƠ SỞ HẠ TẦNG ĐƯỢC PHÁT HIỆN

### ⚠️ Rủi ro 1: Rò rỉ Hồ chứa Kết nối CSDL (PostgreSQL Pool Connection Leak)
- **Vị trí:** `be/src/prisma/prisma.service.ts`
- **Mô tả:** Trong `PrismaService`, đối tượng `pool = new Pool(...)` được khởi tạo riêng. Khi NestJS tắt hoặc reload (`onModuleDestroy`), hàm `this.$disconnect()` được gọi nhưng **chưa gọi `pool.end()`**.
- **Hậu quả tiềm ẩn:** Mỗi lần server reload (Hot-reload), một hồ chứa kết nối mới được tạo ra trong khi hồ cũ vẫn chiếm giữ slot trong PostgreSQL. Sau vài chục lần reload, Postgres sẽ bị tràn kết nối (`FATAL: sorry, too many clients already`).

---

### ⚠️ Rủi ro 2: Xung đột Cổng CORS giữa Chạy Local và Chạy Docker
- **Vị trí:** `be/src/main.ts` & `docker-compose.yml`
- **Mô tả:** 
  - Trong `main.ts`: CORS đang mở cho nguồn `http://localhost:5173` (cổng Vite local).
  - Trong `docker-compose.yml`: Container Frontend được map ra cổng `8000:5173`.
- **Hậu quả tiềm ẩn:** Khi chạy ứng dụng bằng Docker, người dùng truy cập web ở `http://localhost:8000`. Khi FE gọi API sang BE, trình duyệt sẽ bị chặn ngay lập tức với lỗi CORS vì BE chưa đăng ký cổng `8000`.

---

### ⚠️ Rủi ro 3: Backend khởi động trước khi Database sẵn sàng (Container Startup Order)
- **Vị trí:** `docker-compose.yml`
- **Mô tả:** Service `backend_api` sử dụng `depends_on: - postgres_db`. Tuy nhiên, Docker mặc định chỉ chờ container Postgres *bật lên* chứ không chờ Postgres *hoàn tất khởi tạo xong DB*.
- **Hậu quả tiềm ẩn:** Khi gõ `docker-compose up`, Backend có thể khởi chạy trước và crash ngay lập tức do chưa thể kết nối vào Postgres (`Connection refused`).

---

### ⚠️ Rủi ro 4: Lỗi Tràn dung lượng Payload (Payload Too Large 413) khi dùng Giọng nói & Chat
- **Vị trí:** `be/src/main.ts`
- **Mô tả:** Mặc định Express/NestJS giới hạn dung lượng dữ liệu nhận vào (Body Parser) là `100kb`.
- **Hậu quả tiềm ẩn:** Khi người dùng gửi các gói dữ liệu câu lệnh giọng nói dài, tin nhắn dung lượng lớn hoặc ảnh đại diện mã hóa Base64, Backend sẽ trả về lỗi `HTTP 413 Payload Too Large`.

---

### ⚠️ Rủi ro 5: Thiếu Bộ lọc Dữ liệu Đầu vào Toàn cục (Global Validation Pipe)
- **Vị trí:** `be/src/main.ts`
- **Mô tả:** File `main.ts` hiện tại chưa kích hoạt `app.useGlobalPipes(new ValidationPipe({ whitelist: true }))`.
- **Hậu quả tiềm ẩn:** Các API nhận dữ liệu từ người dùng (như Đăng ký, Tạo Task) sẽ không tự động lọc bỏ các trường rác (strip unknown properties) hoặc ép kiểu tự động (auto-transformation), dễ dẫn đến lỗi crash logic hoặc lỗ hổng bảo mật.

---

### ⚠️ Rủi ro 6: Lỗi Bắt tay WebSockets (Socket.IO Handshake / CORS Error)
- **Vị trí:** `Socket.IO Gateway` (Chuẩn bị viết ở Bước 3.5)
- **Mô tả:** Cấu hình CORS của NestJS trong `main.ts` (`app.enableCors`) chỉ áp dụng cho HTTP REST API. Nếu Gateway của Socket.IO không được cấu hình CORS riêng, trình duyệt sẽ từ chối kết nối WebSockets thời gian thực.

---

## 🛡️ ĐỀ XUẤT GIẢI PHÁP KHẮC PHỤC (RECOMMENDED FIXES)

1. **Khắc phục Pool Leak:** Thêm `pool` thành thuộc tính của `PrismaService` và đóng bằng `await this.pool.end()` trong `onModuleDestroy()`.
2. **Khắc phục CORS:** Cho phép CORS nhận cả mảng các Origin: `['http://localhost:5173', 'http://localhost:8000', 'http://localhost:3000']`.
3. **Khắc phục Docker Startup:** Thêm `healthcheck` cho `postgres_db` bằng `pg_isready -U postgres` trong `docker-compose.yml`.
4. **Khắc phục Payload & Validation:** Thêm `express.json({ limit: '10mb' })` và `ValidationPipe` toàn cục vào `main.ts`.
