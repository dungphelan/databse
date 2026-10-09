# 🛫 SkyTicket - Hệ Thống Đặt Vé Máy Bay Fullstack
### (React 18 + Spring Boot 3 + MySQL 8.0)

> **SkyTicket** là dự án nền tảng đặt vé máy bay trực tuyến chuẩn OTA (Online Travel Agency) được thiết kế theo kiến trúc phân tầng chuyên nghiệp, tách biệt hoàn toàn giữa Frontend, Backend và Database.

---

## 🏗️ 1. Cấu Trúc Tổng Thể Dự Án

```
d:/Database/
│
├── 📄 plan.md               # Bản kế hoạch kiến trúc, phân tầng & phân chia công việc
├── 📄 README.md             # Tài liệu tổng quan toàn bộ hệ thống (File này)
│
├── 📁 frontend/             # GIAO DIỆN NGƯỜI DÙNG (React 18, TypeScript, Tailwind CSS, Vite)
│   ├── src/                 # Mã nguồn React components, pages & state management
│   ├── package.json         # Danh mục dependencies Node.js
│   └── README.md            # 📖 Hướng dẫn chi tiết & kịch bản kiểm thử Frontend
│
├── 📁 backend/              # MÁY CHỦ XỬ LÝ NGHIỆP VỤ (Spring Boot 3, JPA, Java 17)
│   ├── pom.xml              # Cấu hình Maven dependencies
│   ├── src/main/resources/  # File application.properties kết nối MySQL
│   ├── src/main/java/       # Mã nguồn Java (config, common, modules)
│   └── README.md            # 📖 Hướng dẫn chi tiết & phân công nhiệm vụ Backend
│
└── 📁 database/             # CƠ SỞ DỮ LIỆU QUAN HỆ (MySQL 8.0)
    ├── skyticket_database.sql # Kịch bản tạo 9 bảng và nạp sẵn dữ liệu thực tế
    └── README.md            # 📖 Hướng dẫn nạp dữ liệu (Import) & danh sách tài khoản test
```

---

## ⚡ 2. Hướng Dẫn Khởi Chạy Nhanh Toàn Bộ Hệ Thống (3 Bước)

### Bước 1: Nạp Cơ sở dữ liệu (Database)
1. Bật **MySQL Server** (qua MySQL Workbench hoặc XAMPP).
2. Mở file `database/skyticket_database.sql` và bấm nút **Execute (Tia sét ⚡)** để tạo database `skyticket_db` cùng 9 bảng và dữ liệu mẫu có sẵn.
3. *(Xem thêm hướng dẫn tại [database/README.md](file:///D:/Database/database/README.md))*

---

### Bước 2: Khởi chạy Backend (Spring Boot)
1. Mở thư mục `backend/` bằng **IntelliJ IDEA**, **Eclipse** hoặc **VS Code**.
2. Kiểm tra mật khẩu MySQL trong `backend/src/main/resources/application.properties`.
3. Mở file `SkyticketApplication.java` và bấm nút **Run**.
4. Server Backend sẽ sẵn sàng tại: **`http://localhost:8080`**.
5. *(Xem thêm hướng dẫn tại [backend/README.md](file:///D:/Database/backend/README.md))*

---

### Bước 3: Khởi chạy Frontend (React)
1. Mở cửa sổ Terminal tại thư mục `frontend/`:
   ```bash
   cd D:\Database\frontend
   npm run dev
   ```
2. Mở trình duyệt web truy cập địa chỉ: **`http://localhost:5173`**.
3. *(Xem thêm hướng dẫn tại [frontend/README.md](file:///D:/Database/frontend/README.md))*

---

## 👥 3. Bản Kế Hoạch & Phân Công Nhiệm Vụ Cho Nhóm

Toàn bộ sơ đồ luồng dữ liệu, cấu trúc 3 module nghiệp vụ (`auth`, `flight`, `booking`) và bảng phân công công việc chi tiết cho từng thành viên trong nhóm 3 - 4 người được lưu tại:
👉 **[plan.md](file:///D:/Database/plan.md)**

---

*Hệ sinh thái Fullstack SkyTicket · Phiên bản 2.0 (2026)*
