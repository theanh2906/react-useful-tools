# Useful Tools - Business Logic Document

## 📋 Mục lục

1. [Tổng quan ứng dụng](#1-tổng-quan-ứng-dụng)
2. [Module Authentication](#2-module-authentication)
3. [Module Dashboard](#3-module-dashboard)
4. [Module Calendar & Events](#4-module-calendar--events)
5. [Module Notes](#5-module-notes)
6. [Module File Storage](#6-module-file-storage)
7. [Module Baby Tracker](#7-module-baby-tracker)
8. [Module Food Management](#8-module-food-management)
9. [Module Weather](#9-module-weather)
10. [Module System Monitor](#10-module-system-monitor)
11. [Module Live Share](#11-module-live-share)
12. [Module Utilities](#12-module-utilities)
13. [Data Flow & Relationships](#13-data-flow--relationships)
14. [User Roles & Permissions](#14-user-roles--permissions)

---

## 1. Tổng quan ứng dụng

### 1.1 Mục đích

**Useful Tools** là một ứng dụng đa năng phục vụ 2 nhóm chức năng chính:

1. **Pregnancy & Baby Tracking** - Theo dõi thai kỳ và em bé
2. **Productivity Tools** - Các công cụ tiện ích hàng ngày

### 1.2 Đối tượng người dùng

| Người dùng          | Mô tả                   | Tính năng chính                                                        |
| ------------------- | ----------------------- | ---------------------------------------------------------------------- |
| **Bà mẹ mang thai** | Theo dõi thai kỳ        | Dashboard, Calendar, Baby Tracker, Food Management, Ultrasound Gallery |
| **Gia đình**        | Theo dõi em bé sau sinh | Baby Tracker (Peanut), Timeline                                        |
| **Developer/Admin** | Giám sát hệ thống       | System Monitor, Terminal                                               |
| **General User**    | Người dùng phổ thông    | Notes, Storage, Weather, QR Tools                                      |

### 1.3 Tính năng tổng quan

```
┌─────────────────────────────────────────────────────────────────┐
│                        USEFUL TOOLS                              │
├─────────────────────────────────────────────────────────────────┤
│  🏠 Dashboard                                                    │
│    ├── Pregnancy Progress                                        │
│    ├── Countdown to Due Date                                     │
│    ├── Quick Stats                                               │
│    └── Recent Activities                                         │
├─────────────────────────────────────────────────────────────────┤
│  👶 Baby & Family                    │  📋 Productivity          │
│    ├── Baby Tracker (Peanut/Soya)   │    ├── Calendar           │
│    ├── Ultrasound Gallery           │    ├── Notes              │
│    ├── Food Management              │    ├── File Storage       │
│    ├── Timeline                     │    └── Live Share         │
│    └── Events Calendar              │                            │
├─────────────────────────────────────────────────────────────────┤
│  🔧 Utilities                        │  🖥️ Development           │
│    ├── Weather Forecast             │    ├── System Monitor     │
│    ├── QR Scanner                   │    ├── Terminal           │
│    ├── QR Generator                 │    └── Jenkins Dashboard  │
│    ├── Crypto Tools                 │                            │
│    └── Time Calculator              │                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Module Authentication

### 2.1 Phương thức đăng nhập

| Phương thức        | Mô tả                               | Use Case                                            |
| ------------------ | ----------------------------------- | --------------------------------------------------- |
| **Email/Password** | Đăng nhập truyền thống qua Firebase | Người dùng mới, không có tài khoản Google/Microsoft |
| **Google OAuth**   | Đăng nhập bằng tài khoản Google     | Người dùng phổ thông                                |
| **Azure AD SSO**   | Single Sign-On qua Microsoft        | Người dùng doanh nghiệp                             |

### 2.2 Business Rules

1. **Session Management**
   - Token được lưu trong `sessionStorage`
   - Auto logout khi token hết hạn
   - Auto login nếu có session hợp lệ

2. **Protected Routes**
   - `/notes` - Yêu cầu đăng nhập
   - `/invoice` - Yêu cầu đăng nhập
   - `/live-share` - Redirect đến admin room nếu đã đăng nhập

3. **Registration**
   - Đăng ký qua Firebase Auth
   - Lưu user profile vào backend

### 2.3 User Flow

```
┌──────────────────────────────────────────────────────────────┐
│                      LOGIN FLOW                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│   User truy cập app                                          │
│         │                                                     │
│         ▼                                                     │
│   ┌─────────────────┐                                        │
│   │ Có session?     │──── Yes ───▶ Auto Login ───▶ Dashboard │
│   └─────────────────┘                                        │
│         │ No                                                  │
│         ▼                                                     │
│   ┌─────────────────┐                                        │
│   │ Login Page      │                                        │
│   │ - Email/Pass    │                                        │
│   │ - Google        │                                        │
│   │ - Azure AD      │                                        │
│   └─────────────────┘                                        │
│         │                                                     │
│         ▼                                                     │
│   Xác thực thành công                                        │
│         │                                                     │
│         ▼                                                     │
│   Lưu token + Redirect về trang yêu cầu                      │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Module Dashboard

### 3.1 Mục đích

Trang tổng quan hiển thị thông tin quan trọng nhất về thai kỳ và các hoạt động gần đây.

### 3.2 Thông tin hiển thị

#### 3.2.1 Pregnancy Progress

| Thông tin          | Mô tả              | Cách tính                                     |
| ------------------ | ------------------ | --------------------------------------------- |
| **Current Week**   | Tuần thai hiện tại | Dựa trên ngày dự sinh (EDD)                   |
| **Trimester**      | Giai đoạn thai kỳ  | Week 1-12: First, 13-27: Second, 28-40: Third |
| **Progress Bar**   | Tiến độ thai kỳ    | (currentWeek / 40) × 100%                     |
| **Days Remaining** | Số ngày còn lại    | EDD - Today                                   |

#### 3.2.2 Peanut Age (Em bé đã sinh)

| Thông tin         | Mô tả         |
| ----------------- | ------------- |
| **Age in Days**   | Số ngày tuổi  |
| **Age in Weeks**  | Số tuần tuổi  |
| **Age in Months** | Số tháng tuổi |

#### 3.2.3 Countdown Timer

- Đếm ngược realtime đến ngày dự sinh (EDD)
- Hiển thị: Days, Hours, Minutes, Seconds

#### 3.2.4 Quick Stats Cards

| Card                | Dữ liệu                  |
| ------------------- | ------------------------ |
| Development Records | Tổng số bản ghi theo dõi |
| Scheduled Events    | Số sự kiện đã lên lịch   |
| Ultrasound Scans    | Số ảnh siêu âm           |
| Food Items          | Số thực phẩm đã quản lý  |

### 3.3 Business Rules

1. **Soya (Thai nhi)**
   - Ngày dự sinh (EDD) được tính từ ngày thụ thai + 280 ngày
   - Tuần thai = (Today - ConceptionDate) / 7

2. **Peanut (Em bé đã sinh)**
   - Tuổi tính từ ngày sinh
   - Hiển thị chart tăng trưởng

3. **Recent Activities**
   - Hiển thị 5 hoạt động gần nhất
   - Sắp xếp theo thời gian giảm dần

---

## 4. Module Calendar & Events

### 4.1 Mục đích

Quản lý lịch hẹn khám, siêu âm, và các sự kiện liên quan đến thai kỳ.

### 4.2 Loại sự kiện (Categories)

| Category        | Màu sắc                  | Mô tả           |
| --------------- | ------------------------ | --------------- |
| **Appointment** | 🩷 Baby Pink (#FFD1DC)   | Hẹn khám bác sĩ |
| **Ultrasound**  | 💙 Light Blue (#AECBFA)  | Lịch siêu âm    |
| **Checkup**     | 💚 Mint Green (#B5EAD7)  | Khám định kỳ    |
| **Other**       | 💛 Pale Yellow (#FFF9B1) | Sự kiện khác    |

### 4.3 Event Data Structure

| Field           | Bắt buộc | Mô tả                     |
| --------------- | -------- | ------------------------- |
| `title`         | ✅       | Tiêu đề sự kiện           |
| `date`          | ✅       | Ngày diễn ra (YYYY-MM-DD) |
| `time`          | ❌       | Giờ diễn ra (HH:mm)       |
| `category`      | ✅       | Loại sự kiện              |
| `notes`         | ❌       | Ghi chú thêm              |
| `location`      | ❌       | Địa điểm                  |
| `recurring`     | ❌       | Có lặp lại không          |
| `recurringType` | ❌       | weekly / monthly / none   |
| `reminder`      | ❌       | Bật nhắc nhở              |

### 4.4 Recurring Events (Sự kiện lặp lại)

| Loại          | Chu kỳ           |
| ------------- | ---------------- |
| **NONE**      | Không lặp        |
| **MONTHLY**   | Hàng tháng       |
| **QUARTERLY** | 3 tháng/lần      |
| **YEARLY**    | Hàng năm         |
| **BIENNIAL**  | 2 năm/lần        |
| **CUSTOM**    | Tùy chỉnh số năm |

### 4.5 Business Rules

1. **Event Creation**
   - Có thể tạo event bằng click vào ngày
   - Có thể tạo event bằng drag để chọn range
   - Event có thể all-day hoặc có thời gian cụ thể

2. **Event Modification**
   - Drag & Drop để thay đổi ngày
   - Resize để thay đổi duration
   - Click để edit chi tiết

3. **Filtering**
   - Filter theo category
   - Filter theo tag
   - Filter theo important flag

4. **Views**
   - Month View (default)
   - Week View
   - Day View
   - Compact / Comfort mode

### 4.6 User Flow

```
┌────────────────────────────────────────────────────────────┐
│                    EVENT MANAGEMENT FLOW                    │
├────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────┐                                          │
│   │ Calendar    │                                          │
│   │ View        │                                          │
│   └─────────────┘                                          │
│         │                                                   │
│         ├──── Click Date ────▶ Create New Event Dialog     │
│         │                                                   │
│         ├──── Click Event ───▶ Edit Event Dialog           │
│         │                                                   │
│         ├──── Drag Event ────▶ Change Date (Auto Save)     │
│         │                                                   │
│         └──── Resize Event ──▶ Change Duration (Auto Save) │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## 5. Module Notes

### 5.1 Mục đích

Ghi chú với rich text editor, hỗ trợ phân loại theo categories.

### 5.2 Note Data Structure

| Field          | Bắt buộc | Mô tả                          |
| -------------- | -------- | ------------------------------ |
| `id`           | ✅       | ID unique                      |
| `title`        | ✅       | Tiêu đề note                   |
| `content`      | ✅       | Nội dung (HTML từ rich editor) |
| `createdDate`  | ✅       | Ngày tạo (timestamp)           |
| `modifiedDate` | ❌       | Ngày sửa cuối                  |
| `categories`   | ❌       | Danh sách categories           |

### 5.3 Rich Text Features

- Bold, Italic, Underline
- Headers (H1-H6)
- Lists (bullet, numbered)
- Links
- Images
- Code blocks
- Quotes

### 5.4 Business Rules

1. **Sorting**
   - Mặc định sắp xếp theo `createdDate` giảm dần (mới nhất trước)

2. **Search**
   - Tìm kiếm theo title và content
   - Case-insensitive

3. **Sync**
   - Notes được sync giữa Firebase và local database
   - Có nút Sync thủ công

4. **Protected**
   - Yêu cầu đăng nhập để truy cập

---

## 6. Module File Storage

### 6.1 Mục đích

Upload, quản lý và chia sẻ files qua Firebase Storage.

### 6.2 File Operations

| Operation         | Mô tả                                 |
| ----------------- | ------------------------------------- |
| **Upload**        | Upload single hoặc multiple files     |
| **Download**      | Download file về máy                  |
| **Preview**       | Xem trước file (images, PDFs, videos) |
| **Delete**        | Xóa file (single hoặc bulk)           |
| **Rename**        | Đổi tên file/folder                   |
| **Create Folder** | Tạo folder mới                        |

### 6.3 Supported File Types

| Loại         | Preview          | Extensions                      |
| ------------ | ---------------- | ------------------------------- |
| **Images**   | ✅ Inline        | jpg, jpeg, png, gif, webp, svg  |
| **Videos**   | ✅ Player        | mp4, webm, ogg                  |
| **Audio**    | ✅ Player        | mp3, wav, ogg                   |
| **PDF**      | ✅ Inline        | pdf                             |
| **Office**   | ❌ Download only | doc, docx, xls, xlsx, ppt, pptx |
| **Archives** | ❌ Download only | zip, rar, 7z                    |
| **Others**   | ❌ Download only | \*                              |

### 6.4 File Display Info

| Field       | Mô tả                              |
| ----------- | ---------------------------------- |
| `name`      | Tên file                           |
| `size`      | Kích thước (formatted: KB, MB, GB) |
| `type`      | MIME type                          |
| `createdAt` | Ngày upload                        |
| `path`      | Đường dẫn trong storage            |
| `url`       | Download URL                       |

### 6.5 Business Rules

1. **Upload**
   - Drag & Drop support
   - Multiple files upload
   - Progress indicator
   - Max file size: 10GB (configurable)

2. **Folder Structure**
   - Hierarchical folder support
   - Navigate bằng breadcrumb
   - Recursive listing

3. **Bulk Operations**
   - Select multiple files
   - Bulk delete
   - Bulk download (zip)

---

## 7. Module Baby Tracker

### 7.1 Mục đích

Theo dõi sự phát triển của thai nhi (Soya) và em bé đã sinh (Peanut).

### 7.2 Hai đối tượng tracking

| Đối tượng  | Mô tả              | Dữ liệu tracking                          |
| ---------- | ------------------ | ----------------------------------------- |
| **Peanut** | Em bé đã sinh      | Weight, Height, Heart Rate, Notes         |
| **Soya**   | Thai nhi đang mang | Gestational Age, Ultrasound, Measurements |

### 7.3 Peanut Data (Em bé đã sinh)

| Field       | Unit | Mô tả         |
| ----------- | ---- | ------------- |
| `date`      | -    | Ngày ghi nhận |
| `weight`    | kg   | Cân nặng      |
| `height`    | cm   | Chiều cao     |
| `heartRate` | bpm  | Nhịp tim      |
| `notes`     | -    | Ghi chú       |

### 7.4 Soya Data (Thai nhi)

| Field                          | Mô tả                                        |
| ------------------------------ | -------------------------------------------- |
| `date`                         | Ngày khám/siêu âm                            |
| `gestationalAge`               | Tuổi thai (vd: "10 weeks", "7 weeks 6 days") |
| `ultrasoundImageUrl`           | URL ảnh siêu âm                              |
| `measurements.crownRumpLength` | Chiều dài đầu-mông (mm)                      |
| `measurements.bloodPressure`   | Huyết áp (vd: "93/49")                       |
| `measurements.heartRate`       | Nhịp tim thai (bpm)                          |
| `pregnantMom.weight`           | Cân nặng mẹ (kg)                             |
| `notes`                        | Ghi chú                                      |

### 7.5 BMI Calculator (Cho mẹ)

| BMI Range   | Category    | Màu       |
| ----------- | ----------- | --------- |
| < 18.5      | Underweight | 🔵 Blue   |
| 18.5 - 24.9 | Normal      | 🟢 Green  |
| 25 - 29.9   | Overweight  | 🟠 Orange |
| ≥ 30        | Obese       | 🔴 Red    |

**Công thức**: BMI = Weight(kg) / Height(m)²

### 7.6 Pregnancy Development Standards

| Week | Weight Range (g) |
| ---- | ---------------- |
| 12   | 5 - 10           |
| 16   | 80 - 120         |
| 20   | 250 - 350        |
| 24   | 500 - 700        |
| 28   | 900 - 1,200      |
| 32   | 1,500 - 2,000    |
| 36   | 2,200 - 2,800    |
| 40   | 2,800 - 3,800    |

### 7.7 Ultrasound Gallery

- Upload ảnh siêu âm
- Link với Soya record
- Hiển thị theo timeline
- Support image preview

---

## 8. Module Food Management

### 8.1 Mục đích

Quản lý danh sách thực phẩm an toàn và cần tránh trong thai kỳ.

### 8.2 Food Categories

| Category            | Mô tả                        |
| ------------------- | ---------------------------- |
| **Safe Foods**      | Thực phẩm an toàn cho bà bầu |
| **Forbidden Foods** | Thực phẩm cần tránh          |
| **Limited Foods**   | Thực phẩm nên hạn chế        |

### 8.3 Food Data Structure

| Field          | Mô tả                              |
| -------------- | ---------------------------------- |
| `name`         | Tên thực phẩm                      |
| `category`     | Phân loại (safe/forbidden/limited) |
| `description`  | Mô tả chi tiết                     |
| `reason`       | Lý do (đối với forbidden/limited)  |
| `alternatives` | Thực phẩm thay thế                 |

### 8.4 Business Rules

1. **Search**: Tìm kiếm theo tên
2. **Filter**: Lọc theo category
3. **Quick Check**: Kiểm tra nhanh 1 loại thực phẩm

---

## 9. Module Weather

### 9.1 Mục đích

Xem thông tin thời tiết hiện tại và dự báo 7 ngày.

### 9.2 Weather Data

#### Current Conditions

| Field        | Unit  | Mô tả                    |
| ------------ | ----- | ------------------------ |
| `temp`       | °C    | Nhiệt độ                 |
| `feelslike`  | °C    | Cảm giác như             |
| `humidity`   | %     | Độ ẩm                    |
| `windspeed`  | km/h  | Tốc độ gió               |
| `conditions` | -     | Mô tả (Sunny, Cloudy...) |
| `icon`       | -     | Icon thời tiết           |
| `sunrise`    | HH:mm | Giờ mặt trời mọc         |
| `sunset`     | HH:mm | Giờ mặt trời lặn         |

#### 7-Day Forecast

| Field        | Mô tả               |
| ------------ | ------------------- |
| `datetime`   | Ngày                |
| `tempmax`    | Nhiệt độ cao nhất   |
| `tempmin`    | Nhiệt độ thấp nhất  |
| `conditions` | Điều kiện thời tiết |
| `icon`       | Icon                |

### 9.3 Location Options

1. **Search by name**: Nhập tên thành phố/quốc gia
2. **Current location**: Sử dụng GPS của device
3. **Popular destinations**: Chọn từ danh sách có sẵn

### 9.4 Business Rules

1. **Geolocation**
   - Request permission khi user click "My Location"
   - Fallback về search nếu không có permission

2. **Popular Destinations**
   - Danh sách 280+ địa điểm
   - Bao gồm các thành phố Việt Nam

---

## 10. Module System Monitor

### 10.1 Mục đích

Giám sát realtime các hệ thống: Devices, Jenkins, Kafka.

### 10.2 Device Monitoring

#### Device Data

| Field               | Mô tả                 |
| ------------------- | --------------------- |
| `device_name`       | Tên thiết bị          |
| `status`            | up / down             |
| `last_update`       | Lần cập nhật cuối     |
| `memory_percentage` | % RAM sử dụng         |
| `cpu_usage`         | % CPU sử dụng         |
| `disk_usage`        | % Disk sử dụng        |
| `network_stats`     | Upload/Download speed |

#### Status Rules

| Condition                  | Status  |
| -------------------------- | ------- |
| Có data trong 60s gần nhất | 🟢 Up   |
| Không có data > 60s        | 🔴 Down |

### 10.3 Jenkins Monitoring

#### Job Status Colors

| Color      | Meaning             | Severity       |
| ---------- | ------------------- | -------------- |
| `blue`     | Success             | ✅ Success     |
| `red`      | Failed              | ❌ Danger      |
| `yellow`   | Unstable            | ⚠️ Warning     |
| `grey`     | Pending/Never built | ℹ️ Info        |
| `disabled` | Disabled            | ℹ️ Info        |
| `aborted`  | Aborted             | ℹ️ Info        |
| `*_anime`  | Building            | 🔄 In Progress |

#### Metrics

- Total Jobs
- Executors
- Queue Items
- Server Health
- Success/Failed/Unstable counts

### 10.4 Kafka Monitoring

#### Cluster Info

- Broker count
- Total topics
- Total partitions
- Consumer groups

#### Topic Info

- Partition count
- Replication factor
- Message count
- Size

#### Consumer Group Info

- Group state
- Members
- Lag

### 10.5 Real-time Updates

| Component | Protocol       | Interval       |
| --------- | -------------- | -------------- |
| Devices   | STOMP/RabbitMQ | Real-time push |
| Jenkins   | SSE            | 5 seconds      |
| Kafka     | SSE            | 5 seconds      |

---

## 11. Module Live Share

### 11.1 Mục đích

Chia sẻ text và files realtime giữa các devices/users.

### 11.2 Room Concept

- Mỗi room có unique ID
- Room chứa messages và files
- Anonymous users có thể tham gia bằng room ID
- Logged-in users có admin room riêng

### 11.3 Room Content Types

| Type             | Mô tả            |
| ---------------- | ---------------- |
| **Text Message** | Tin nhắn văn bản |
| **File**         | File đã upload   |

### 11.4 Room Operations

| Operation     | Mô tả                 |
| ------------- | --------------------- |
| Create Room   | Tạo room mới          |
| Join Room     | Tham gia room bằng ID |
| Send Message  | Gửi tin nhắn          |
| Upload File   | Upload và share file  |
| Clear History | Xóa toàn bộ lịch sử   |
| Delete Room   | Xóa room              |

### 11.5 User Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     LIVE SHARE FLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────────┐                                          │
│   │ User A       │                                          │
│   │ (Logged in)  │                                          │
│   └──────────────┘                                          │
│         │                                                    │
│         ▼                                                    │
│   Get/Create Admin Room ───▶ Room ID: abc123                │
│         │                                                    │
│         ▼                                                    │
│   Share Room ID với User B                                  │
│                                                              │
│   ┌──────────────┐                                          │
│   │ User B       │                                          │
│   │ (Anonymous)  │                                          │
│   └──────────────┘                                          │
│         │                                                    │
│         ▼                                                    │
│   Enter Room ID: abc123                                     │
│         │                                                    │
│         ▼                                                    │
│   ┌─────────────────────────────────┐                       │
│   │         SHARED ROOM             │                       │
│   │  ┌─────────────────────────┐   │                       │
│   │  │ Message 1 (User A)      │   │                       │
│   │  │ File: image.png         │   │                       │
│   │  │ Message 2 (User B)      │   │                       │
│   │  └─────────────────────────┘   │                       │
│   └─────────────────────────────────┘                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 12. Module Utilities

### 12.1 QR Scanner

- Scan QR code bằng camera
- Hiển thị kết quả
- Copy to clipboard
- Open URL (nếu là link)

### 12.2 QR Generator

- Input text/URL
- Generate QR code
- Download as image
- Customize size/color

### 12.3 Crypto Tools

- Encrypt/Decrypt text
- Algorithms: AES, DES, TripleDES, RC4
- Input key manual

### 12.4 Time Calculator

- Tính khoảng cách giữa 2 thời điểm
- Add/Subtract time
- Convert timezones

### 12.5 Text Case Changer

- UPPERCASE
- lowercase
- Title Case
- Sentence case
- camelCase
- snake_case
- kebab-case

### 12.6 Zip Tool

- Select multiple files
- Create zip archive
- Download zip

---

## 13. Data Flow & Relationships

### 13.1 Data Sources

```
┌─────────────────────────────────────────────────────────────┐
│                      DATA SOURCES                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────────┐     ┌─────────────────┐              │
│   │ Firebase        │     │ Backend API     │              │
│   │ Realtime DB     │     │ (Node.js)       │              │
│   ├─────────────────┤     ├─────────────────┤              │
│   │ • Events        │     │ • Notes (local) │              │
│   │ • Peanut data   │     │ • Files (local) │              │
│   │ • Soya data     │     │ • Jenkins proxy │              │
│   │ • Notes (cloud) │     │ • Kafka proxy   │              │
│   └─────────────────┘     │ • Live Share    │              │
│                           │ • WebSocket     │              │
│   ┌─────────────────┐     └─────────────────┘              │
│   │ Firebase        │                                       │
│   │ Storage         │     ┌─────────────────┐              │
│   ├─────────────────┤     │ External APIs   │              │
│   │ • Files         │     ├─────────────────┤              │
│   │ • Ultrasounds   │     │ • Weather API   │              │
│   └─────────────────┘     │ • Jenkins API   │              │
│                           │ • Google OAuth  │              │
│   ┌─────────────────┐     │ • Azure AD      │              │
│   │ RabbitMQ        │     └─────────────────┘              │
│   ├─────────────────┤                                       │
│   │ • Device msgs   │                                       │
│   └─────────────────┘                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 13.2 Data Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                   ENTITY RELATIONSHIPS                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   User ────────────────────────────────────────────────────│
│     │                                                        │
│     ├──── has many ──── Notes                               │
│     │                                                        │
│     ├──── has many ──── Events                              │
│     │                    │                                   │
│     │                    └── belongs to ── Category         │
│     │                                                        │
│     ├──── has many ──── Files                               │
│     │                                                        │
│     ├──── has one ───── Peanut (Baby)                       │
│     │                    │                                   │
│     │                    └── has many ── Development Records│
│     │                                                        │
│     ├──── has one ───── Soya (Pregnancy)                    │
│     │                    │                                   │
│     │                    ├── has many ── Ultrasound Records │
│     │                    │                                   │
│     │                    └── has many ── Checkup Records    │
│     │                                                        │
│     └──── has one ───── Admin Room (Live Share)             │
│                          │                                   │
│                          ├── has many ── Messages           │
│                          │                                   │
│                          └── has many ── Shared Files       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 14. User Roles & Permissions

### 14.1 Role Definitions

| Role              | Mô tả          |
| ----------------- | -------------- |
| **Anonymous**     | Chưa đăng nhập |
| **Authenticated** | Đã đăng nhập   |
| **Admin**         | Quản trị viên  |

### 14.2 Permission Matrix

| Feature        | Anonymous    | Authenticated  | Admin   |
| -------------- | ------------ | -------------- | ------- |
| Dashboard      | ✅           | ✅             | ✅      |
| Calendar       | ✅ View      | ✅ Full        | ✅ Full |
| Notes          | ❌           | ✅ Full        | ✅ Full |
| Storage        | ✅ View      | ✅ Full        | ✅ Full |
| Baby Tracker   | ✅ View      | ✅ Full        | ✅ Full |
| Weather        | ✅           | ✅             | ✅      |
| QR Tools       | ✅           | ✅             | ✅      |
| System Monitor | ✅ View      | ✅ View        | ✅ Full |
| Live Share     | ✅ Join Room | ✅ Create Room | ✅ Full |

### 14.3 Data Isolation

- Mỗi user chỉ thấy data của mình
- Shared data qua Live Share rooms
- System Monitor data là public (read-only)

---

## 📝 Tóm tắt Business Logic

### Core Features

1. **Pregnancy Tracking** - Theo dõi thai kỳ với EDD countdown, development records
2. **Event Management** - Calendar với recurring events, categories, reminders
3. **Note Taking** - Rich text notes với categories
4. **File Storage** - Cloud storage với preview, folders
5. **Real-time Sharing** - Live Share rooms cho collaboration

### Key Calculations

1. **Pregnancy Week** = (Today - ConceptionDate) / 7
2. **EDD** = ConceptionDate + 280 days
3. **BMI** = Weight(kg) / Height(m)²
4. **Baby Age** = Today - BirthDate

### Integration Points

1. Firebase (Auth, Realtime DB, Storage, Messaging)
2. Google OAuth
3. Azure AD SSO
4. Visual Crossing Weather API
5. Jenkins API
6. Kafka (via backend proxy)
7. RabbitMQ (STOMP)
8. Socket.io / SSE

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-16
