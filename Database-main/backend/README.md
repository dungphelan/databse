# ☕ SkyTicket Backend - Spring Boot 3 & REST API

> **Mô-đun Backend** của hệ thống đặt vé máy bay SkyTicket, phát triển bằng **Spring Boot 3.3.4 (Java 17)** kết hợp **Spring Data JPA** và kết nối **MySQL 8.0**.

---

## 🏗️ 1. Cấu trúc thư mục (Modular Monolith)

```
backend/
├── pom.xml                                  # Cấu hình thư viện Maven
└── src/
    └── main/
        ├── resources/
        │   └── application.properties       # Cấu hình kết nối MySQL & Port 8080
        └── java/com/skyticket/
            ├── SkyticketApplication.java    # File chạy chính của Backend (Run)
            ├── config/                      # Cấu hình dùng chung
            │   └── CorsConfig.java          # Mở CORS cho React cổng 5173
            ├── common/                      # Tiện ích dùng chung
            │   └── ApiResponse.java         # Mẫu JSON chuẩn trả về cho Frontend
            └── modules/                     # 📦 THƯ MỤC CÁC MODULE NGHIỆP VỤ
                ├── auth/                    # Module 1: Tài khoản & Đăng nhập
                ├── flight/                  # Module 2: Chuyến bay & Tìm kiếm
                └── booking/                 # Module 3: Đặt vé & Ví tiền
```

---

## ⚡ 2. Hướng dẫn Khởi chạy trên Localhost

### 2.1. Yêu cầu môi trường
* **Java Development Kit (JDK)**: Phiên bản 17 hoặc 21.
* **Apache Maven**: Phiên bản 3.8+ (hoặc dùng Maven tích hợp sẵn trong IntelliJ IDEA).
* **MySQL Server**: Đang chạy trên cổng `3306` (đã nạp database `skyticket_db`).

### 2.2. Các bước chạy
1. Mở thư mục `backend/` bằng **IntelliJ IDEA**, **Eclipse** hoặc **VS Code**.
2. Kiểm tra tài khoản và mật khẩu MySQL trong `src/main/resources/application.properties`:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=123456
   ```
3. Mở file `SkyticketApplication.java` và bấm nút **Run (Tam giác xanh)**.
4. Server sẽ khởi động thành công tại: **`http://localhost:8080`**.

---

## 📋 3. Phân công nhiệm vụ cho Nhóm

| Module | Người phụ trách | File cần tạo | API cần hoàn thành |
| :--- | :--- | :--- | :--- |
| **`modules/auth`** | Thành viên 1 | `User.java`, `UserRepository.java`, `AuthService.java`, `AuthController.java` | `POST /api/auth/register`<br>`POST /api/auth/login` |
| **`modules/flight`** | Thành viên 2 | `Flight.java`, `Airport.java`, `Airline.java`, `FlightRepository.java`, `FlightService.java`, `FlightController.java` | `GET /api/airports`<br>`GET /api/flights/search`<br>`GET /api/flights/{id}/occupied-seats` |
| **`modules/booking`** | Thành viên 3 | `Booking.java`, `Ticket.java`, `Passenger.java`, `Transaction.java`, `BookingRepository.java`, `BookingService.java`, `BookingController.java` | `POST /api/bookings`<br>`GET /api/bookings/my-tickets` |

---

## 📡 4. Mẫu JSON Response chuẩn (`ApiResponse<T>`)

Mọi Controller khi trả kết quả về cho Frontend React đều bọc trong `ApiResponse`:
```java
// Thành công:
return ApiResponse.ok("Đặt vé thành công", bookingData);

// Thất bại:
return ApiResponse.error("Số dư ví không đủ để thanh toán");
```
JSON Frontend nhận được:
```json
{
  "success": true,
  "message": "Đặt vé thành công",
  "data": { ... }
}
```
