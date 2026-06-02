# Testing Context - Test Case Generation Guide

---

## 1. Mục tiêu / Objective

Tài liệu này chỉ dùng làm ngữ cảnh cho việc **generate test case**.

Mục tiêu khi tạo test case:
- Bao phủ đúng requirements
- Bắt được Positive, Negative, Boundary, E2E và error scenarios
- Ưu tiên các case có giá trị phát hiện bug cao
- Giữ test case rõ ràng, có thể thực thi và dễ review

---

## 2. Nguyên tắc tạo test case / Test Case Creation Principles

Khi generate test case, luôn ưu tiên:
- Đọc đúng yêu cầu nghiệp vụ trước khi suy luận test
- Tách từng rule hoặc condition thành các test case riêng nếu cần
- Bao phủ cả luồng thành công và luồng lỗi
- Ưu tiên edge case, ràng buộc dữ liệu, và trạng thái hệ thống
- Không gộp quá nhiều kỳ vọng vào một test case

### 2.1 Các câu hỏi cần tự đặt ra / Key Questions to Ask

- Input hợp lệ là gì? Input không hợp lệ là gì?
- Biên của dữ liệu ở đâu?
- Có rule phụ thuộc condition nào không?
- Có trạng thái nào thay đổi sau hành động không?
- Có role/permission nào ảnh hưởng không?
- Có case lỗi nào cần xử lý rõ ràng không?
- Có rủi ro bảo mật nào cần kiểm tra không?

---

## 3. Test design techniques áp dụng / Applicable Test Design Techniques

### 3.1 Equivalence Partitioning (EP)

Chia input thành các nhóm tương đương và chọn đại diện từ mỗi nhóm.

Dùng khi: có input validation, có range dữ liệu, có nhiều loại giá trị hợp lệ/không hợp lệ.

### 3.2 Boundary Value Analysis (BVA)

Test tại ranh giới của dữ liệu.

Luôn kiểm tra: min-1 | min | min+1 | max-1 | max | max+1

### 3.3 Decision Table Testing

Dùng khi kết quả phụ thuộc vào nhiều điều kiện kết hợp (AND/OR).

Phù hợp cho: Login, Discount/Promotion, Permission, Business rules.

### 3.4 State Transition Testing

Dùng khi hành vi phụ thuộc vào trạng thái hiện tại của đối tượng.

Cần test: chuyển trạng thái hợp lệ | chuyển trạng thái không hợp lệ | hành động bị chặn theo trạng thái

### 3.5 Use Case Testing

Dùng để bao phủ luồng nghiệp vụ end-to-end.

Cần tạo test case cho: main flow | alternate flow | exception flow

### 3.6 E2E Testing (End-to-End)

**Bắt buộc phải có** với mỗi requirement có tình huống chuyển trạng thái.

Dùng khi có các tình huống:
- Trạng thái chuyển đổi theo thời gian (VD: chương trình bắt đầu/hết hạn/kích hoạt lại)
- Trạng thái chuyển đổi theo hành động user (VD: tham gia/rời/hủy)
- Trạng thái chuyển đổi theo cấu hình admin (VD: thay đổi setting sau khi dữ liệu đã được ghi)
- Dữ liệu cũ (đã ghi) không bị ảnh hưởng bởi thay đổi sau đó

Ví dụ: Một hành động xảy ra khi chưa có feature, sau đó feature được bật -> dữ liệu cũ vẫn giữ nguyên trạng thái (không apply retroactively).

### 3.7 API / Data Validation

Nếu test case liên quan API hoặc dữ liệu hệ thống, cần kiểm tra thêm: status code | response schema | field required/optional | data persistence | data consistency

### 3.8 Negative / Exception / Security Thinking

Luôn thêm case để kiểm tra: input sai định dạng | thiếu dữ liệu bắt buộc | thao tác sai trình tự | lỗi server/timeout | truy cập trái quyền | injection/XSS

---

## 4. Các chiều cần bao phủ / Dimensions to Cover

### 4.1 Input validation

rong | null | sai kiểu dữ liệu | sai format | vượt giới hạn | ký tự đặc biệt | khoảng trắng đầu/cuối

### 4.2 Business rules

Điều kiện đúng | điều kiện sai | nhiều điều kiện kết hợp | rule ưu tiên nếu có xung đột

### 4.3 State-based scenarios

Trạng thái ban đầu | trạng thái sau action | thao tác lặp lại | thao tác sau khi đã hoàn tất/đã hủy/đã khóa

### 4.4 E2E State Transitions

**Bắt buộc cover** nếu feature có trạng thái thay đổi. Các kiểu chuyển đổi:
- Theo thời gian: feature bắt đầu/hết hạn/kích hoạt lại
- Theo hành động user: user tham gia/rời/hủy
- Theo cấu hình: admin thay đổi setting sau khi dữ liệu đã được ghi
- Dữ liệu cũ: giữ nguyên trạng thái, không bị ảnh hưởng bởi thay đổi sau đó

### 4.5 Permission / Role

User có quyền | user không có quyền | role khác nhau | unauthorized access

### 4.6 Error handling

invalid request | server error | dependency failure | network issue | retry / duplicate submit

### 4.7 UI / UX behavior

Hiển thị message đúng | disable/enable control đúng trạng thái | redirect/navigation đúng | loading/empty/error state

### 4.8 Data integrity

Dữ liệu được lưu đúng | không tạo duplicate ngoài ý muốn | rollback khi lỗi | đồng bộ giữa UI, API, DB

---

## 5. Cấu trúc test case / Test Case Structure

### 5.1 Mục tiêu của cấu trúc / Structure Purpose

Khi QC nhìn vào test case, cần nhận ra ngay:
- REQ ID nào được cover
- TEST CASE ID nào
- Platform nào: Admin, User, Mobile, API...
- PAGE/FEATURE nào
- CASE TITLE nào
- SUB-CASE nào nếu cần
- CASE TYPE gì: Positive, Negative, Boundary, E2E, Exception, Permission, Security...

### 5.2 Cấu trúc phân cấp chuẩn / Standard Hierarchical Structure

**REQ ID > Platform > Page/Feature > Case Title > Sub-case**

### 5.3 Mẫu chuẩn / Standard Template

**Tất cả nội dung bên dưới phải VIẾT BẰNG TIẾNG ANH.**

```text
1. REQ ID: <REQ-ID>  — in đậm, căn giữa
2. TEST CASE ID: <PAGE>-01  — in đậm, căn giữa
3. PLATFORM: <Admin/User/Mobile/API>
4. PAGE/FEATURE: <Screen or area name>
5. CASE TITLE: <Main objective — what is being verified — IN ENGLISH>
6. SUB-CASE 1: <Data variant or specific condition — IN ENGLISH, blank if none>
7. SUB-CASE 2: <Secondary variant — IN ENGLISH, blank if none>
8. CASE TYPE: <Positive/Negative/Boundary/E2E/Exception/Permission/Security>
9. PRIORITY: <High/Medium/Low>
10. PRE-CONDITIONS: <Condition 1 — IN ENGLISH>; <Condition 2 — IN ENGLISH>
11. STEPS: <Step 1 — IN ENGLISH>; <Step 2 — IN ENGLISH>
12. EXPECTED RESULT: <What should happen — must be measurable — IN ENGLISH>
13. STATUS: <Pass/Fail/Blocked/Pending — blank when generate>
14. EXECUTE NAME: <blank when generate>
15. EXECUTE DATE: <blank when generate>
```

### 5.4 Quy ước đặt tên / Naming Conventions

#### TEST CASE ID

Dùng prefix theo Page để dễ trace. Ví dụ:
- User Login: `UL-01`, `UL-02`...
- Payment: `PAY-01`, `PAY-02`...
- Admin Settings: `ADM-01`...

#### PAGE/FEATURE

Thể hiện rõ màn hình hoặc khu vực QC sẽ kiểm tra.

#### CASE TITLE và SUB-CASE

- **CASE TITLE**: mô tả mục tiêu kiểm tra chính, ngắn gọn, rõ ràng — **IN ENGLISH**
- **SUB-CASE 1**: biến thể điều kiện hoặc dữ liệu cụ thể — **IN ENGLISH**. Nếu không có biến thể thì để trống.
- **SUB-CASE 2**: biến thể phụ (nếu có) — **IN ENGLISH**. Nếu không có thì để trống.

---

## 6. Case Type và Priority

### 6.1 Case Type

- **Positive**: input hợp lệ, expected flow đúng
- **Negative**: input sai hoặc điều kiện sai — expected: hệ thống xử lý đúng
- **Boundary**: kiểm tra giới hạn dữ liệu (VD: min/max inclusive/exclusive)
- **E2E**: end-to-end state transition — multi-step, multi-time scenarios (bắt buộc nếu có state change)
- **Exception**: kiểm tra xử lý lỗi
- **Permission**: kiểm tra phân quyền
- **Security**: kiểm tra rủi ro bảo mật

### 6.2 Priority

- **High**: phải pass trước release. Core business logic, bug nghiêm trọng nếu miss.
- **Medium**: nên pass. Feature quan trọng, impact vừa phải nếu fail.
- **Low**: nếu có. UI/text validation, cosmetic.

---

## 7. Cúc phu trong Excel / Excel Color Coding

### 7.1 Màu theo Case Type (cột CASE TYPE)

| Case Type | Nền | Chữ | In đậm |
|---|---|---|---|
| Positive | #E2EFDA (xanh lá nhạt) | #375623 (xanh lá đậm) | Có |
| Negative | #FCE4D6 (đỏ nhạt) | #9C0006 (đỏ đậm) | Có |
| Boundary | #FFF2CC (vàng nhạt) | #7F6000 (vàng đậm) | Có |
| E2E | #E2E8F0 (xám-xanh nhạt) | #1E3A5F (navy đậm) | Có |
| Exception | #EDEDED (xám nhạt) | #404040 (xám đậm) | Có |
| Security | #FFE6FF (tím nhạt) | #7030A0 (tím đậm) | Có |

### 7.2 Màu theo Priority (cột PRIORITY)

| Priority | Nền | Chữ | In đậm |
|---|---|---|---|
| High | #FFE0CC (cam nhạt) | #C55A11 (cam đậm) | Có |
| Medium | #DDEBF7 (xanh dương nhạt) | #2E75B6 (xanh dương đậm) | Có |
| Low | #F2F2F2 (xám rất nhạt) | #595959 (xám đậm) | Có |

### 7.3 Màu theo Status (cột STATUS)

| Status | Nền | Chữ | In đậm |
|---|---|---|---|
| Pass | #C6EFCE (xanh lá) | #276221 (xanh lá đậm) | Có |
| Fail | #FFC7CE (đỏ nhạt) | #9C0006 (đỏ đậm) | Có |
| Blocked | #FFE699 (vàng) | #7F6000 (vàng đậm) | Có |
| Pending | #F2F2F2 (xám) | #595959 (xám đậm) | Có |

### 7.4 Màu các cột đặc biệt

| Cột | Nền | Chữ | Ghi chú |
|---|---|---|---|
| **REQ ID** | #BDD7EE (xanh dương nhạt) | #1F3864 (navy đậm) | In đậm, căn giữa |
| **TEST CASE ID** | #1F3864 (navy) | #FFFFFF (trắng) | In đậm, căn giữa |
| **EXPECTED RESULT** | #FCE4D6 (cam vừa) | #9C0006 (đỏ đậm) | In đậm, nổi bật nhất |
| **PRE-CONDITIONS** | #F2F7F9 (xanh nhạt) | #000000 | Top align |
| **PAGE/FEATURE** | #F8F9FA (xám rất nhạt) | #000000 | In đậm |

### 7.5 Màu Alt Row

Hàng xen kẽ: nền #F8F9FA (xám rất nhạt) để dễ phân biệt các dòng.

---

## 8. Cấu trúc 5 Sheets trong file Excel / 5 Sheets in Excel File

### Sheet 1: S1 - Overview

Tổng quan toàn bộ bộ test case. Gồm:
- Thông tin requirement (ID, tên feature, platform, scope, ngày tạo, tổng số TC)
- Bảng summary theo Case Type (tách theo Page nếu có nhiều Page)
- Bảng summary theo Priority (tách theo Page nếu có nhiều Page)

### Sheet 2: S2 - Matrix REQ x TC

Bảng mapping giữa REQ ID và test case:
- Cột: REQ ID | Mô tả Requirement | Số TC | Covered (Yes/No)
- Mỗi REQ con (VD: REQ-1, REQ-2...) và AC (VD: AC1, AC2...) là một dòng riêng
- Giúp QC nhanh chóng thấy đã cover đủ chưa

### Sheet 3: S3 - Bộ Testcase

Toàn bộ test case (15 cột theo format mới). Phân nhóm bằng section header theo Page, ví dụ:

```text
=== Round History (17 Test Cases) ===
```

### Sheet 4: S4 - QC Execute Note

Hướng dẫn thực thi cho QC khác. Gồm:
- Mục đích, phạm vi, assumption của bộ test case này
- Tổng hợp Acceptance Criteria
- Giải thích từng Case Type
- Hướng dẫn Priority
- Hướng dẫn Status (Pass / Fail / Blocked / Pending)
- Tips thực thi (state transition, boundary, API validation...)
- Hướng dẫn báo cáo defect
- Regression criteria

### Sheet 5: S5 - Giải thích Keyword

Giải thích ý nghĩa các keyword có trong toàn bộ file Excel. Gồm:
- Giải thích Case Type: Positive, Negative, Boundary, E2E, Exception, Permission, Security
- Giải thích Priority: High, Medium, Low
- Giải thích Status: Pass, Fail, Blocked, Pending
- Giải thích từng cột trong bảng test case và ý nghĩa
- Giải thích màu sắc được sử dụng trong file

---

## 9. Cấu trúc 15 cột trong Sheet 3 — Bộ Testcase

**Thứ tự cột (bắt buộc theo đúng thứ tự số):**

1. **REQ ID** — Căn trái, middle vertical, in đậm, nền #BDD7EE, chữ navy #1F3864. Ví dụ: `REQ-1`, `REQ-1, REQ-2`
2. **TEST CASE ID** — Căn trái, middle vertical, in đậm, nền navy #1F3864, chữ trắng #FFFFFF. Ví dụ: `RH-01`, `TH-01`
3. **PLATFORM** — Căn trái, middle vertical. Ví dụ: Admin, User, Mobile, API
4. **PAGE/FEATURE** — Căn trái, middle vertical, in đậm. Ví dụ: Round History, Transaction History, User Profile
5. **CASE TITLE** — Căn trái, middle vertical. Mục tiêu kiểm tra chính, mô tả ngắn gọn, rõ ràng
6. **SUB-CASE 1** — Căn trái, middle vertical. Biến thể / điều kiện cụ thể. Để trống nếu không có
7. **SUB-CASE 2** — Căn trái, middle vertical. Biến thể phụ (nếu có). Để trống nếu không có
8. **CASE TYPE** — Căn giữa, middle vertical, in đậm. Tô màu theo bảng 7.1
9. **PRIORITY** — Căn giữa, middle vertical, in đậm. Tô màu theo bảng 7.2
10. **PRE-CONDITIONS** — Căn trái, middle vertical, nền #F2F7F9
11. **STEPS** — Căn trái, middle vertical
12. **EXPECTED RESULT** — Căn trái, middle vertical, **nền cam #FCE4D6, chữ đỏ đậm #9C0006, in đậm** — cột nổi bật nhất
13. **STATUS** — Căn giữa, middle vertical. Tô màu theo bảng 7.3. Để trống khi generate
14. **EXECUTE NAME** — Căn giữa, middle vertical. Để trống khi generate
15. **EXECUTE DATE** — Căn giữa, middle vertical. Để trống khi generate

**Chỉ hàng header (row 2) là căn giữa (center) + middle vertical.** Tất cả nội dung data rows đều căn trái (left) + middle vertical.

---

## 10. Yêu cầu trình bày Excel / Excel Formatting Rules

- **Wrap text**: Tất cả ô có text dài phải wrap text để hiển thị đầy đủ.
- **Frozen Row**: Hàng header (hàng 2) cố định khi scroll dọc. Header căn giữa (center) + middle align.
- **Frozen Column**: Cột SUB-CASE 1 (cột số 6, xSplit=5) cố định khi scroll ngang.
- **Alignment**: Tất cả nội dung data rows: **căn trái (left) + middle vertical**. Chỉ hàng header (row 2) là căn giữa (center) + middle vertical.
- **Alt Row**: Hàng xen kẽ nền #F8F9FA để dễ phân biệt.
- **Tab Color**: Mỗi sheet có tab màu khác nhau:
  - S1 - Overview: navy (#1F3864)
  - S2 - Matrix REQ x TC: xanh dương (#2E75B6)
  - S3 - Bộ Testcase: xanh lá (#375623)
  - S4 - QC Execute Note: tím (#5C2D91)
  - S5 - Giải thích Keyword: cam (#C55A11)

---

## 11. Checklist trước khi hoàn tất bộ test case / Pre-completion Checklist

- Requirements đã được cover đầy đủ (Positive + Negative + Boundary + E2E cho mỗi condition/AC)
- Có E2E cases cho tất cả các tình huống state transition (nếu có)
- Không có test case trùng ý
- Mỗi testcase có expected result rõ ràng, đo được
- Priority được gán hợp lý
- REQ ID được gán cho từng test case
- Cả `[ID]_[Platform]_[Feature].xlsx` và `[ID]_[Platform]_[Feature]_summary.md` đều nằm trong thư mục output
- **Tất cả nội dung trong Excel và Markdown đều bằng tiếng Anh**
- Đúng 15 cột theo thứ tự quy định
- Đúng 5 sheets theo thứ tự quy định
- Frozen row và frozen column đúng vị trí

---

## 12. Output khi generate testcase / Output When Generating Test Cases

### File 1: testcase.xlsx

- 5 sheets theo cấu trúc ở mục 8
- 15 cột theo thứ tự ở mục 9
- Màu sắc phân biệt theo mục 7
- Tab mỗi sheet có màu khác nhau theo mục 10
- **Tất cả nội dung: TIẾNG ANH**

### File 2: testcase-summary.md

File Markdown để review nhanh, không chi tiết. Nội dung:

1. Header — Requirement ID, feature, platform, ngày, tổng số TC
2. Bảng REQ Coverage — mỗi REQ ID / AC có bao nhiêu TC, đã cover chưa
3. Bảng Case Type Distribution — bao nhiêu Positive, Negative, Boundary, E2E...
4. Bảng Priority Distribution — bao nhiêu High, Medium, Low
5. Danh sách Test Case ID — ID | Case | Sub-case 1 | Sub-case 2 | Expected Result (bảng ngắn gọn)
6. Key coverage notes — ghi chú những điểm quan trọng cần lưu ý khi thực thi
- **Tất cả nội dung: TIẾNG ANH**

---

## Lưu ý quan trọng về ngôn ngữ / Important Language Note

**YÊU CẦU: Tất cả nội dung test case (Excel + Markdown) phải viết bằng TIẾNG ANH.**

Điều này bao gồm:
- CASE TITLE / Case description
- SUB-CASE 1 / SUB-CASE 2
- PRE-CONDITIONS
- STEPS
- EXPECTED RESULT
- Tất cả text trong các sheet Excel (ngoại trừ màu sắc và số liệu)
- Tất cả text trong file Markdown summary

Nếu requirement đầu vào bằng tiếng Việt: agent phải **dịch/suy luận** nội dung sang tiếng Anh khi viết test case. Giữ nguyên REQ ID và AC ID từ requirement gốc.

Nếu yêu cầu chưa đủ rõ:
- Nếu giả định hợp lý, ghi rõ assumption và tiếp tục tạo test case
- Nếu không, hỏi người yêu cầu trước khi tạo test case

---

## Lưu ý quan trọng về format

**Chỉ thay đổi format/cấu trúc, KHÔNG thay đổi ý nghĩa bản chất của test case.**

- REQ ID và TEST CASE ID luôn căn giữa.
- Tất cả các ô data (không phải header) luôn top align.
- Cột EXPECTED RESULT nổi bật nhất với nền cam (#FCE4D6) và chữ đỏ đậm (#9C0006).
- Frozen row: hàng header cố định khi cuộn dọc.
- Frozen column: cột SUB-CASE 1 cố định khi cuộn ngang.
