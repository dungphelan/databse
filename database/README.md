# 🗄️ SkyTicket Database - MySQL 8.0

> **Thư mục cơ sở dữ liệu** của dự án SkyTicket, chứa toàn bộ kịch bản tạo bảng (DDL) và dữ liệu mẫu (Seed Data) thực tế sẵn sàng sử dụng.

---

## 📁 1. Tệp tin chính

* **`skyticket_database.sql`**: File SQL hoàn chỉnh gồm 2 phần:
  1. **Khởi tạo Schema**: Tạo 9 bảng quan hệ chuẩn hóa 3NF, ràng buộc toàn vẹn khóa ngoại và khóa chống trùng vé.
  2. **Dữ liệu mẫu (Seed Data)**: 16 sân bay, 6 hãng hàng không, 11 chuyến bay, người dùng mẫu có sẵn 15 triệu trong ví, và vé mẫu.

---

## 📊 2. Cấu trúc 9 Bảng trong Cơ sở dữ liệu

| Bảng | Ý nghĩa nghiệp vụ | Khóa chính (PK) |
| :--- | :--- | :--- |
| **`users`** | Tài khoản khách hàng & số dư ví điện tử | `user_id` (INT) |
| **`airports`** | Danh mục sân bay nội địa & quốc tế (SGN, HAN, DAD...) | `airport_code` (VARCHAR) |
| **`airlines`** | Hãng hàng không (Vietnam Airlines, Vietjet, Bamboo...) | `airline_id` (INT) |
| **`flights`** | Thông tin chuyến bay, giờ cất cánh, hạ cánh | `flight_id` (INT) |
| **`flight_classes`** | Quản lý hạng vé (Economy, Business, First_Class) & số ghế | `flight_class_id` (INT) |
| **`bookings`** | Đơn đặt vé tổng (chứa mã PNR dạng `SKYXXXXXX`) | `booking_id` (INT) |
| **`passengers`** | Danh sách hành khách đi kèm (họ tên, CCCD/Hộ chiếu) | `passenger_id` (INT) |
| **`tickets`** | Chi tiết từng vé & số ghế ngồi cụ thể (8A, 8B) | `ticket_id` (INT) |
| **`transactions`** | Sổ cái biến động số dư ví (ghi nhận `balance_after`) | `transaction_id` (INT) |

---

## ⚡ 3. Hướng dẫn Nạp dữ liệu vào MySQL (Import)

### Cách 1: Sử dụng MySQL Workbench (Khuyên dùng)
1. Mở **MySQL Workbench** và kết nối tới `localhost:3306`.
2. Chọn menu **File ➔ Open SQL Script...** ➔ Chọn file `database/skyticket_database.sql`.
3. Bấm nút **Execute (Biểu tượng Tia sét ⚡)** để chạy.
4. Nhấn **Refresh** ở danh sách Schemas bên trái, bạn sẽ thấy cơ sở dữ liệu `skyticket_db` xuất hiện đầy đủ 9 bảng!

### Cách 2: Dùng dòng lệnh (Command Line / Terminal)
```bash
mysql -u root -p < skyticket_database.sql
```

---

## 🔑 4. Tài khoản mẫu có sẵn để Test

Sau khi import thành công, bạn có sẵn các tài khoản sau để thử nghiệm ngay mà không cần đăng ký:

| Họ và tên | Email đăng nhập | Mật khẩu | Số dư ví ban đầu |
| :--- | :--- | :--- | :--- |
| **Nguyễn Văn An** | `nguyenvana@gmail.com` | `123456` | **15.000.000 ₫** |
| **Trần Thị Thu Hà** | `thuha@gmail.com` | `123456` | **8.500.000 ₫** |
| **Admin SkyTicket** | `admin@skyticket.vn` | `admin123` | **50.000.000 ₫** |
