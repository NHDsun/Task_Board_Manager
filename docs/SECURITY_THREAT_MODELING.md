# BÁO CÁO ĐÁNH GIÁ BẢO MẬT & PHÂN TÍCH RỦI RÔ TẤN CÔNG (SECURITY THREAT MODELING)

Tài liệu này đánh giá chi tiết cơ chế bảo mật hiện tại của hệ thống, phân tích các kịch bản tấn công mạng phổ biến (theo chuẩn OWASP Top 10) và đưa ra các phương án phòng thủ tương ứng.

---

## 🛡️ ĐÁNH GIÁ CÁC KỊCH BẢN TẤN CÔNG VÀ PHƯƠNG ÁN PHÒNG THỦ

### 1. Tấn công Chèn lệnh SQL (SQL Injection)
- **Đánh giá Mối đe dọa:** Hacker truyền các chuỗi SQL độc hại vào ô Đăng nhập hoặc Ô Tìm kiếm nhằm đánh cắp toàn bộ CSDL.
- **Trạng thái Phòng thủ:** **AN TOÀN 100% (SECURE).**
- **Cơ chế:** Hệ thống sử dụng **Prisma ORM 7** tự động sử dụng *Parameterized Queries* (Tham số hóa truy vấn). Dữ liệu người dùng gửi lên luôn được coi là chuỗi thuần túy, loại bỏ hoàn toàn khả năng thực thi lệnh SQL injection.

---

### 2. Tấn công Chèn mã độc JavaScript (Cross-Site Scripting - XSS)
- **Đánh giá Mối đe dọa:** Hacker chèn mã JavaScript độc hại vào tên Task hay Bình luận để đánh cắp Cookie/Token của người dùng khác khi họ mở task đó.
- **Trạng thái Phòng thủ:** **AN TOÀN (SECURE).**
- **Cơ chế:** 
  - **Frontend:** React 19 sử dụng cơ chế JSX Escaping tự động mã hóa mọi ký tự đặc biệt (`<`, `>`, `&`) trước khi render ra DOM.
  - **Backend:** `ValidationPipe` toàn cục ở NestJS tự động lọc bỏ các đoạn mã script không hợp lệ.

---

### 3. Tấn công Dò quét Mật khẩu (Brute Force Attack / Spam Request)
- **Đánh giá Mối đe dọa:** Hacker dùng tool tự động thử hàng nghìn mật khẩu/giây vào API Đăng nhập nhằm chiếm đoạt tài khoản.
- **Trạng thái Phòng thủ:** **CẦN BỔ SUNG `@nestjs/throttler` (Kế hoạch Bước 2).**
- **Giải pháp:** Cài đặt bộ giới hạn tần suất (Rate Limiting). Nếu 1 IP thử đăng nhập sai quá 5 lần/phút, hệ thống tự động khóa tạm thời IP đó trong 15 phút.

---

### 4. Tấn công Giả mạo Yêu cầu (Cross-Site Request Forgery - CSRF)
- **Đánh giá Mối đe dọa:** Hacker dụ người dùng bấm vào 1 đường link độc hại ở trang web khác để tự động gửi lệnh xóa dữ liệu trên hệ thống của chúng ta.
- **Trạng thái Phòng thủ:** **AN TOÀN (SECURE).**
- **Cơ chế:** Hệ thống sử dụng cơ chế **JWT (JSON Web Token)** gửi qua Header `Authorization: Bearer <token>` chứ không dùng Cookie mặc định. Trình duyệt không bao giờ tự động đính kèm Header này từ trang web khác sang, chống CSRF hoàn toàn.

---

### 5. Tấn công Truy cập Trái phép Tài nguyên (IDOR / BOLA - Broken Object Level Authorization)
- **Đánh giá Mối đe dọa:** Một nhân viên ở Phòng ban này biết ID của một Task thuộc Dự án khác (mà họ không tham gia) và cố tình gọi API để xem/sửa/xóa task đó.
- **Trạng thái Phòng thủ:** **CẦN KIỂM SOÁT Ở TẦNG SERVICE (Kế hoạch Bước 4 & 5).**
- **Giải pháp:** Trong `TaskService` & `ProjectService`, trước khi trả dữ liệu hoặc cho phép sửa/xóa, Backend luôn bắt buộc kiểm tra điều kiện: `currentUser.id` phải thuộc danh sách `ProjectMember` của dự án đó.

---

### 6. Tấn công Nghe lén Dữ liệu (Man-In-The-Middle / Sniffing)
- **Đánh giá Mối đe dọa:** Hacker chặn bắt gói tin trên đường truyền Wi-Fi công cộng để đọc lén mật khẩu.
- **Trạng thái Phòng thủ:** **AN TOÀN VỚI BCRYPT & HTTPS.**
- **Cơ chế:** 
  - Mật khẩu trong CSDL được mã hóa 1 chiều bằng thuật toán `bcrypt` với muối ngẫu nhiên (Salt). Dù lộ CSDL cũng không thể giải mã ngược lại mật khẩu.
  - Khi triển khai (Production), hệ thống chạy qua chứng chỉ mã hóa đường truyền **SSL/TLS (HTTPS)**.

---

## 🎯 TỔNG KẾT MỨC ĐỘ AN TOÀN
Kiến trúc bảo mật của dự án được thiết kế theo tiêu chuẩn **Phòng thủ Nhiều tầng (Defense in Depth)**. Các lỗ hổng phổ biến nhất (SQLi, XSS, CSRF) đã được triệt tiêu hoàn toàn nhờ bộ ba công nghệ **NestJS + Prisma 7 + React 19**. Các nguy cơ còn lại (Brute Force, IDOR) sẽ được kiểm soát chặt chẽ trong từng dòng code của các Bước tiếp theo.
