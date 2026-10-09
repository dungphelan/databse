# ✈️ SkyTicket - Nền Tảng Đặt Vé Máy Bay Trực Tuyến

> **SkyTicket** là ứng dụng web đặt vé máy bay hiện đại, tối ưu trải nghiệm người dùng (UX/UI) chuẩn Online Travel Agency (OTA) tương tự như Traveloka, Vietnam Airlines hay Vietjet Air. Dự án được phát triển bằng **React 18**, **TypeScript**, **Tailwind CSS** và được đóng gói bởi **Vite**.

---

## 📑 Mục lục
- [1. Kiến trúc hệ thống & Tech Stack](#1-kiến-trúc-hệ-thống--tech-stack)
- [2. Cấu trúc thư mục dự án](#2-cấu-trúc-thư-mục-dự-án)
- [3. Các tính năng nổi bật](#3-các-tính-năng-nổi-bật)
- [4. Báo cáo đánh giá mã nguồn (Code Audit) & Lỗi đã khắc phục](#4-báo-cáo-đánh-giá-mã-nguồn-code-audit--lỗi-đã-khắc-phục)
- [5. Hướng dẫn cài đặt & Chạy Localhost](#5-hướng-dẫn-cài-đặt--chạy-localhost)
- [6. Kịch bản kiểm thử trải nghiệm (Demo Flow)](#6-kịch-bản-kiểm-thử-trải-nghiệm-demo-flow)
- [7. Định hướng phát triển (Roadmap)](#7-định-hướng-phát-triển-roadmap)

---

## 1. Kiến trúc hệ thống & Tech Stack

### 1.1. Công nghệ sử dụng (Tech Stack)
- **Core Framework**: [React 18](https://react.dev/) (Single Page Application - SPA)
- **Ngôn ngữ**: [TypeScript 5](https://www.typescriptlang.org/) (Strict type-checking)
- **Build Tool / Bundler**: [Vite 5](https://vitejs.dev/) (Fast HMR, ES module bundling)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/) + PostCSS + Autoprefixer
- **Iconography**: [Lucide React](https://lucide.dev/) (Bộ icon vector trực quan)
- **Quản lý trạng thái (State Management)**: React Context API (`AppContext`) kết hợp cơ chế đồng bộ hóa an toàn với `localStorage`.
- **Dữ liệu giả lập (Data Layer)**: Bộ sinh chuyến bay nội địa/quốc tế theo thuật toán PRNG (Pseudo-Random Number Generator) có tính tất định (deterministic), sơ đồ ghế khoang bay thực tế (VIP, Thương gia, Phổ thông).

### 1.2. Mô hình kiến trúc
Ứng dụng tuân theo mô hình **Component-Driven Architecture**:
```
User Interaction
       │
       ▼
┌────────────────────────────────────────────────────────┐
│  Presentation Layer (Pages & UI Components)            │
│  - HomePage, ListPage, SeatSelection, BookingPage      │
│  - Navbar, Footer, LoginModal, AirlineLogo             │
└───────────────────────┬────────────────────────────────┘
                        │ Actions & Dispatches
                        ▼
┌────────────────────────────────────────────────────────┐
│  Application State Layer (Context API: AppProvider)    │
│  - Page Navigation, Flight Search Criteria             │
│  - Selected Flight & Class, Seat Reservation           │
│  - Booking History, Wallet Transactions, Auth State    │
└───────────────────────┬────────────────────────────────┘
                        │
       ┌────────────────┴────────────────┐
       ▼                                 ▼
┌───────────────────────────┐    ┌───────────────────────────┐
│ LocalStorage Persistence  │    │ In-memory PRNG Inventory  │
│ (User, Bookings, Wallets) │    │ (Routes, Flights, Seats)  │
└───────────────────────────┘    └───────────────────────────┘
```

---

## 2. Cấu trúc thư mục dự án

```
flight-ticket-booking1-main/
├── public/                       # Tài nguyên tĩnh (favicon, logo, icons)
│   └── vite.svg                  # Favicon SVG chính
├── src/
│   ├── components/               # Các UI components tái sử dụng
│   │   ├── AirlineLogo.tsx       # Huy hiệu logo các hãng hàng không
│   │   ├── Footer.tsx            # Chân trang thông tin & liên hệ
│   │   ├── LoginModal.tsx        # Modal Đăng nhập / Đăng ký tài khoản
│   │   └── Navbar.tsx            # Thanh điều hướng, số dư ví, avatar người dùng
│   ├── pages/                    # Các màn hình chính trong luồng đặt vé
│   │   ├── HomePage.tsx          # Trang chủ & form tìm kiếm (1 chiều, khứ hồi, nhiều chặng)
│   │   ├── ListPage.tsx          # Màn hình danh sách vé, lọc hãng bay, sắp xếp giá
│   │   ├── SeatSelection.tsx     # Sơ đồ khoang máy bay chọn chỗ ngồi theo hạng
│   │   ├── BookingPage.tsx       # Nhập thông tin hành khách, thanh toán, xem vé
│   │   └── MyTicketsPage.tsx     # Quản lý vé đã đặt & lịch sử biến động số dư ví
│   ├── App.tsx                   # Component gốc điều hướng màn hình
│   ├── context.tsx               # AppContext quản lý state toàn cục & persistence
│   ├── data.ts                   # Dữ liệu sân bay, hãng bay, PRNG generator & layout ghế
│   ├── index.css                 # Tailwind CSS directives & custom keyframes
│   ├── main.tsx                  # Điểm khởi tạo ứng dụng React
│   ├── types.ts                  # Toàn bộ TypeScript interfaces & types của dự án
│   └── vite-env.d.ts             # Định nghĩa môi trường Vite
├── eslint.config.js              # Cấu hình ESLint 9 Flat Config
├── index.html                    # File HTML template chính
├── package.json                  # Định nghĩa dependencies và npm scripts
├── postcss.config.js             # Cấu hình PostCSS
├── tailwind.config.js            # Cấu hình Tailwind CSS theme & plugins
├── tsconfig.json                 # Cấu hình TypeScript root
├── tsconfig.app.json             # Cấu hình TypeScript cho React code
└── vite.config.ts                # Cấu hình Vite bundler & alias '@/'
```

---

## 3. Các tính năng nổi bật

1. **Tìm kiếm chuyến bay đa dạng**:
   - Hỗ trợ cả **Một chiều**, **Khứ hồi** và **Nhiều chặng** (Multi-city).
   - Tự động gợi ý sân bay phổ biến tại Việt Nam (SGN, HAN, DAD, PQC, CXI...) và quốc tế (BKK, SIN, NRT, ICN...).
   - Kiểm tra ràng buộc hợp lệ: ngăn chặn chọn cùng sân bay đi - đến, kiểm tra ngày về sau ngày đi.
2. **Bộ lọc & Sắp xếp chuyến bay**:
   - Lọc theo số điểm dừng (Bay thẳng, 1 điểm dừng).
   - Lọc theo hãng hàng không (Vietnam Airlines, Vietjet, Bamboo Airways, Singapore Airlines...).
   - Sắp xếp nhanh: Rẻ nhất, Sớm nhất, Nhanh nhất.
3. **Sơ đồ chọn ghế tương tác (Interactive Cabin Map)**:
   - Mô phỏng chính xác sơ đồ hàng ghế theo hạng vé:
     - **VIP**: Hàng 1-2 (khoang riêng biệt 4 ghế/hàng `A - C | D - F`).
     - **Thương gia (Business)**: Hàng 3-7 (4 ghế/hàng).
     - **Phổ thông (Economy)**: Hàng 8-17 (6 ghế/hàng `A - B - C | D - E - F`).
   - Kiểm soát trạng thái ghế: Ghế trống, Ghế đang chọn, Ghế đã bán.
4. **Nhập liệu hành khách & Xuất mã đặt chỗ (PNR)**:
   - Điền chi tiết thông tin hành khách tương ứng với từng số ghế.
   - Hỗ trợ các loại giấy tờ tùy thân: CCCD/CMND, Hộ chiếu, Giấy phép lái xe.
   - Tự động sinh mã vé chuẩn hàng không dạng `SKYXXXXXX`.
5. **Thanh toán & Ví điện tử (SkyTicket Wallet)**:
   - Thanh toán trực tiếp tại quầy hoặc thanh toán qua ví SkyTicket.
   - Quản lý số dư, ghi nhận sổ cái giao dịch với trường `balance_after` minh bạch.
6. **Lưu trữ dữ liệu an toàn (Data Persistence)**:
   - Lưu trữ danh sách vé đã đặt, lịch sử giao dịch và phiên người dùng trên `localStorage` giúp dữ liệu không bị mất khi F5 / tải lại trang.

---

## 4. Báo cáo đánh giá mã nguồn (Code Audit) & Lỗi đã khắc phục

Qua quá trình rà soát chuyên sâu theo tiêu chuẩn lập trình cấp cao, các vấn đề và lỗi đã được xử lý triệt để:

| Loại lỗi | Vị trí | Mô tả lỗi trước đây | Giải pháp đã khắc phục |
| :--- | :--- | :--- | :--- |
| **Crash Linter** | `eslint.config.js`, `src/context.tsx` | Lệnh `npm run lint` bị lỗi do biến `_password` chưa sử dụng không khớp với rule mặc định. | Đã bổ sung cấu hình `argsIgnorePattern: '^_'` vào `eslint.config.js`. |
| **Giá vé nhảy loạn** | `src/data.ts:155` | Tuyến đường bay không có trong bảng giá dùng `Math.random()`, khiến giá vé của cùng một chuyến bay thay đổi mỗi khi re-render hoặc click chọn vé. | Chuẩn hóa thuật toán sinh giá vé tất định (deterministic hash) dựa trên mã sân bay. |
| **Mất danh tính & Reset ví** | `src/context.tsx` | Mỗi lần đăng nhập, hệ thống sinh ngẫu nhiên một họ tên từ `mockNames` và gán `uid('user')` mới toanh, reset ví về 15 triệu, làm mất lịch sử giao dịch cũ. | Chuẩn hóa `userId` theo email, lưu trữ thông tin ví vào `localStorage` duy trì trạng thái đăng nhập thực thụ. |
| **Lỗ hổng rò rỉ vé** | `src/pages/MyTicketsPage.tsx:18` | `const myBookings = bookings;` hiển thị tất cả vé của mọi người dùng mà không lọc theo tài khoản. | Bổ sung bộ lọc hiển thị đúng vé của tài khoản đang đăng nhập hoặc khách vãng lai hiện tại. |
| **Mất dữ liệu khi F5** | `src/context.tsx` | State 100% trong RAM. Khi F5 trình duyệt là mất toàn bộ vé vừa đặt và lịch sử giao dịch. | Tích hợp đồng bộ tự động với `localStorage` cho bookings, tickets, passengers, transactions và user profile. |
| **Lỗi UI Icon Ngày tháng** | `src/pages/HomePage.tsx:693` | Thẻ icon `Calendar` đặt trong `relative div` chứa cả label chữ khiến icon bị lệch tâm input. | Tách riêng container `relative` bọc quanh input và icon để canh giữa chuẩn xác. |
| **Thiếu Validation đầu vào** | `src/pages/HomePage.tsx:287` | Cho phép tìm kiếm chuyến bay có Điểm đi trùng Điểm đến, hoặc ngày về trước ngày đi. | Bổ sung kiểm tra dữ liệu đầu vào và hiển thị banner cảnh báo trực quan trước khi tìm kiếm. |
| **Dependencies thừa** | `package.json` | Khai báo thư viện `@supabase/supabase-js` nhưng hoàn toàn không sử dụng trong dự án. | Đã loại bỏ khỏi `package.json` và làm sạch dependencies. |
| **File thừa (Dead Code)** | `src/components/Header.tsx` | File chỉ chứa re-export `Navbar` mà không nơi nào trong dự án import tới. | Đã loại bỏ file thừa để giữ codebase gọn gàng. |
| **Lỗi 404 Favicon** | `index.html` | Thẻ `<link rel="icon" href="/vite.svg">` trả về lỗi 404 do thiếu thư mục `public/`. | Đã khởi tạo thư mục `public/` cùng file `vite.svg` chuẩn. |

---

## 5. Hướng dẫn cài đặt & Chạy Localhost

### 5.1. Yêu cầu môi trường
- **Node.js**: Phiên bản `>= 18.0.0` (khuyên dùng Node 20 hoặc 22 LTS).
- **Trình quản lý gói**: `npm` hoặc `yarn` / `pnpm`.

### 5.2. Các bước cài đặt

1. **Mở terminal tại thư mục dự án**:
   ```bash
   cd D:\Database\flight-ticket-booking1-main
   ```

2. **Cài đặt dependencies**:
   ```bash
   npm install
   ```

3. **Kiểm tra cú pháp & Typecheck (Khuyến nghị)**:
   ```bash
   # Kiểm tra lỗi cú pháp và code style
   npm run lint

   # Kiểm tra kiểu dữ liệu TypeScript
   npm run typecheck
   ```

4. **Khởi chạy máy chủ phát triển (Development Server)**:
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ khả dụng ngay tại: **`http://localhost:5173`**

5. **Đóng gói phiên bản Production (Tùy chọn)**:
   ```bash
   npm run build
   npm run preview
   ```

---

## 6. Kịch bản kiểm thử trải nghiệm (Demo Flow)

Để trải nghiệm trọn vẹn luồng đặt vé của SkyTicket:
1. **Bước 1 - Đăng nhập tài khoản**:
   - Bấm nút **"Đăng nhập"** trên góc phải Navbar.
   - Nhập email bất kỳ (ví dụ: `nguyenvana@gmail.com`) và mật khẩu. Số dư ví khởi điểm sẽ là **15.000.000 ₫**.
2. **Bước 2 - Tìm chuyến bay**:
   - Chọn hành trình (Ví dụ: `Hồ Chí Minh (SGN)` ➔ `Hà Nội (HAN)`).
   - Chọn ngày bay và số lượng hành khách (ví dụ: 2 hành khách).
   - Bấm **"Tìm chuyến bay"**.
3. **Bước 3 - Lọc & Chọn hạng vé**:
   - Sử dụng bộ lọc hãng bay (Vietnam Airlines, Vietjet...) hoặc đổi tiêu chí sắp xếp (Rẻ nhất, Sớm nhất).
   - Bấm chọn hạng vé mong muốn (**Phổ thông**, **Thương gia** hoặc **VIP**).
4. **Bước 4 - Chọn chỗ ngồi**:
   - Quan sát sơ đồ khoang máy bay và chọn đúng 2 ghế trống mong muốn (Ví dụ: `8A, 8B`).
   - Bấm **"Tiếp tục"**.
5. **Bước 5 - Điền thông tin & Thanh toán**:
   - Điền họ tên, ngày sinh, số CCCD/Hộ chiếu của từng hành khách.
   - Chọn phương thức **"Ví điện tử SkyTicket"**.
   - Bấm **"Thanh toán"** ➔ Hệ thống xuất mã PNR và trừ tiền ví kèm ghi nhận sổ cái.
6. **Bước 6 - Quản lý vé**:
   - Vào mục **"Vé của tôi"** để xem lại vé vừa đặt.
   - Bấm **"Lịch sử giao dịch"** để kiểm tra biến động số dư và `balance_after`.

---

## 7. Định hướng phát triển (Roadmap)

- [ ] **React Router v6**: Chuyển đổi từ custom page state sang URL routing chính thống (`/flights`, `/booking/:id`, `/tickets`) để hỗ trợ reload deep-link và nút Back/Forward của trình duyệt.
- [ ] **Hỗ trợ chọn chiều về toàn diện**: Thêm màn hình chọn chuyến bay chiều về cho vé Khứ hồi và tính tổng chi phí 2 chiều.
- [ ] **Backend REST API**: Xây dựng backend (Node.js/Express hoặc NestJS / Go) với cơ sở dữ liệu PostgreSQL thực thụ.
- [ ] **Tích hợp cổng thanh toán thực**: Kết nối VNPay Sandbox, MoMo hoặc Stripe.
- [ ] **Xuất vé PDF & Mã QR Code**: Tạo vé điện tử e-ticket PDF để tải về máy hoặc gửi qua Email.

---

*Phát triển bởi đội ngũ kỹ sư phần mềm SkyTicket · 2026*
