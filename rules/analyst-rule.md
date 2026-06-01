# BA Rule - Requirements Analysis & Test Coverage

## 1. Requirements Analysis Rules

### 1.1 Đọc Requirements

| STT | Rule | Mục đích |
|-----|------|----------|
| BA-01 | Đọc requirements **ít nhất 2 lần** trước khi bắt đầu phân tích | Hiểu đúng và đủ scope |
| BA-02 | Xác định **actor** (ai sử dụng), **action** (làm gì), **object** (trên cái gì) cho mỗi feature | Đảm bảo đủ yếu tố của use case |
| BA-03 | Gạch chân các **từ khóa nghiệp vụ**: phải, không được, tối thiểu, tối đa, chỉ, trước khi | Tránh bỏ sót ràng buộc |
| BA-04 | Note lại **assumption** (giả định) nếu requirements không rõ ràng | Clear boundary, tránh hiểu sai |

### 1.2 Phân tích Requirements

| STT | Rule | Mục đích |
|-----|------|----------|
| BA-05 | Map mỗi requirement → **Requirement ID** (REQ-XX) | Traceability, không bỏ sót |
| BA-06 | Phân loại requirement: **F**unctional / **N**on-Functional / **B**usiness Rule | Chọn đúng test technique |
| BA-07 | Xác định **input** và **output** rõ ràng cho mỗi feature | Biết test gì vào, ra gì |
| BA-08 | Tìm **dependency** giữa các features | Biết thứ tự test, tránh test sai flow |
| BA-09 | Xác định **happy path** và **alternative paths** | Cover đủ positive + negative cases |

---

## 2. Test Coverage Rules

### 2.1 Coverage Checklist

| STT | Checklist Item | Khi nào check |
|-----|----------------|---------------|
| TC-01 | ✅ Đã cover **Positive cases** (input hợp lệ → success) | Luôn |
| TC-02 | ✅ Đã cover **Negative cases** (input không hợp lệ → error) | Luôn |
| TC-03 | ✅ Đã cover **Boundary values** (min, max, edge cases) | Luôn |
| TC-04 | ✅ Đã cover **Error handling** (exception, timeout, network fail) | Luôn |
| TC-05 | ✅ Đã cover **Permission/Permission denied** | Features có auth |
| TC-06 | ✅ Đã cover **State transitions** | Features có trạng thái |
| TC-07 | ✅ Đã cover **Data persistence** (DB updated đúng) | CRUD operations |
| TC-08 | ✅ Đã cover **Concurrent access** (nếu có) | Gift code, Limited promo |
| TC-09 | ✅ Đã cover **UI/UX flows** (navigation, layout) | Frontend features |
| TC-10 | ✅ Đã cover **All devices**: WIN PC, Android, iPhone, iPad | Cross-platform |

### 2.2 Test Case Naming Convention

```
TC-{Module}-{Number}
  └── Module: AUTH, USER, PROM, TRAN, API
  └── Number: 001, 002, 003...

Ví dụ:
  TC-AUTH-001: Login with valid credentials
  TC-AUTH-002: Login with invalid password
  TC-PROM-001: Admin create new promotion
  TC-API-001: GET /api/users/{id} - Success
```

### 2.3 Traceability Matrix

| TC ID | Requirement ID | Test Type | Priority | Device | Status |
|-------|---------------|-----------|----------|--------|--------|
| TC-AUTH-001 | REQ-001, REQ-002 | Positive | P0 | All | ✅ |
| TC-AUTH-002 | REQ-003 | Negative | P0 | All | ✅ |

> **Rule**: Mỗi Requirement phải có **ít nhất 1 test case** cover (P1+). Mỗi P0 requirement phải có **ít nhất 3 test cases**: positive, negative, boundary.

---

## 3. Safe Testing Rules (Không phá hỏng hệ thống)

### 3.1 Pre-Test Rules

| STT | Rule | Lý do |
|-----|------|-------|
| SAFE-01 | **Không bao giờ test trên Production** | Mất data, ảnh hưởng user thật |
| SAFE-02 | Test trên **Development/Staging environment** | An toàn, không ảnh hưởng production |
| SAFE-03 | Sử dụng **test data riêng**, không dùng account thật | Tránh conflict, privacy issues |
| SAFE-04 | Backup database trước khi test ** destructive operations** | Khôi phục nếu cần |
| SAFE-05 | Check **environment config** trước khi test (URL, credentials) | Đảm bảo đúng môi trường |

### 3.2 During-Test Rules

| STT | Rule | Lý do |
|-----|------|-------|
| SAFE-06 | **Verify expected result** trước khi claim PASS | Tránh false positive |
| SAFE-07 | Nếu test fail → **document actual result** và **screenshot** | Evidence cho developer |
| SAFE-08 | Không modify code/configuration khi đang test | Tránh break environment |
| SAFE-09 | Test **concurrency** với data riêng, reset sau test | Tránh race condition ảnh hưởng data thật |
| SAFE-10 | Nếu phát hiện **critical bug** → **STOP** test, report ngay | Không test tiếp trên broken system |

### 3.3 Post-Test Rules

| STT | Rule | Lý do |
|-----|------|-------|
| SAFE-11 | **Clean up test data** sau khi test xong | Không pollute database |
| SAFE-12 | Reset environment về trạng thái ban đầu | Sẵn sàng cho next test cycle |
| SAFE-13 | Update **test status** và **actual results** vào test case | Documentation |
| SAFE-14 | Report **blockers** ngay lập tức, không đợi | Critical issues cần fix sớm |
| SAFE-15 | Nếu test **destructive** (delete, rollback) → verify backup available | Rollback plan |

### 3.4 Destructive Operations Checklist

> ⚠️ **CẢNH BÁO**: Những operations sau có thể gây mất data - CẦN APPROVAL trước khi test:

| Operation | Risk Level | Required Action |
|-----------|------------|-----------------|
| DELETE user/account | 🔴 Critical | Backup + Dev approval |
| DELETE promotion | 🔴 Critical | Backup + Check dependencies |
| Bulk update status | 🔴 Critical | Backup + Test on 1 record first |
| Payment/Reward operations | 🔴 Critical | Staging only + Dev witness |
| Database direct manipulation | 🔴 Critical | NEVER on production |
| Force logout all users | 🟡 High | Stakeholder notification |
| Clear cache/redis | 🟡 High | Check impact first |

---

## 4. Definition of Done (Requirements → Test Case)

### 4.1 Step-by-Step Process

```
[1] Read Requirements
    ↓
[2] Identify REQ IDs và scope
    ↓
[3] Extract: Actors, Actions, Objects, Conditions
    ↓
[4] Design Test Cases:
    ├── Happy Path (1 case min)
    ├── Negative Cases (2-3 cases min)
    ├── Boundary Cases (2-3 cases min)
    └── Edge Cases (1-2 cases if applicable)
    ↓
[5] Map TC → REQ (Traceability)
    ↓
[6] Review: Coverage checklist
    ↓
[7] Execute: Safe testing rules
    ↓
[8] Document: Results + Evidence
```

### 4.2 Quality Gates

| Gate | Criteria | Exit Criteria |
|------|----------|---------------|
| **Input** | Requirements rõ ràng, đủ thông tin | Không ambiguous, không missing info |
| **Design** | Test cases cover đủ checklist | Coverage ≥ 90% cho P0/P1 |
| **Execution** | Không có blocker, Safe testing followed | 0 critical issue ignored |
| **Output** | Test report complete, evidence attached | 100% TC executed + documented |

---

## 5. Anti-Patterns (Những điều KHÔNG NÊN làm)

| ❌ Không làm | ✅ Nên làm |
|--------------|------------|
| Test không có plan, random click | Viết test case trước, execute theo plan |
| Copy-paste test case mà không review | Mỗi TC phải unique, cover different scenario |
| Claim PASS mà không verify | Luôn verify actual vs expected |
| Test trên production vì "cho nhanh" | Chỉ test trên Dev/Staging |
| Bỏ qua negative/boundary cases | Cover all scenarios |
| Test data dùng chung với user thật | Tạo test data riêng |
| Không document assumption | Note assumption rõ ràng |
