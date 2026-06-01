# Testing Context - QA Knowledge Foundation

## 1. Tổng quan Testing

### 1.1 Các cấp độ Testing (Testing Levels)

| Level | Mô tả | Mục tiêu | Ví dụ |
|-------|-------|----------|-------|
| **Unit Testing** | Test từng component/function riêng lẻ | Code hoạt động đúng logic | Test function `validateEmail()` |
| **Integration Testing** | Test kết hợp nhiều modules | Data flow giữa các modules | Test register → tạo user → gửi email |
| **System Testing** | Test toàn bộ hệ thống | Hệ thống đáp ứng requirements | Test full flow user đăng nhập → nhận gift |
| **E2E Testing** | Test từ đầu đến cuối như user thật | Simulate real user scenarios | Player đăng ký → chơi → nhận reward |

### 1.2 Các loại Testing (Testing Types)

| Type | Mục đích | Khi nào áp dụng |
|------|----------|------------------|
| **Functional Testing** | Kiểm tra chức năng hoạt động đúng spec | Luôn luôn |
| **Non-Functional Testing** | Performance, Security, Usability | Sau functional |
| **Smoke Testing** | Xác nhận build ổn định, chạy nhanh | Mỗi build mới |
| **Sanity Testing** | Kiểm tra nhanh chức năng cụ thể sau fix | Sau khi fix bug |
| **Regression Testing** | Đảm bảo fix mới không phá code cũ | Sau mỗi release |
| **Ad-hoc Testing** | Test không theo kế hoạch, dựa vào kinh nghiệm | Exploratory testing |
| **Security Testing** | Phát hiện lỗ hổng bảo mật | Trước release |

---

## 2. Test Design Techniques

### 2.1 Black Box Testing

Kiểm thử **không cần biết code**, chỉ dựa vào requirements và inputs/outputs.

| Technique | Mô tả | Ví dụ |
|-----------|-------|-------|
| **Equivalence Partitioning (EP)** | Chia input thành các nhóm tương đương, test đại diện | Username: valid (3-20 chars), invalid (<3, >20) |
| **Boundary Value Analysis (BVA)** | Test ở ranh giới của partition | Username: test 2, 3, 20, 21 chars |
| **Decision Table Testing** | Test kết hợp input/conditions và expected output | Login: correct/incorrect user + pass |
| **State Transition Testing** | Test các trạng thái và transition | User: active ↔ banned ↔ suspended |
| **Use Case Testing** | Test dựa trên use cases | UC-01: User đăng ký thành công |

### 2.2 White Box Testing

Kiểm thử **cần biết code**, test logic và cấu trúc bên trong.

| Technique | Mô tả | Ví dụ |
|-----------|-------|-------|
| **Statement Coverage** | Tất cả statements được execute | Coverage ≥ 80% |
| **Branch Coverage** | Tất cả branches (if/else) được test | Coverage ≥ 70% |
| **Path Coverage** | Tất cả paths trong code được test | Coverage ≥ 50% |

### 2.3 Grey Box Testing

Kết hợp cả hai - biết partially về internal structure.

| Technique | Mô tả | Ví dụ |
|-----------|-------|-------|
| **API Testing** | Test API endpoints với headers, params | POST /api/auth/login |
| **Database Testing** | Verify data sau operation | Check user inserted vào DB |

---

## 3. Test Case Structure

### 3.1 Standard Test Case Format

```
Test Case ID: TC-XXX-YYY
Title: [Mô tả ngắn gọn chức năng]
Module: [Tên module]
Priority: [P0/P1/P2/P3]
Device: [WIN PC/Android/iPhone/iPad/API]
Automation: [Manual/Automated/Both]
Pre-conditions: [Điều kiện trước]
Test Steps:
  1. [Step 1]
  2. [Step 2]
  3. [Step 3]
Test Data: [Dữ liệu sử dụng]
Expected Result: [Kết quả mong đợi]
Actual Result: [Kết quả thực tế - sau khi execute]
Status: [Pass/Fail/Blocked]
```

| Field | Mô tả | Ví dụ |
|-------|-------|-------|
| **Test Case ID** | Mã định danh duy nhất | TC-AUTH-001 |
| **Title** | Tên ngắn gọn mô tả test case | Verify login with valid credentials |
| **Module** | Module chức năng đang test | Authentication, Promotion, User |
| **Priority** | Mức độ ưu tiên | P0, P1, P2, P3 |
| **Device** | Thiết bị/platform test | Web, Mobile, Desktop, API, All |
| **Automation** | Loại test thực hiện | Manual, Automated, Both |
| **Pre-conditions** | Điều kiện cần có trước khi test | User đã đăng ký, Đã login |
| **Test Steps** | Các bước thực hiện | 1. Navigate to login page... |
| **Test Data** | Dữ liệu đầu vào | Email: test@example.com, Pass: Test123 |
| **Expected Result** | Kết quả mong đợi | Login thành công, redirect to dashboard |
| **Actual Result** | Kết quả thực tế (sau khi execute) | - |
| **Status** | Trạng thái sau khi chạy | Pass / Fail / Blocked |

### 3.2 Device Categories

| Device | Mô tả | Ghi chú |
|--------|-------|---------|
| **WIN PC** | Test trên Windows Desktop | Browser: Chrome, Firefox, Edge |
| **Android** | Test trên thiết bị Android | Smartphone Android |
| **iPhone** | Test trên iPhone | Apple mobile device |
| **iPad** | Test trên iPad | Apple tablet |
| **API** | Test trực tiếp API endpoints | Postman, REST Client |

> **Lưu ý**: Khi assign test case, **random chọn device** để đảm bảo coverage đều trên tất cả thiết bị. Mỗi device cần được test đầy đủ các case quan trọng (P0, P1) trước khi release.

### 3.3 Automation Status

| Status | Mô tả | Khi nào sử dụng |
|--------|-------|-----------------|
| **Manual** | Test thủ công | Exploratory, UX, Ad-hoc, Complex scenarios |
| **Automated** | Viết script tự động | Regression, Smoke, Data-driven tests |
| **Both** | Kết hợp cả hai | Critical flows: manual exploratory + automated regression |

### 3.2 Priority Definitions

| Priority | Ý nghĩa | Tiêu chí |
|----------|---------|----------|
| **P0 - Critical** | Không thể release nếu fail | Login, Payment, Security |
| **P1 - High** | Core features bị ảnh hưởng | User registration, Gift claim |
| **P2 - Medium** | Features quan trọng nhưng có work around | Profile edit, Password change |
| **P3 - Low** | Cosmetic, UX improvements | UI styling, Notifications |

### 3.3 Test Case Categories

| Category | Mô tả |
|----------|-------|
| **Positive Test** | Input hợp lệ → Expected behavior đúng |
| **Negative Test** | Input không hợp lệ → System handle gracefully |
| **Boundary Test** | Test ở giới hạn của input range |
| **Exception Test** | Test error handling |
| **Security Test** | Test bảo mật: SQL injection, XSS, auth bypass |

---

## 4. Game-Specific Testing Techniques

### 4.1 Game User Management Testing

| Area | Test Cases Examples |
|------|---------------------|
| **Authentication** | Login thành công, Sai pass, Tài khoản bị khóa, Token hết hạn |
| **Authorization** | Player không access được Admin panel, Admin có full access |
| **User State** | Active → Banned → Unban flow |
| **Session** | Multi-device login, Session timeout, Concurrent sessions |
| **Data Integrity** | User data không bị mất khi update, Transaction atomic |

### 4.2 Promotion Testing

| Area | Test Cases Examples |
|------|---------------------|
| **Gift Code** | Claim thành công, Claim lại (fail), Hết hạn, Hết lượt |
| **Conditions** | Level không đủ, Time chưa đến, User đã claim |
| **Concurrency** | 2 users claim code cuối cùng cùng lúc |
| **Reward Calculation** | Reward đúng với promotion config |
| **Budget Limit** | Tổng reward không vượt budget |

### 4.3 Performance & Load Testing

| Metric | Target |
|--------|--------|
| Response Time | Login < 2s, Gift claim < 3s |
| Throughput | 1000 requests/second |
| Concurrent Users | 10,000+ |
| CPU Usage | < 80% under load |
| Memory Usage | Stable, no leaks |

---

## 5. Bug Lifecycle

```
[New] → [Assigned] → [In Progress] → [Resolved] → [Verified] → [Closed]
                ↓                    ↓
            [Duplicate]          [Reopened] → ...
            [Won't Fix]
            [Cannot Reproduce]
```

### Bug Severity vs Priority

| Severity | Mô tả | Ví dụ |
|----------|-------|-------|
| **S0 - Blocker** | System không thể dùng | Crash, Data loss, Security breach |
| **S1 - Critical** | Core feature fail | Login không hoạt động |
| **S2 - Major** | Feature work nhưng sai | Gift reward sai số tiền |
| **S3 - Minor** | UI/UX issue | Text misalignment |
| **S4 - Trivial** |Cosmetic, typo | Spelling error |

---

## 6. Test Coverage Metrics

| Metric | Công thức | Target |
|--------|-----------|--------|
| **Requirement Coverage** | (Tested requirements / Total requirements) × 100% | ≥ 95% |
| **Code Coverage** | (Lines executed / Total lines) × 100% | ≥ 80% |
| **Test Suite Pass Rate** | (Passed tests / Total tests) × 100% | ≥ 95% |
| **Bug Escape Rate** | (Bugs found in prod / Total bugs) × 100% | < 10% |
| **Test Automation Coverage** | (Automated TC / Total TC) × 100% | ≥ 60% |

---

## 7. API Testing Fundamentals

### 7.1 REST API Testing Checklist

| Check | Mô tả |
|-------|-------|
| **Status Code** | 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error |
| **Response Body** | JSON structure đúng schema |
| **Response Time** | < defined SLA |
| **Headers** | Content-Type, Authorization, CORS |
| **HTTP Methods** | GET, POST, PUT, DELETE đúng semantics |
| **Pagination** | Limit, offset, total count |
| **Authentication** | Valid token, Expired token, Invalid token |

### 7.2 Common HTTP Status Codes

| Code | Meaning | Khi nào trả về |
|------|---------|----------------|
| 200 | OK | Success GET/PUT |
| 201 | Created | Success POST (tạo mới) |
| 204 | No Content | Success DELETE |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Valid token but no permission |
| 404 | Not Found | Resource không tồn tại |
| 409 | Conflict | Duplicate resource |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## 8. Database Testing

| Check | Mô tả |
|-------|-------|
| **Data Integrity** | Foreign keys, constraints được enforce |
| **Data Consistency** | Data không bị orphan/inconsistent |
| **Transaction** | Atomic operation (commit/rollback) |
| **Index Performance** | Query nhanh với index |
| **Data Migration** | Data preserve sau migration |

---

## 9. Security Testing Checklist

| Category | Test Cases |
|----------|------------|
| **Authentication** | Brute force login, Credential stuffing |
| **Authorization** | Privilege escalation, IDOR |
| **Input Validation** | SQL injection, XSS, Command injection |
| **Session Management** | Session hijacking, Token prediction |
| **Data Protection** | Sensitive data encrypted, PII handled |
| **Rate Limiting** | API abuse prevention |

---

## 10. Exploratory Testing Charter Template

```
Charter: [Mô tả mục tiêu exploration]
Duration: [Thời gian]
Coverage: [Scope cần cover]
Notes:
  - [Phát hiện, observations]
  - [Questions, risks]
Bugs Found:
  - [Bug 1]
  - [Bug 2]
```

---

## 11. Test Strategy Summary

| Phase | Activities | Deliverables |
|-------|------------|--------------|
| **Plan** | Test strategy, Resource estimation | Test Plan |
| **Design** | Test case design, Review | Test Cases |
| **Environment** | Setup test environment, Test data | Ready environment |
| **Execution** | Run tests, Log defects | Test execution report |
| **Evaluation** | Analyze results, Coverage | Test Summary Report |
| **Closure** | Lessons learned, Process improvement | Test Closure Report |
