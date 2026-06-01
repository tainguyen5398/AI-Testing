# Project Context - Game User Management System

## 1. Tổng quan dự án

- **Tên dự án**: Game User Management System
- **Mô tả**: Hệ thống quản lý người dùng chơi game và các chương trình khuyến mãi
- **Mục tiêu**: Quản lý tài khoản, hoạt động người dùng và tối ưu trải nghiệm chơi game

---

## 2. Phạm vi chức năng (Functional Scope)

### 2.1 Quản lý User

- Đăng ký tài khoản mới
- Đăng nhập / Đăng xuất
- Xác thực người dùng (Authentication & Authorization)
- Quản lý thông tin cá nhân (Profile)
- Phân quyền vai trò (Admin, Player, VIP)
- Khóa / Mở tài khoản
- Xem lịch sử hoạt động (Activity Log)

### 2.2 Quản lý Khuyến mãi

- Tạo / Chỉnh sửa / Xóa khuyến mãi
- Phân loại khuyến mãi: Gift Code, Cashback, Bonus XP, First Purchase Discount,...
- Thiết lập điều kiện áp dụng: level tối thiểu, thời gian, số lượng giới hạn
- Tracking & báo cáo hiệu quả khuyến mãi

### 2.3 Các chức năng khác

- In-game Purchase / Thanh toán
- Leaderboard / Ranking
- Inventory / Item Management
- Notification / Event System
- Support Ticket

---

## 3. Các đối tượng chính (Key Entities)

### User

| Field | Type | Mô tả |
|-------|------|-------|
| user_id | UUID | Khóa chính |
| username | String | Tên đăng nhập (unique) |
| email | String | Email (unique) |
| password_hash | String | Mật khẩu đã mã hóa |
| role | Enum | admin / player / vip |
| status | Enum | active / banned / suspended |
| level | Integer | Cấp độ người chơi |
| exp | Integer | Điểm kinh nghiệm |
| balance | Decimal | Số dư tài khoản |
| created_at | DateTime | Ngày tạo |
| last_login | DateTime | Lần đăng nhập cuối |

### Promotion

| Field | Type | Mô tả |
|-------|------|-------|
| promotion_id | UUID | Khóa chính |
| name | String | Tên khuyến mãi |
| type | Enum | gift_code / cashback / bonus_xp / discount |
| description | String | Mô tả chi tiết |
| start_date | DateTime | Ngày bắt đầu |
| end_date | DateTime | Ngày kết thúc |
| conditions | JSON | Điều kiện áp dụng |
| reward_value | Decimal | Giá trị thưởng |
| max_usage | Integer | Số lần sử dụng tối đa |
| used_count | Integer | Số lần đã sử dụng |
| status | Enum | draft / active / expired / cancelled |

### GiftCode

| Field | Type | Mô tả |
|-------|------|-------|
| code | String | Mã gift (unique) |
| promotion_id | UUID | Khuyến mãi liên kết |
| status | Enum | active / used / expired |
| claimed_by | UUID | User đã nhận (nullable) |
| claimed_at | DateTime | Thời gian nhận |

### Transaction

| Field | Type | Mô tả |
|-------|------|-------|
| transaction_id | UUID | Khóa chính |
| user_id | UUID | User thực hiện |
| type | Enum | deposit / withdraw / purchase / reward |
| amount | Decimal | Số tiền |
| status | Enum | pending / success / failed |
| created_at | DateTime | Ngày tạo |

---

## 4. Ràng buộc nghiệp vụ (Business Rules)

### Authentication & Authorization

| Rule ID | Mô tả |
|---------|-------|
| AUTH-01 | Email phải unique và đúng format |
| AUTH-02 | Password tối thiểu 8 ký tự, có chữ hoa/thường/số |
| AUTH-03 | 1 IP tối đa đăng ký 5 tài khoản/ngày |
| AUTH-04 | Tài khoản bị khóa tạm 5 phút sau 5 lần đăng nhập sai |

### User Management

| Rule ID | Mô tả |
|---------|-------|
| USER-01 | Username không chứa ký tự đặc biệt, 3-20 ký tự |
| USER-02 | User không thể tự thay đổi role của mình |
| USER-03 | Admin không thể tự khóa tài khoản mình |
| USER-04 | VIP role chỉ được assign bởi Admin |

### Promotion Management

| Rule ID | Mô tả |
|---------|-------|
| PROM-01 | Khuyến mãi không được trùng thời gian với khuyến mãi cùng loại |
| PROM-02 | Gift code 1 lần sử dụng cho 1 user |
| PROM-03 | Reward không vượt quá ngân sách đã thiết lập |
| PROM-04 | Khuyến mãi phải có ngày kết thúc sau ngày bắt đầu |
| PROM-05 | Điều kiện áp dụng phải được validate trước khi lưu |

### Transaction

| Rule ID | Mô tả |
|---------|-------|
| TRAN-01 | Số dư không được âm |
| TRAN-02 | Deposit phải qua payment gateway verify |
| TRAN-03 | Reward chỉ được cộng vào tài khoản khi transaction success |

---

## 5. User Flows chính

### Đăng ký & Đăng nhập

```
[User] → Nhấn Register → Nhập thông tin → Validate → Tạo tài khoản → Email Verify → [Login] → [Dashboard]
```

### Quản lý Khuyến mãi (Admin)

```
[Admin] → Login → Vào trang Promotion → Create Promotion → Thiết lập điều kiện → Review → Publish
```

### Nhận Gift Code (Player)

```
[Player] → Login → Xem danh sách Promotion → Chọn Gift Code → Validate điều kiện → Claim → Nhận Reward
```

---

## 6. Integration Points

| Service | Mô tả | Protocol |
|---------|-------|----------|
| Payment Gateway | Xử lý thanh toán | REST API |
| Email Service | Gửi email xác thực, notification | SMTP / API |
| Game Server | Sync data user, level, inventory | WebSocket |
| Analytics Platform | Tracking user behavior | REST API |

---

## 7. Non-Functional Requirements

| Requirement | Tiêu chuẩn |
|-------------|------------|
| Performance | Login < 2s, Gift claim < 3s |
| Security | Encrypt password (bcrypt), prevent SQL injection, rate limiting |
| Scalability | Hỗ trợ 10,000+ concurrent users |
| Availability | 99.9% uptime |
| Data Integrity | Backup daily, point-in-time recovery |

---

## 8. Environments

- **Development**: Local dev environment
- **Staging**: Pre-production testing
- **Production**: Live environment

---

## 9. Glossary

| Term | Định nghĩa |
|------|------------|
| Gift Code | Mã khuyến mãi dùng một lần |
| VIP | Tài khoản người chơi ưu tiên |
| Cashback | Hoàn tiền sau giao dịch |
| Claim | Hành động nhận reward |
