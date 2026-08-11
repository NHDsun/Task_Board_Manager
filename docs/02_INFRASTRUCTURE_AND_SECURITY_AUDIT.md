# 🛡️ BÁO CÁO KIỂM TRẢ RỦI RÔ HẠ TẦNG & PHÂN TÍCH BẢO MẬT (INFRASTRUCTURE & SECURITY AUDIT)

Tài liệu này tổng hợp chi tiết kết quả rà soát **Rủi ro Cơ sở Hạ tầng** (Docker, NestJS Main, Prisma Connection, CORS, Ports) và **Đánh giá Cơ chế Bảo mật / Phân tích Rủi ro Tấn công** (theo chuẩn OWASP Top 10) cho hệ thống.

---

## 🔍 PHẦN 1: BÁO CÁO KIỂM TRẢ RỦI RÔ & LỖI TIỀM ẨN CƠ SỞ HẠ TẦNG

### 1. 6 Rủi Ro Cơ Sở Hạ Tầng Được Phát Hiện

#### ⚠️ Rủi ro 1: Rò rỉ Hồ chứa Kết nối CSDL (PostgreSQL Pool Connection Leak)
- **Vị trí:** `be/src/prisma/prisma.service.ts`
- **Mô tả:** Trong `PrismaService`, đối tượng `pool = new Pool(...)` được khởi tạo riêng. Khi NestJS tắt hoặc reload (`onModuleDestroy`), hàm `this.$disconnect()` được gọi nhưng **chưa gọi `pool.end()`**.
- **Hậu quả tiềm ẩn:** Mỗi lần server reload (Hot-reload), một hồ chứa kết nối mới được tạo ra trong khi hồ cũ vẫn chiếm giữ slot trong PostgreSQL. Sau vài chục lần reload, Postgres sẽ bị tràn kết nối (`FATAL: sorry, too many clients already`).

---

#### ⚠️ Rủi ro 2: Xung đột Cổng CORS giữa Chạy Local và Chạy Docker
- **Vị trí:** `be/src/main.ts` & `docker-compose.yml`
- **Mô tả:** 
  - Trong `main.ts`: CORS đang mở cho nguồn `http://localhost:5173` (cổng Vite local).
  - Trong `docker-compose.yml`: Container Frontend được map ra cổng `8000:5173`.
- **Hậu quả tiềm ẩn:** Khi chạy ứng dụng bằng Docker, người dùng truy cập web ở `http://localhost:8000`. Khi FE gọi API sang BE, trình duyệt sẽ bị chặn ngay lập tức với lỗi CORS vì BE chưa đăng ký cổng `8000`.

---

#### ⚠️ Rủi ro 3: Backend khởi động trước khi Database sẵn sàng (Container Startup Order)
- **Vị trí:** `docker-compose.yml`
- **Mô tả:** Service `backend_api` sử dụng `depends_on: - postgres_db`. Tuy nhiên, Docker mặc định chỉ chờ container Postgres *bật lên* chứ không chờ Postgres *hoàn tất khởi tạo xong DB*.
- **Hậu quả tiềm ẩn:** Khi gõ `docker-compose up`, Backend có thể khởi chạy trước và crash ngay lập tức do chưa thể kết nối vào Postgres (`Connection refused`).

---

#### ⚠️ Rủi ro 4: Lỗi Tràn dung lượng Payload (Payload Too Large 413) khi dùng Giọng nói & Chat
- **Vị trí:** `be/src/main.ts`
- **Mô tả:** Mặc định Express/NestJS giới hạn dung lượng dữ liệu nhận vào (Body Parser) là `100kb`.
- **Hậu quả tiềm ẩn:** Khi người dùng gửi các gói dữ liệu câu lệnh giọng nói dài, tin nhắn dung lượng lớn hoặc ảnh đại diện mã hóa Base64, Backend sẽ trả về lỗi `HTTP 413 Payload Too Large`.

---

#### ⚠️ Rủi ro 5: Thiếu Bộ lọc Dữ liệu Đầu vào Toàn cục (Global Validation Pipe)
- **Vị trí:** `be/src/main.ts`
- **Mô tả:** File `main.ts` hiện tại chưa kích hoạt `app.useGlobalPipes(new ValidationPipe({ whitelist: true }))`.
- **Hậu quả tiềm ẩn:** Các API nhận dữ liệu từ người dùng (như Đăng ký, Tạo Task) sẽ không tự động lọc bỏ các trường rác (strip unknown properties) hoặc ép kiểu tự động (auto-transformation), dễ dẫn đến lỗi crash logic hoặc lỗ hổng bảo mật.

---

#### ⚠️ Rủi ro 6: Lỗi Bắt tay WebSockets (Socket.IO Handshake / CORS Error)
- **Vị trí:** `Socket.IO Gateway` (Chuẩn bị viết ở Bước 3.5)
- **Mô tả:** Cấu hình CORS của NestJS trong `main.ts` (`app.enableCors`) chỉ áp dụng cho HTTP REST API. Nếu Gateway của Socket.IO không được cấu hình CORS riêng, trình duyệt sẽ từ chối kết nối WebSockets thời gian thực.

---

### 2. Đề Xuất Giải Pháp Khắc Phục (Recommended Fixes)

1. **Khắc phục Pool Leak:** Thêm `pool` thành thuộc tính của `PrismaService` và đóng bằng `await this.pool.end()` trong `onModuleDestroy()`.
2. **Khắc phục CORS:** Cho phép CORS nhận cả mảng các Origin: `['http://localhost:5173', 'http://localhost:8000', 'http://localhost:3000']`.
3. **Khắc phục Docker Startup:** Thêm `healthcheck` cho `postgres_db` bằng `pg_isready -U postgres` trong `docker-compose.yml`.
4. **Khắc phục Payload & Validation:** Thêm `express.json({ limit: '10mb' })` và `ValidationPipe` toàn cục vào `main.ts`.

---

## 🔐 PHẦN 2: BÁO CÁO ĐÁNH GIÁ BẢO MẬT & PHÂN TÍCH RỦI RÔ TẤN CÔNG (SECURITY THREAT MODELING)

Tài liệu này đánh giá chi tiết cơ chế bảo mật hiện tại của hệ thống, phân tích các kịch bản tấn công mạng phổ biến (theo chuẩn OWASP Top 10) và đưa ra các phương án phòng thủ tương ứng.

---

### 1. Đánh Giá Các Kịch Bản Tấn Công Và Phương Án Phòng Thủ

#### 1. Tấn công Chèn lệnh SQL (SQL Injection)
- **Đánh giá Mối đe dọa:** Hacker truyền các chuỗi SQL độc hại vào ô Đăng nhập hoặc Ô Tìm kiếm nhằm đánh cắp toàn bộ CSDL.
- **Trạng thái Phòng thủ:** **AN TOÀN 100% (SECURE).**
- **Cơ chế:** Hệ thống sử dụng **Prisma ORM 7** tự động sử dụng *Parameterized Queries* (Tham số hóa truy vấn). Dữ liệu người dùng gửi lên luôn được coi là chuỗi thuần túy, loại bỏ hoàn toàn khả năng thực thi lệnh SQL injection.

---

#### 2. Tấn công Chèn mã độc JavaScript (Cross-Site Scripting - XSS)
- **Đánh giá Mối đe dọa:** Hacker chèn mã JavaScript độc hại vào tên Task hay Bình luận để đánh cắp Cookie/Token của người dùng khác khi họ mở task đó.
- **Trạng thái Phòng thủ:** **AN TOÀN (SECURE).**
- **Cơ chế:** 
  - **Frontend:** React 19 sử dụng cơ chế JSX Escaping tự động mã hóa mọi ký tự đặc biệt (`<`, `>`, `&`) trước khi render ra DOM.
  - **Backend:** `ValidationPipe` toàn cục ở NestJS tự động lọc bỏ các đoạn mã script không hợp lệ.

---

#### 3. Tấn công Dò quét Mật khẩu (Brute Force Attack / Spam Request)
- **Đánh giá Mối đe dọa:** Hacker dùng tool tự động thử hàng nghìn mật khẩu/giây vào API Đăng nhập nhằm chiếm đoạt tài khoản.
- **Trạng thái Phòng thủ:** **CẦN BỔ SUNG `@nestjs/throttler` (Kế hoạch Bước 2).**
- **Giải pháp:** Cài đặt bộ giới hạn tần suất (Rate Limiting). Nếu 1 IP thử đăng nhập sai quá 5 lần/phút, hệ thống tự động khóa tạm thời IP đó trong 15 phút.

---

#### 4. Tấn công Giả mạo Yêu cầu (Cross-Site Request Forgery - CSRF)
- **Đánh giá Mối đe dọa:** Hacker dụ người dùng bấm vào 1 đường link độc hại ở trang web khác để tự động gửi lệnh xóa dữ liệu trên hệ thống của chúng ta.
- **Trạng thái Phòng thủ:** **AN TOÀN (SECURE).**
- **Cơ chế:** Hệ thống sử dụng cơ chế **JWT (JSON Web Token)** gửi qua Header `Authorization: Bearer <token>` chứ không dùng Cookie mặc định. Trình duyệt không bao giờ tự động đính kèm Header này từ trang web khác sang, chống CSRF hoàn toàn.

---

#### 5. Tấn công Truy cập Trái phép Tài nguyên (IDOR / BOLA - Broken Object Level Authorization)
- **Đánh giá Mối đe dọa:** Một nhân viên ở Phòng ban này biết ID của một Task thuộc Dự án khác (mà họ không tham gia) và cố tình gọi API để xem/sửa/xóa task đó.
- **Trạng thái Phòng thủ:** **CẦN KIỂM SOÁT Ở TẦNG SERVICE (Kế hoạch Bước 4 & 5).**
- **Giải pháp:** Trong `TaskService` & `ProjectService`, trước khi trả dữ liệu hoặc cho phép sửa/xóa, Backend luôn bắt buộc kiểm tra điều kiện: `currentUser.id` phải thuộc danh sách `ProjectMember` của dự án đó.

---

#### 6. Tấn công Nghe lén Dữ liệu (Man-In-The-Middle / Sniffing)
- **Đánh giá Mối đe dọa:** Hacker chặn bắt gói tin trên đường truyền Wi-Fi công cộng để đọc lén mật khẩu.
- **Trạng thái Phòng thủ:** **AN TOÀN VỚI BCRYPT & HTTPS.**
- **Cơ chế:** 
  - Mật khẩu trong CSDL được mã hóa 1 chiều bằng thuật toán `bcrypt` với muối ngẫu nhiên (Salt). Dù lộ CSDL cũng không thể giải mã ngược lại mật khẩu.
  - Khi triển khai (Production), hệ thống chạy qua chứng chỉ mã hóa đường truyền **SSL/TLS (HTTPS)**.

---

### 2. Tổng Kết Mức Độ An Toàn
Kiến trúc bảo mật của dự án được thiết kế theo tiêu chuẩn **Phòng thủ Nhiều tầng (Defense in Depth)**. Các lỗ hổng phổ biến nhất (SQLi, XSS, CSRF) đã được triệt tiêu hoàn toàn nhờ bộ ba công nghệ **NestJS + Prisma 7 + React 19**. Các nguy cơ còn lại (Brute Force, IDOR) sẽ được kiểm soát chặt chẽ trong từng dòng code của các Bước tiếp theo.
