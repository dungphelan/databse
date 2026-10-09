-- ========================================================
-- SKYTIKET FLIGHT BOOKING SYSTEM DATABASE SCRIPT (MySQL 8.0)
-- Chuẩn hóa theo thiết kế của Lead Developer
-- ========================================================

DROP DATABASE IF EXISTS `skyticket_db`;
CREATE DATABASE `skyticket_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `skyticket_db`;

-- 1. BẢNG USER (Người dùng & Ví nội bộ)
CREATE TABLE `users` (
    `user_id` INT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(120) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `phone_number` VARCHAR(20) NULL,
    `wallet_balance` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. BẢNG AIRPORT (Sân bay)
CREATE TABLE `airports` (
    `airport_code` VARCHAR(10) PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `country` VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- 3. BẢNG AIRLINE (Hãng hàng không)
CREATE TABLE `airlines` (
    `airline_id` INT AUTO_INCREMENT PRIMARY KEY,
    `airline_name` VARCHAR(100) NOT NULL,
    `airline_code` VARCHAR(10) NOT NULL UNIQUE,
    `logo_color` VARCHAR(20) DEFAULT '#1565C0',
    `rating` DECIMAL(2, 1) DEFAULT 4.5
) ENGINE=InnoDB;

-- 4. BẢNG FLIGHT (Chuyến bay)
CREATE TABLE `flights` (
    `flight_id` INT AUTO_INCREMENT PRIMARY KEY,
    `flight_number` VARCHAR(20) NOT NULL,
    `airline_id` INT NOT NULL,
    `departure_airport_code` VARCHAR(10) NOT NULL,
    `arrival_airport_code` VARCHAR(10) NOT NULL,
    `departure_time` TIMESTAMP NOT NULL,
    `arrival_time` TIMESTAMP NOT NULL,
    `status` ENUM('Scheduled', 'Delayed', 'Cancelled', 'Completed') NOT NULL DEFAULT 'Scheduled',
    CONSTRAINT `fk_flights_airline` FOREIGN KEY (`airline_id`) REFERENCES `airlines` (`airline_id`),
    CONSTRAINT `fk_flights_dep` FOREIGN KEY (`departure_airport_code`) REFERENCES `airports` (`airport_code`),
    CONSTRAINT `fk_flights_arr` FOREIGN KEY (`arrival_airport_code`) REFERENCES `airports` (`airport_code`),
    INDEX `idx_flight_search` (`departure_airport_code`, `arrival_airport_code`, `departure_time`)
) ENGINE=InnoDB;

-- 5. BẢNG FLIGHT_CLASS (Hạng vé & Inventory ghế)
CREATE TABLE `flight_classes` (
    `flight_class_id` INT AUTO_INCREMENT PRIMARY KEY,
    `flight_id` INT NOT NULL,
    `seat_class` ENUM('Economy', 'Business', 'First_Class') NOT NULL,
    `price` DECIMAL(15, 2) NOT NULL,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'VND',
    `available_seats` INT NOT NULL DEFAULT 0,
    CONSTRAINT `fk_flight_classes_flight` FOREIGN KEY (`flight_id`) REFERENCES `flights` (`flight_id`) ON DELETE CASCADE,
    UNIQUE KEY `uk_flight_seat_class` (`flight_id`, `seat_class`)
) ENGINE=InnoDB;

-- 6. BẢNG BOOKING (Đơn đặt vé tổng)
CREATE TABLE `bookings` (
    `booking_id` INT AUTO_INCREMENT PRIMARY KEY,
    `booking_code` VARCHAR(20) NOT NULL UNIQUE, -- Mã PNR: SKYXXXXXX
    `user_id` INT NULL,                         -- Khách vãng lai có thể NULL
    `contact_email` VARCHAR(120) NOT NULL,
    `contact_phone` VARCHAR(20) NOT NULL,
    `total_amount` DECIMAL(15, 2) NOT NULL,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'VND',
    `booking_status` ENUM('Pending', 'Confirmed', 'Cancelled') NOT NULL DEFAULT 'Pending',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_bookings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
    INDEX `idx_bookings_user` (`user_id`)
) ENGINE=InnoDB;

-- 7. BẢNG PASSENGER (Hành khách)
CREATE TABLE `passengers` (
    `passenger_id` INT AUTO_INCREMENT PRIMARY KEY,
    `booking_id` INT NOT NULL,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `identity_type` ENUM('ID_CARD', 'PASSPORT') NOT NULL,
    `identity_number` VARCHAR(50) NOT NULL,
    `nationality` VARCHAR(50) NOT NULL DEFAULT 'Việt Nam',
    `date_of_birth` DATE NULL,
    CONSTRAINT `fk_passengers_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. BẢNG TICKET (Vé chi tiết & Số ghế)
CREATE TABLE `tickets` (
    `ticket_id` INT AUTO_INCREMENT PRIMARY KEY,
    `booking_id` INT NOT NULL,
    `passenger_id` INT NOT NULL,
    `flight_id` INT NOT NULL,
    `seat_class` ENUM('Economy', 'Business', 'First_Class') NOT NULL,
    `seat_number` VARCHAR(10) NULL, -- vd: '8A', '3C'
    `ticket_number` VARCHAR(50) NOT NULL UNIQUE,
    `price` DECIMAL(15, 2) NOT NULL,
    CONSTRAINT `fk_tickets_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_tickets_passenger` FOREIGN KEY (`passenger_id`) REFERENCES `passengers` (`passenger_id`),
    CONSTRAINT `fk_tickets_flight` FOREIGN KEY (`flight_id`) REFERENCES `flights` (`flight_id`),
    UNIQUE KEY `uk_flight_seat` (`flight_id`, `seat_number`) -- Chống trùng ghế
) ENGINE=InnoDB;

-- 9. BẢNG TRANSACTION (Lịch sử biến động số dư)
CREATE TABLE `transactions` (
    `transaction_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `booking_id` INT NULL,
    `transaction_type` ENUM('TOP_UP', 'BOOKING_PAYMENT') NOT NULL,
    `payment_method` ENUM('WALLET', 'CREDIT_CARD', 'BANK_TRANSFER') NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'VND',
    `balance_after` DECIMAL(15, 2) NOT NULL,
    `status` ENUM('Pending', 'Success', 'Failed') NOT NULL DEFAULT 'Pending',
    `transaction_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_tx_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
    CONSTRAINT `fk_tx_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE SET NULL
) ENGINE=InnoDB;


-- ========================================================
-- DỮ LIỆU MẪU (SEED DATA THỰC TẾ)
-- ========================================================

-- 1. NẠP SÂN BAY (16 sân bay quen thuộc từ Frontend)
INSERT INTO `airports` (`airport_code`, `name`, `city`, `country`) VALUES
('SGN', 'Sân bay Quốc tế Tân Sơn Nhất', 'Hồ Chí Minh', 'Việt Nam'),
('HAN', 'Sân bay Quốc tế Nội Bài', 'Hà Nội', 'Việt Nam'),
('DAD', 'Sân bay Quốc tế Đà Nẵng', 'Đà Nẵng', 'Việt Nam'),
('PQC', 'Sân bay Quốc tế Phú Quốc', 'Phú Quốc', 'Việt Nam'),
('CXI', 'Sân bay Quốc tế Cam Ranh', 'Cam Ranh', 'Việt Nam'),
('HUI', 'Sân bay Phú Bài', 'Huế', 'Việt Nam'),
('DLI', 'Sân bay Liên Khương', 'Đà Lạt', 'Việt Nam'),
('VCA', 'Sân bay Quốc tế Cần Thơ', 'Cần Thơ', 'Việt Nam'),
('VDO', 'Sân bay Phù Cát', 'Quy Nhơn', 'Việt Nam'),
('HPH', 'Sân bay Cát Bi', 'Hải Phòng', 'Việt Nam'),
('BKK', 'Suvarnabhumi Airport', 'Bangkok', 'Thái Lan'),
('SIN', 'Changi Airport', 'Singapore', 'Singapore'),
('NRT', 'Narita Airport', 'Tokyo', 'Nhật Bản'),
('ICN', 'Incheon Airport', 'Seoul', 'Hàn Quốc'),
('HKG', 'Hong Kong Airport', 'Hong Kong', 'Hong Kong'),
('KUL', 'KLIA Airport', 'Kuala Lumpur', 'Malaysia');

-- 2. NẠP HÃNG HÀNG KHÔNG
INSERT INTO `airlines` (`airline_id`, `airline_name`, `airline_code`, `logo_color`, `rating`) VALUES
(1, 'Vietnam Airlines', 'VN', '#1565C0', 4.8),
(2, 'Vietjet Air', 'VJ', '#D50000', 4.2),
(3, 'Bamboo Airways', 'QH', '#00897B', 4.5),
(4, 'Pacific Airlines', 'BL', '#37474F', 3.9),
(5, 'Singapore Airlines', 'SQ', '#003875', 4.9),
(6, 'Thai Airways', 'TG', '#6A1B9A', 4.6);

-- 3. NẠP NGƯỜI DÙNG MẪU (Có sẵn 15 triệu trong ví để test)
INSERT INTO `users` (`user_id`, `full_name`, `email`, `password_hash`, `phone_number`, `wallet_balance`) VALUES
(1, 'Nguyễn Văn An', 'nguyenvana@gmail.com', '123456', '0901234567', 15000000.00),
(2, 'Trần Thị Thu Hà', 'thuha@gmail.com', '123456', '0912345678', 8500000.00),
(3, 'Admin SkyTicket', 'admin@skyticket.vn', 'admin123', '0988888888', 50000000.00);

-- 4. NẠP CHUYẾN BAY MẪU (Các chặng bay đắt khách)
-- Ngày bay khởi tạo từ hôm nay và các ngày tới
INSERT INTO `flights` (`flight_id`, `flight_number`, `airline_id`, `departure_airport_code`, `arrival_airport_code`, `departure_time`, `arrival_time`, `status`) VALUES
-- SGN -> HAN (TP.HCM -> Hà Nội)
(1, 'VN214', 1, 'SGN', 'HAN', '2026-10-10 06:00:00', '2026-10-10 08:15:00', 'Scheduled'),
(2, 'VJ120', 2, 'SGN', 'HAN', '2026-10-10 08:30:00', '2026-10-10 10:45:00', 'Scheduled'),
(3, 'QH202', 3, 'SGN', 'HAN', '2026-10-10 13:00:00', '2026-10-10 15:15:00', 'Scheduled'),
(4, 'VN258', 1, 'SGN', 'HAN', '2026-10-10 17:30:00', '2026-10-10 19:45:00', 'Scheduled'),

-- HAN -> SGN (Hà Nội -> TP.HCM)
(5, 'VN215', 1, 'HAN', 'SGN', '2026-10-15 07:00:00', '2026-10-15 09:15:00', 'Scheduled'),
(6, 'VJ121', 2, 'HAN', 'SGN', '2026-10-15 14:00:00', '2026-10-15 16:15:00', 'Scheduled'),

-- SGN -> DAD (TP.HCM -> Đà Nẵng)
(7, 'VN126', 1, 'SGN', 'DAD', '2026-10-10 09:00:00', '2026-10-10 10:25:00', 'Scheduled'),
(8, 'VJ628', 2, 'SGN', 'DAD', '2026-10-10 15:30:00', '2026-10-10 16:55:00', 'Scheduled'),

-- SGN -> PQC (TP.HCM -> Phú Quốc)
(9, 'QH401', 3, 'SGN', 'PQC', '2026-10-10 10:00:00', '2026-10-10 11:05:00', 'Scheduled'),

-- SGN -> SIN (TP.HCM -> Singapore)
(10, 'SQ173', 5, 'SGN', 'SIN', '2026-10-10 12:15:00', '2026-10-10 15:20:00', 'Scheduled'),

-- SGN -> BKK (TP.HCM -> Bangkok)
(11, 'TG551', 6, 'SGN', 'BKK', '2026-10-10 10:15:00', '2026-10-10 11:45:00', 'Scheduled');

-- 5. NẠP HẠNG VÉ VÀ GIÁ TIỀN (FLIGHT_CLASSES)
INSERT INTO `flight_classes` (`flight_id`, `seat_class`, `price`, `available_seats`) VALUES
-- VN214
(1, 'Economy', 1850000.00, 56),
(1, 'Business', 3420000.00, 18),
(1, 'First_Class', 5100000.00, 8),

-- VJ120
(2, 'Economy', 1450000.00, 58),
(2, 'Business', 2680000.00, 20),

-- QH202
(3, 'Economy', 1720000.00, 55),
(3, 'Business', 3180000.00, 16),
(3, 'First_Class', 4730000.00, 8),

-- VN258
(4, 'Economy', 1950000.00, 60),
(4, 'Business', 3600000.00, 20),

-- VN215
(5, 'Economy', 1850000.00, 57),
(5, 'Business', 3420000.00, 18),

-- VJ121
(6, 'Economy', 1390000.00, 59),
(6, 'Business', 2550000.00, 20),

-- VN126
(7, 'Economy', 1250000.00, 55),
(7, 'Business', 2310000.00, 18),

-- VJ628
(8, 'Economy', 980000.00, 60),

-- QH401
(9, 'Economy', 1500000.00, 58),
(9, 'Business', 2775000.00, 18),

-- SQ173 (Quốc tế)
(10, 'Economy', 3100000.00, 50),
(10, 'Business', 5735000.00, 15),
(10, 'First_Class', 8525000.00, 6),

-- TG551 (Quốc tế)
(11, 'Economy', 2800000.00, 52),
(11, 'Business', 5180000.00, 16);

-- 6. NẠP ĐƠN ĐẶT VÉ MẪU & VÉ ĐÃ BÁN (Để kiểm tra ghế bị chiếm chỗ)
-- Đơn hàng mẫu 1: Anh Nguyễn Văn An đã đặt vé VN214 ghế 8A và 8B
INSERT INTO `bookings` (`booking_id`, `booking_code`, `user_id`, `contact_email`, `contact_phone`, `total_amount`, `booking_status`) VALUES
(1, 'SKY892AB1', 1, 'nguyenvana@gmail.com', '0901234567', 4070000.00, 'Confirmed');

-- 2 Hành khách
INSERT INTO `passengers` (`passenger_id`, `booking_id`, `first_name`, `last_name`, `identity_type`, `identity_number`, `nationality`, `date_of_birth`) VALUES
(1, 1, 'Văn An', 'Nguyễn', 'ID_CARD', '079090001234', 'Việt Nam', '1995-05-12'),
(2, 1, 'Thị Mai', 'Lê', 'ID_CARD', '079192005678', 'Việt Nam', '1998-08-20');

-- 2 Vé đã cấp (Ghế 8A và 8B của chuyến VN214 đã bị chiếm)
INSERT INTO `tickets` (`ticket_id`, `booking_id`, `passenger_id`, `flight_id`, `seat_class`, `seat_number`, `ticket_number`, `price`) VALUES
(1, 1, 1, 1, 'Economy', '8A', 'TKT-VN214-001', 1850000.00),
(2, 1, 2, 1, 'Economy', '8B', 'TKT-VN214-002', 1850000.00);

-- Giao dịch trừ tiền ví tương ứng
INSERT INTO `transactions` (`transaction_id`, `user_id`, `booking_id`, `transaction_type`, `payment_method`, `amount`, `balance_after`, `status`) VALUES
(1, 1, NULL, 'TOP_UP', 'BANK_TRANSFER', 19070000.00, 19070000.00, 'Success'),
(2, 1, 1, 'BOOKING_PAYMENT', 'WALLET', 4070000.00, 15000000.00, 'Success');
