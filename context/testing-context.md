# Testing Context — Knowledge Base for Test Case Generation

---

## 1. Objective

Tài liệu này là **knowledge base** cho việc generate test case. Mục tiêu:

- Bao phủ đúng requirements
- Bắt được Positive, Negative, Boundary, E2E và error scenarios
- Ưu tiên case có giá trị phát hiện bug cao
- Giữ test case rõ ràng, thực thi được và dễ review

---

## 2. Test Design Techniques

| Technique | Dùng khi | Ghi chú |
|-----------|---------|---------|
| **Equivalence Partitioning** | Input validation, range dữ liệu, nhiều loại giá trị hợp lệ/không hợp lệ | Chia input thành nhóm tương đương, chọn đại diện |
| **Boundary Value Analysis** | Test ranh giới dữ liệu | Luôn: `min-1 \| min \| min+1 \| max-1 \| max \| max+1` |
| **Decision Table Testing** | Kết quả phụ thuộc nhiều điều kiện AND/OR | Login, Discount, Permission, Business rules |
| **State Transition Testing** | Hành vi phụ thuộc trạng thái hiện tại | Test: chuyển hợp lệ \| không hợp lệ \| bị chặn |
| **Use Case Testing** | Bao phủ luồng E2E | Test: main flow \| alternate flow \| exception flow |
| **E2E State Transitions** | **Bắt buộc** nếu feature có trạng thái thay đổi | Theo thời gian, hành động user, cấu hình admin. Dữ liệu cũ không apply retroactively |
| **Negative / Exception / Security** | Luôn thêm | Input sai format, thiếu dữ liệu bắt buộc, lỗi server, truy cập trái quyền, injection |

---

## 3. Dimensions to Cover

| Dimension | Nội dung |
|----------|---------|
| **Input validation** | rong, null, sai kiểu, sai format, vượt giới hạn, ký tự đặc biệt, khoảng trắng đầu/cuối |
| **Business rules** | Điều kiện đúng, sai, kết hợp, rule ưu tiên khi xung đột |
| **State-based** | Trạng thái ban đầu, sau action, lặp lại, sau hoàn tất/hủy/khóa |
| **Permission / Role** | Có quyền, không quyền, role khác nhau, unauthorized access |
| **Error handling** | invalid request, server error, dependency failure, network issue, retry/duplicate |
| **Data integrity** | Lưu đúng, không duplicate, rollback khi lỗi, đồng bộ UI/API/DB |

---

## 4. Test Case Structure

**Hierarchical: REQ ID > Platform > Page/Feature > Case Title > Sub-case**

### 4.1 Template (viết bằng TIẾNG ANH)

```
1.  REQ ID: <REQ-ID>              — in đậm, căn giữa
2.  TEST CASE ID: <PAGE>-01        — in đậm, căn giữa
3.  PLATFORM: <Admin/User/API>
4.  PAGE/FEATURE: <Screen name>
5.  CASE TITLE: <Main objective — WHAT + WHEN — IN ENGLISH>
6.  SUB-CASE 1: <Specific data — IN ENGLISH, blank if none>
7.  SUB-CASE 2: <Secondary variant — IN ENGLISH, blank if none>
8.  CASE TYPE: <Positive/Negative/Boundary/E2E/Exception/Permission/Security>
9.  PRIORITY: <High/Medium/Low>
10. PRE-CONDITIONS: <Condition 1 — IN ENGLISH>; <Condition 2 — IN ENGLISH>
11. STEPS: <Step 1 — IN ENGLISH>; <Step 2 — IN ENGLISH>
12. EXPECTED RESULT: <Measurable outcome — IN ENGLISH>
13. STATUS: <Pass/Fail/Blocked/Pending — blank when generate>
14. EXECUTE NAME: <blank when generate>
15. EXECUTE DATE: <blank when generate>
```

### 4.2 CASE TITLE + SUB-CASE — Ngắn gọn cho QC

**Quy tắc vàng**: CASE TITLE và SUB-CASE phải **bổ sung nhau, KHÔNG lặp thông tin**.

| Cột | Vai trò | Nội dung |
|-----|---------|----------|
| **CASE TITLE** | WHAT + WHEN | Mục tiêu kiểm tra chính — QC nhìn vào hiểu ngay đang test gì |
| **SUB-CASE 1** | Specific data | Giá trị cụ thể (dữ liệu biên, trạng thái). Để trống nếu không có |
| **SUB-CASE 2** | Secondary variant | Biến thể phụ (nếu có). Để trống nếu không có |

**Pattern CASE TITLE theo từng loại:**

| Case Type | Pattern | Ví dụ |
|-----------|---------|-------|
| **Positive** | `Display [Element] when [condition met]` | `Display Cashback tag when all eligibility conditions are met` |
| **Negative** | `No [Element] when [condition fails]` | `No Cashback tag when user is not enrolled` |
| **Boundary** | `Display/No [Element] when bet [boundary point]` | `No Cashback tag when bet is below Min threshold` |
| **E2E** | `Display [Element] when [state change event]` | `Display Cashback tag for bets placed after enrollment` |
| **Exception** | `[Expected behavior] when [error occurs]` | `No error message when valid input is submitted` |
| **Permission** | `Allow/Block action when [role/permission]` | `Block enrollment when user lacks admin role` |

**Yêu cầu với CASE TITLE:**
- Mô tả **hành vi kỳ vọng** (WHAT) + **điều kiện** (WHEN)
- Ngắn gọn — QC nhìn 1 dòng hiểu ngay đang test gì
- **Tiếng Anh**, không dùng từ mơ hồ
- Không chứa giá trị cụ thể (để SUB-CASE)

**Yêu cầu với SUB-CASE:**
- Chỉ chứa **giá trị cụ thể**: dữ liệu biên, trạng thái, biến thể
- **KHÔNG lặp** nội dung từ CASE TITLE
- Nếu không có biến thể → để trống

**Lỗi tránh:**

| Lỗi | Cách sửa |
|-----|----------|
| Lặp: "Display tag" (CASE) + "Display tag when bet = Max" (SUBCASE) | Xóa phần trùng, SUBCASE chỉ chứa giá trị: `bet = 50 (Max = 50)` |
| Mơ hồ: "TH1.1", "biên 1", "điều kiện 1" | Thay bằng mô tả cụ thể bằng tiếng Anh |
| Quá dài: CASE 50+ từ, SUBCASE lặp lại toàn bộ | Tách: CASE = WHAT+WHEN, SUBCASE = giá trị cụ thể |

**Checklist trước khi xuất:**
1. [ ] Đọc CASE TITLE trong 5 giây — QC hiểu đang test gì?
2. [ ] SUBCASE bổ sung thông tin mới (giá trị cụ thể), không lặp từ CASE TITLE?
3. [ ] Không có từ mơ hồ?
4. [ ] Tất cả bằng **TIẾNG ANH**?

### 4.3 REQ ID Mapping

**Nguyên tắc: Mỗi test case gán đúng REQ ID mà nó cover. KHÔNG gán chung 1 US ID cho tất cả.**

| Loại | Format | Ví dụ |
|------|--------|-------|
| Eligibility Condition | `REQ-C[N]` | `REQ-C1`, `REQ-C2` ... `REQ-C6` |
| Acceptance Criteria | `AC[N]` | `AC1`, `AC2` ... `AC5` |
| E2E / State Transition | `E2E-[N]` | `E2E-1`, `E2E-2` |
| Data Integrity | `DI` | `DI` |
| Tổng hợp toàn bộ US | `US-[ID]` | `US-8182` |
| Nhiều REQ cùng lúc | `REQ-C1, REQ-C3` | (dấu phẩy + khoảng trắng) |

### 4.4 Case Type

`Positive` — input hợp lệ, expected flow đúng
`Negative` — input sai hoặc điều kiện sai, hệ thống xử lý đúng
`Boundary` — test giới hạn dữ liệu (min/max inclusive/exclusive)
`E2E` — end-to-end state transition, bắt buộc nếu có state change
`Exception` — xử lý lỗi
`Permission` — phân quyền
`Security` — rủi ro bảo mật

### 4.5 Priority

`High` — phải pass trước release, core business logic
`Medium` — nên pass, impact vừa
`Low` — nếu có, UI/text validation

---

## 5. Excel Structure

### 5 Sheets

| Sheet | Tên | Tab Color | Nội dung |
|-------|-----|-----------|---------| 
| S1 | Overview | navy (#1F3864) | KPI Cards + Case Type Distribution + Priority Distribution |
| S2 | Matrix REQ x TC | xanh dương (#2E75B6) | Grouped sections (Conditions/AC/E2E/Data Integrity) + YES/NO badge |
| S3 | Testcase | xanh lá (#375623) | Toàn bộ test case, stats row, section header `=== [Page] (N TC) ===` |
| S4 | QC Execute Note | tím (#5C2D91) | Purpose, Case Type Legend, Priority Guide, Status Values, Execution Tips, Defect Reporting, Regression Criteria |
| S5 | KeywordExplanation | cam (#C55A11) | Case Type, Priority, Status, Column Explanation, Color Reference |

### 15 cột Sheet 3

| # | Cột | Style |
|---|-----|-------|
| 1 | **REQ ID** | Căn giữa, nền xanh dương nhạt (#BDD7EE), chữ navy (#1F3864), in đậm |
| 2 | **TEST CASE ID** | Căn giữa, nền navy (#1F3864), chữ trắng (#FFFFFF), in đậm |
| 3 | **PLATFORM** | Căn giữa. `Admin` hoặc `User`. Không để trống |
| 4 | **PAGE/FEATURE** | Căn trái, in đậm. Không để trống |
| 5 | **CASE TITLE** | Căn trái. WHAT + WHEN. **Ngắn gọn — QC nhìn 1 dòng hiểu ngay đang test gì** |
| 6 | **SUB-CASE 1** | Căn trái. Giá trị cụ thể (biên, trạng thái). **Bổ sung thông tin mới, KHÔNG lặp từ CASE TITLE**. Để trống nếu không có |
| 7 | **SUB-CASE 2** | Căn trái. Biến thể phụ (nếu có). Để trống nếu không có |
| 8 | **CASE TYPE** | Căn giữa, in đậm. Tô màu theo bảng 5.3 |
| 9 | **PRIORITY** | Căn giữa, in đậm. Tô màu theo bảng 5.3 |
| 10 | **PRE-CONDITIONS** | Căn trái, nền xanh nhạt (#F2F7F9) |
| 11 | **STEPS** | Căn trái |
| 12 | **EXPECTED RESULT** | Căn trái, **nền cam (#FCE4D6), chữ đỏ đậm (#9C0006), in đậm** — nổi bật nhất |
| 13 | **STATUS** | Căn giữa. Tô màu theo bảng 5.3. Để trống khi generate |
| 14 | **EXECUTE NAME** | Căn giữa. Để trống khi generate |
| 15 | **EXECUTE DATE** | Căn giữa. Để trống khi generate |

**Chỉ hàng header (row 2) là căn giữa + middle align.** Tất cả data rows: căn trái + middle vertical.

### Excel Formatting

- **Wrap text** cho tất cả ô có text dài
- **Frozen Row**: hàng header (row 2) cố định khi scroll dọc
- **Frozen Column**: cột SUB-CASE 1 (cột E) cố định khi scroll ngang
- **Alt row**: nền #F8F9FA xen kẽ
- **Borders**: All Borders, thin, #595959

### Mã màu nhanh

**Case Type:**
Positive=#E2EFDA/#375623 | Negative=#FCE4D6/#9C0006 | Boundary=#FFF2CC/#7F6000 | E2E=#E2E8F0/#1E3A5F | Exception=#EDEDED/#404040 | Security=#FFE6FF/#7030A0

**Priority:**
High=#FFE0CC/#C55A11 | Medium=#DDEBF7/#2E75B6 | Low=#F2F2F2/#595959

**Status:**
Pass=#C6EFCE/#276221 | Fail=#FFC7CE/#9C0006 | Blocked=#FFE699/#7F6000 | Pending=#F2F2F2/#595959

---

## 6. Language Requirement

**Tất cả nội dung test case (Excel + Markdown) phải viết bằng TIẾNG ANH.**

Bao gồm: CASE TITLE, SUB-CASE, PRE-CONDITIONS, STEPS, EXPECTED RESULT, text trong Excel và Markdown.

Nếu requirement đầu vào bằng tiếng Việt: dịch/suy luận sang tiếng Anh. Giữ nguyên REQ ID và AC ID từ gốc.

Nếu yêu cầu chưa đủ rõ: giả định hợp lý → ghi rõ assumption và tiếp tục; không rõ → hỏi lại.

---

## 7. Pre-completion Checklist

- [ ] Requirements cover đầy đủ (Positive + Negative + Boundary + E2E cho mỗi condition/AC)
- [ ] Có E2E cases cho tất cả state transition
- [ ] Không có test case trùng ý
- [ ] Mỗi test case có expected result rõ ràng, đo được
- [ ] REQ ID được gán đúng cho từng test case
- [ ] Tất cả nội dung bằng **TIẾNG ANH**
- [ ] Đúng 15 cột, đúng 5 sheets theo thứ tự
- [ ] Output gồm `[US ID]_TC_[Name].xlsx` và `[US ID]_O_[Name].md` trong `output`
