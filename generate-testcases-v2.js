const ExcelJS = require('exceljs');
const path = require('path');

const PLATFORM = 'Admin';
const PAGE_GROUP = 'User Games Play';
const USER_STORY_ID = 'REQ-1';

// ============================================================
// SHARED STYLE HELPERS
// ============================================================
function setHeaderStyle(cell) {
  cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F4E79' },
  };
  cell.alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };
  cell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } },
  };
}

function setDataStyle(cell, priority) {
  cell.alignment = { wrapText: true, vertical: 'top' };
  cell.border = {
    top: { style: 'thin', color: { argb: 'FFAAAAAA' } },
    left: { style: 'thin', color: { argb: 'FFAAAAAA' } },
    bottom: { style: 'thin', color: { argb: 'FFAAAAAA' } },
    right: { style: 'thin', color: { argb: 'FFAAAAAA' } },
  };
  if (priority === 'High') {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE0CC' } };
    cell.font = { bold: true, color: { argb: 'FF000000' } };
  } else if (priority === 'Medium') {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEBF3FB' } };
  } else if (priority === 'Low') {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
  }
}

function makeWorkbook() {
  return new ExcelJS.Workbook();
}

function configureSheet(ws, columns) {
  ws.columns = columns;
  ws.getRow(1).eachCell(setHeaderStyle);
  ws.getRow(1).height = 35;
  ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
  ws.autoFilter = { from: 'A1', to: { row: 1, column: ws.columns.length } };
}

function addRows(ws, testCases) {
  testCases.forEach((tc, idx) => {
    const row = ws.addRow(tc);
    const rowNum = idx + 2;
    row.eachCell((cell) => setDataStyle(cell, tc.Priority));
    row.height = 80;
  });
}

function save(workbook, filePath) {
  return workbook.xlsx.writeFile(filePath).then(() => {
    console.log(`Saved: ${filePath}`);
  });
}

// ============================================================
// COLUMNS (13 cols per new prompt)
// ============================================================
const COLUMNS = [
  { header: 'Test Case ID', key: 'ID', width: 12 },
  { header: 'Platform', key: 'Platform', width: 12 },
  { header: 'Page', key: 'Page', width: 28 },
  { header: 'Case', key: 'Case', width: 40 },
  { header: 'Sub-case 1', key: 'Subcase1', width: 32 },
  { header: 'Sub-case 2', key: 'Subcase2', width: 28 },
  { header: 'Case Type', key: 'CaseType', width: 14 },
  { header: 'Priority', key: 'Priority', width: 10 },
  { header: 'Pre-conditions', key: 'Preconditions', width: 48 },
  { header: 'Test Steps', key: 'TestSteps', width: 55 },
  { header: 'Expected Result', key: 'ExpectedResult', width: 55 },
  { header: 'Status', key: 'Status', width: 12 },
  { header: 'Execute Name', key: 'ExecuteName', width: 14 },
  { header: 'Execute Date', key: 'ExecuteDate', width: 14 },
];

// ============================================================
// TEST DATA — ROUND HISTORY
// ============================================================
const roundHistoryCases = [
  // ---- AC1: Tag hien thi khi cashback hoat dong ----
  {
    ID: '1',
    Platform: PLATFORM,
    Page: 'User Games Play - Round History',
    Case: 'Xac minh tag Cashback hien thi khi tat ca dieu kien deu thoa man (AC1)',
    Subcase1: 'Tat ca 6 dieu kien thoa man',
    Subcase2: '',
    CaseType: 'Positive',
    Priority: 'High',
    Preconditions: '1. Admin dang login.\n2. Cashback duoc cau hinh active, nam trong khoang ngay co hieu luc.\n3. Min/Max bet range duoc cau hinh.\n4. User dang tham gia cashback.\n5. Game choi nam trong danh sach cashback-eligible.\n6. Max refund cap chua vuot.',
    TestSteps: '1. Vao Admin > User Games Play.\n2. Chon tai khoan user co active cashback.\n3. Chuyen sang tab Round History.\n4. Dat mot cuoc nam trong khoang Min <= bet <= Max.\n5. Xac dinh ban ghi cuoc do trong Round History.',
    ExpectedResult: 'Hang cuoc do hien thi tag "Cashback" tai cot Bonus.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  // ---- AC3: Khong hien thi khi cashback chua/da het ----
  {
    ID: '2',
    Platform: PLATFORM,
    Page: 'User Games Play - Round History',
    Case: 'Xac minh khong hien thi tag Cashback khi cuoc dat truoc khi cashback bat dau (AC3)',
    Subcase1: 'Cuoc dat truoc ngay bat dau cashback',
    Subcase2: '',
    CaseType: 'Negative',
    Priority: 'High',
    Preconditions: '1. Admin dang login.\n2. Cashback co ngay bat dau trong qua khu (da bat dau roi).\n3. User co lich su cuoc dat truoc ngay bat dau.',
    TestSteps: '1. Vao Admin > User Games Play.\n2. Chon user co active cashback.\n3. Chuyen sang tab Round History.\n4. Tim ban ghi cuoc dat truoc ngay bat dau cashback.',
    ExpectedResult: 'Khong hien thi tag "Cashback" tai cot Bonus cho cac cuoc dat truoc ngay bat dau.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: '3',
    Platform: PLATFORM,
    Page: 'User Games Play - Round History',
    Case: 'Xac minh khong hien thi tag Cashback khi cashback da ket thuc (AC3)',
    Subcase1: 'Cuoc dat sau ngay ket thuc cashback',
    Subcase2: '',
    CaseType: 'Negative',
    Priority: 'High',
    Preconditions: '1. Admin dang login.\n2. Cashback da het han (end date < today).\n3. User co lich su cuoc sau ngay het han.',
    TestSteps: '1. Vao Admin > User Games Play.\n2. Chon user co lich su cashback.\n3. Chuyen sang tab Round History.\n4. Tim ban ghi cuoc dat sau ngay ket thuc cashback.',
    ExpectedResult: 'Khong hien thi tag "Cashback" tai cot Bonus cho cac cuoc dat sau ngay het han.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  // ---- AC4: Cuoc lich su truoc release khong hien thi ----
  {
    ID: '4',
    Platform: PLATFORM,
    Page: 'User Games Play - Round History',
    Case: 'Xac minh cuoc lich su truoc khi release khong hien thi tag Cashback (AC4)',
    Subcase1: 'Lich su truoc ngay release feature',
    Subcase2: '',
    CaseType: 'Positive',
    Priority: 'Medium',
    Preconditions: '1. Admin dang login.\n2. Feature chi moi release.\n3. Round History chua cac ban ghi truoc ngay release.',
    TestSteps: '1. Vao Admin > User Games Play.\n2. Chon bat ky user nao.\n3. Chuyen sang tab Round History.\n4. Loc hoac tim ban ghi co timestamp truoc ngay release.',
    ExpectedResult: 'Cac ban ghi lich su truoc release KHONG hien thi tag "Cashback" tai cot Bonus, cho du cac dieu kien co thoa man.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  // ---- Dieu kien 1: User khong tham gia cashback ----
  {
    ID: '5',
    Platform: PLATFORM,
    Page: 'User Games Play - Round History',
    Case: 'Xac minh khong hien thi tag Cashback khi user khong tham gia chuong trinh cashback',
    Subcase1: 'User khong co participation record',
    Subcase2: '',
    CaseType: 'Negative',
    Priority: 'High',
    Preconditions: '1. Admin dang login.\n2. Cashback dang active.\n3. User KHONG co bat ky participation record nao trong cashback.',
    TestSteps: '1. Vao Admin > User Games Play.\n2. Chon user khong tham gia cashback.\n3. Chuyen sang tab Round History.\n4. Tim bat ky ban ghi cuoc nao.',
    ExpectedResult: 'Khong hien thi tag "Cashback" tai cot Bonus cho bat ky cuoc nao cua user khong tham gia.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  // ---- Dieu kien 2: Cashback khong con hieu luc ----
  {
    ID: '6',
    Platform: PLATFORM,
    Page: 'User Games Play - Round History',
    Case: 'Xac minh khong hien thi tag Cashback khi cashback khong con hieu luc ve ngay thang',
    Subcase1: 'Ngay hien tai nam ngoai khoang [start_date, end_date]',
    Subcase2: '',
    CaseType: 'Negative',
    Priority: 'High',
    Preconditions: '1. Admin dang login.\n2. Cashback da het han hoac chua bat dau (nam ngoai khoang ngay).\n3. User co lich su cuoc trong khoang do.',
    TestSteps: '1. Vao Admin > User Games Play.\n2. Chon user co lich su.\n3. Chuyen sang tab Round History.\n4. Tim ban ghi cuoc nam ngoai khoang ngay hieu luc.',
    ExpectedResult: 'Khong hien thi tag "Cashback" tai cot Bonus khi cashback khong con hieu luc ve ngay thang.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  // ---- Dieu kien 3: Boundary Min/Max ----
  {
    ID: '7',
    Platform: PLATFORM,
    Page: 'User Games Play - Round History',
    Case: 'Xac minh tag Cashback theo gioi han cuoc (Min/Max)',
    Subcase1: 'Cuoc < Min — khong ap dung',
    Subcase2: '',
    CaseType: 'Boundary',
    Priority: 'High',
    Preconditions: '1. Admin dang login.\n2. Cashback active, Min=100, Max=5000.\n3. User tham gia cashback.',
    TestSteps: '1. Vao Admin > User Games Play > Round History.\n2. Tim ban ghi cuoc co gia tri < Min (VD: 50).',
    ExpectedResult: 'Khong hien thi tag "Cashback" tai cot Bonus cho cuoc < Min.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: '8',
    Platform: PLATFORM,
    Page: 'User Games Play - Round History',
    Case: 'Xac minh tag Cashback theo gioi han cuoc (Min/Max)',
    Subcase1: 'Cuoc = Min — ap dung (boundary)',
    Subcase2: '',
    CaseType: 'Boundary',
    Priority: 'High',
    Preconditions: '1. Admin dang login.\n2. Cashback active, Min=100, Max=5000.\n3. User tham gia cashback, game eligible.',
    TestSteps: '1. Vao Admin > User Games Play > Round History.\n2. Tim hoac dat cuoc = Min (VD: 100).',
    ExpectedResult: 'Hien thi tag "Cashback" tai cot Bonus cho cuoc = Min (Min la gia tri bao gom).',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: '9',
    Platform: PLATFORM,
    Page: 'User Games Play - Round History',
    Case: 'Xac minh tag Cashback theo gioi han cuoc (Min/Max)',
    Subcase1: 'Cuoc nam trong khoang Min < bet < Max — ap dung',
    Subcase2: '',
    CaseType: 'Boundary',
    Priority: 'High',
    Preconditions: '1. Admin dang login.\n2. Cashback active, Min=100, Max=5000.\n3. User tham gia, game eligible.',
    TestSteps: '1. Vao Admin > User Games Play > Round History.\n2. Tim ban ghi cuoc trong khoang Min < bet < Max (VD: 1000).',
    ExpectedResult: 'Hien thi tag "Cashback" tai cot Bonus cho cuoc trong khoang (Min, Max).',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: '10',
    Platform: PLATFORM,
    Page: 'User Games Play - Round History',
    Case: 'Xac minh tag Cashback theo gioi han cuoc (Min/Max)',
    Subcase1: 'Cuoc = Max — ap dung (boundary)',
    Subcase2: '',
    CaseType: 'Boundary',
    Priority: 'High',
    Preconditions: '1. Admin dang login.\n2. Cashback active, Min=100, Max=5000.\n3. User tham gia, game eligible.',
    TestSteps: '1. Vao Admin > User Games Play > Round History.\n2. Tim hoac dat cuoc = Max (VD: 5000).',
    ExpectedResult: 'Hien thi tag "Cashback" tai cot Bonus cho cuoc = Max (Max la gia tri bao gom).',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: '11',
    Platform: PLATFORM,
    Page: 'User Games Play - Round History',
    Case: 'Xac minh tag Cashback theo gioi han cuoc (Min/Max)',
    Subcase1: 'Cuoc > Max — khong ap dung',
    Subcase2: '',
    CaseType: 'Boundary',
    Priority: 'High',
    Preconditions: '1. Admin dang login.\n2. Cashback active, Min=100, Max=5000.\n3. User tham gia.',
    TestSteps: '1. Vao Admin > User Games Play > Round History.\n2. Tim ban ghi cuoc > Max (VD: 5001).',
    ExpectedResult: 'Khong hien thi tag "Cashback" tai cot Bonus cho cuoc > Max.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  // ---- Dieu kien 4: Max refund cap ----
  {
    ID: '12',
    Platform: PLATFORM,
    Page: 'User Games Play - Round History',
    Case: 'Xac minh khong hien thi tag Cashback khi max refund cap da vuot',
    Subcase1: '% cashback * cuoc > max refund cap',
    Subcase2: '',
    CaseType: 'Negative',
    Priority: 'High',
    Preconditions: '1. Admin dang login.\n2. Cashback active voi Max Refund Cap (VD: 500).\n3. User dat cuoc lon (VD: 15000 voi % cashback = 5% => 750 > cap).',
    TestSteps: '1. Vao Admin > User Games Play > Round History.\n2. Tim ban ghi cuoc ma (% cashback * bet) > Max Refund Cap.',
    ExpectedResult: 'Khong hien thi tag "Cashback" tai cot Bonus. Cuoc bi loai khoi he thong tinh cashback.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  // ---- Dieu kien 5: Cashback status khong active ----
  {
    ID: '13',
    Platform: PLATFORM,
    Page: 'User Games Play - Round History',
    Case: 'Xac minh khong hien thi tag Cashback khi cashback status = inactive',
    Subcase1: 'Cashback status = inactive',
    Subcase2: '',
    CaseType: 'Negative',
    Priority: 'High',
    Preconditions: '1. Admin dang login.\n2. Cashback duoc cau hinh nhung status = "inactive".\n3. User co participation record nhung bi disabled.',
    TestSteps: '1. Vao Admin > User Games Play > Round History.\n2. Tim bat ky ban ghi cuoc nao.',
    ExpectedResult: 'Khong hien thi tag "Cashback" tai cot Bonus khi cashback status la inactive.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  // ---- Dieu kien 6: Game khong nam trong danh sach eligible ----
  {
    ID: '14',
    Platform: PLATFORM,
    Page: 'User Games Play - Round History',
    Case: 'Xac minh khong hien thi tag Cashback khi game khong nam trong danh sach eligible',
    Subcase1: 'Game choi khong nam trong cashback-eligible game list',
    Subcase2: '',
    CaseType: 'Negative',
    Priority: 'High',
    Preconditions: '1. Admin dang login.\n2. Cashback active.\n3. Game choi khong co trong danh sach eligible game (duoc cau hinh o Admin).',
    TestSteps: '1. Vao Admin > User Games Play > Round History.\n2. Tim ban ghi cuoc dat o game khong eligible.',
    ExpectedResult: 'Khong hien thi tag "Cashback" tai cot Bonus cho cuoc dat o game khong eligible.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  // ---- Data integrity: Tag dong nhat giua Round History va Transaction History ----
  {
    ID: '15',
    Platform: PLATFORM,
    Page: 'User Games Play - Round History',
    Case: 'Xac minh tag Cashback dong nhat giua Round History va Transaction History cho cung mot cuoc',
    Subcase1: 'Cuoc thoa man — tag cung xuat hien o ca 2 view',
    Subcase2: '',
    CaseType: 'Positive',
    Priority: 'High',
    Preconditions: '1. Admin dang login.\n2. User co nhieu cuoc, mix giua qualifying va non-qualifying.\n3. Cac cuoc nay xuat hien ca o Round History va Transaction History.',
    TestSteps: '1. Vao Admin > User Games Play > Round History.\n2. Ghi nhan cac ban ghi co tag Cashback.\n3. Chuyen sang Transaction History.\n4. So sanh cung mot bet ID giua 2 view.',
    ExpectedResult: 'Voi cuoc thoa man: tag "Cashback" xuat hien o ca Round History VA Transaction History.\nVoi cuoc khong thoa man: khong co tag o ca 2 view.\nKhong co truong hop nao chi co tag o mot trong hai view.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  // ---- UI: Text tag chinh xac ----
  {
    ID: '16',
    Platform: PLATFORM,
    Page: 'User Games Play - Round History',
    Case: 'Xac minh cot Bonus hien thi dung text tag "Cashback"',
    Subcase1: 'Text tag chinh xac la "Cashback", khong thieu, khong thua',
    Subcase2: '',
    CaseType: 'Positive',
    Priority: 'Medium',
    Preconditions: '1. Admin dang login.\n2. Co it nhat 1 cuoc thoa man dieu kien cashback.',
    TestSteps: '1. Vao Admin > User Games Play > Round History.\n2. Quan sat cot Bonus o hang co tag Cashback.\n3. Kiem tra text cu the.',
    ExpectedResult: 'Text tag la CHINH XAC "Cashback" (phan biet hoa thuong, khong co khoang trang thua, khong co ky tu dac biet).',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
];

// ============================================================
// TEST DATA — TRANSACTION HISTORY
// ============================================================
const transactionHistoryCases = [
  // ---- AC2: Tag hien thi khi cashback hoat dong ----
  {
    ID: '1',
    Platform: PLATFORM,
    Page: 'User Games Play - Transaction History',
    Case: 'Xac minh tag Cashback hien thi khi tat ca dieu kien deu thoa man (AC2)',
    Subcase1: 'Tat ca 6 dieu kien thoa man',
    Subcase2: '',
    CaseType: 'Positive',
    Priority: 'High',
    Preconditions: '1. Admin dang login.\n2. Cashback duoc cau hinh active, nam trong khoang ngay co hieu luc.\n3. Min/Max bet range duoc cau hinh.\n4. User dang tham gia cashback.\n5. Game choi nam trong danh sach cashback-eligible.\n6. Max refund cap chua vuot.',
    TestSteps: '1. Vao Admin > User Games Play.\n2. Chon tai khoan user co active cashback.\n3. Chuyen sang tab Transaction History.\n4. Xac dinh ban ghi giao dich cuoc thoa man.\n5. Quan sat cot Bonus.',
    ExpectedResult: 'Ban ghi giao dich hien thi tag "Cashback" tai cot Bonus.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  // ---- AC3: Khong hien thi khi cashback chua/da het ----
  {
    ID: '2',
    Platform: PLATFORM,
    Page: 'User Games Play - Transaction History',
    Case: 'Xac minh khong hien thi tag Cashback khi cuoc dat truoc khi cashback bat dau (AC3)',
    Subcase1: 'Giao dich truoc ngay bat dau cashback',
    Subcase2: '',
    CaseType: 'Negative',
    Priority: 'High',
    Preconditions: '1. Admin dang login.\n2. Cashback co ngay bat dau trong qua khu.\n3. User co giao dich truoc ngay bat dau.',
    TestSteps: '1. Vao Admin > User Games Play.\n2. Chon user co active cashback.\n3. Chuyen sang tab Transaction History.\n4. Tim giao dich co timestamp truoc ngay bat dau cashback.',
    ExpectedResult: 'Khong hien thi tag "Cashback" tai cot Bonus cho giao dich truoc ngay bat dau.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: '3',
    Platform: PLATFORM,
    Page: 'User Games Play - Transaction History',
    Case: 'Xac minh khong hien thi tag Cashback khi cashback da ket thuc (AC3)',
    Subcase1: 'Giao dich sau ngay ket thuc cashback',
    Subcase2: '',
    CaseType: 'Negative',
    Priority: 'High',
    Preconditions: '1. Admin dang login.\n2. Cashback da het han (end date < today).\n3. User co giao dich sau ngay het han.',
    TestSteps: '1. Vao Admin > User Games Play.\n2. Chon user co lich su.\n3. Chuyen sang tab Transaction History.\n4. Tim giao dich sau ngay ket thuc cashback.',
    ExpectedResult: 'Khong hien thi tag "Cashback" tai cot Bonus cho giao dich sau ngay het han.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  // ---- AC4: Giao dich truoc release khong hien thi ----
  {
    ID: '4',
    Platform: PLATFORM,
    Page: 'User Games Play - Transaction History',
    Case: 'Xac minh giao dich truoc khi release khong hien thi tag Cashback (AC4)',
    Subcase1: 'Giao dich truoc ngay release feature',
    Subcase2: '',
    CaseType: 'Positive',
    Priority: 'Medium',
    Preconditions: '1. Admin dang login.\n2. Feature chi moi release.\n3. Transaction History chua cac ban ghi truoc ngay release.',
    TestSteps: '1. Vao Admin > User Games Play.\n2. Chon bat ky user nao.\n3. Chuyen sang tab Transaction History.\n4. Tim giao dich co timestamp truoc ngay release.',
    ExpectedResult: 'Giao dich truoc release KHONG hien thi tag "Cashback" tai cot Bonus.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  // ---- Dieu kien 1: User khong tham gia cashback ----
  {
    ID: '5',
    Platform: PLATFORM,
    Page: 'User Games Play - Transaction History',
    Case: 'Xac minh khong hien thi tag Cashback khi user khong tham gia chuong trinh cashback',
    Subcase1: 'User khong co participation record',
    Subcase2: '',
    CaseType: 'Negative',
    Priority: 'High',
    Preconditions: '1. Admin dang login.\n2. Cashback dang active.\n3. User KHONG tham gia bat ky chuong trinh cashback nao.',
    TestSteps: '1. Vao Admin > User Games Play.\n2. Chon user khong tham gia cashback.\n3. Chuyen sang tab Transaction History.\n4. Tim bat ky giao dich nao.',
    ExpectedResult: 'Khong hien thi tag "Cashback" tai cot Bonus cho bat ky giao dich nao.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  // ---- Dieu kien 2: Cashback khong con hieu luc ----
  {
    ID: '6',
    Platform: PLATFORM,
    Page: 'User Games Play - Transaction History',
    Case: 'Xac minh khong hien thi tag Cashback khi cashback khong con hieu luc ve ngay thang',
    Subcase1: 'Ngay hien tai nam ngoai khoang [start_date, end_date]',
    Subcase2: '',
    CaseType: 'Negative',
    Priority: 'High',
    Preconditions: '1. Admin dang login.\n2. Cashback da het han hoac chua bat dau.\n3. User co giao dich trong khoang do.',
    TestSteps: '1. Vao Admin > User Games Play.\n2. Chon user co lich su.\n3. Chuyen sang tab Transaction History.\n4. Tim giao dich nam ngoai khoang ngay hieu luc.',
    ExpectedResult: 'Khong hien thi tag "Cashback" tai cot Bonus khi cashback khong con hieu luc.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  // ---- Dieu kien 3: Boundary Min/Max ----
  {
    ID: '7',
    Platform: PLATFORM,
    Page: 'User Games Play - Transaction History',
    Case: 'Xac minh tag Cashback theo gioi han cuoc (Min/Max)',
    Subcase1: 'Cuoc < Min — khong ap dung',
    Subcase2: '',
    CaseType: 'Boundary',
    Priority: 'High',
    Preconditions: '1. Admin dang login.\n2. Cashback active, Min=100, Max=5000.\n3. User tham gia cashback.',
    TestSteps: '1. Vao Admin > User Games Play > Transaction History.\n2. Tim giao dich cuoc < Min (VD: 50).',
    ExpectedResult: 'Khong hien thi tag "Cashback" tai cot Bonus cho giao dich < Min.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: '8',
    Platform: PLATFORM,
    Page: 'User Games Play - Transaction History',
    Case: 'Xac minh tag Cashback theo gioi han cuoc (Min/Max)',
    Subcase1: 'Cuoc = Min — ap dung (boundary)',
    Subcase2: '',
    CaseType: 'Boundary',
    Priority: 'High',
    Preconditions: '1. Admin dang login.\n2. Cashback active, Min=100, Max=5000.\n3. User tham gia, game eligible.',
    TestSteps: '1. Vao Admin > User Games Play > Transaction History.\n2. Tim hoac dat giao dich = Min (VD: 100).',
    ExpectedResult: 'Hien thi tag "Cashback" tai cot Bonus cho giao dich = Min (Min la gia tri bao gom).',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: '9',
    Platform: PLATFORM,
    Page: 'User Games Play - Transaction History',
    Case: 'Xac minh tag Cashback theo gioi han cuoc (Min/Max)',
    Subcase1: 'Cuoc nam trong khoang Min < bet < Max — ap dung',
    Subcase2: '',
    CaseType: 'Boundary',
    Priority: 'High',
    Preconditions: '1. Admin dang login.\n2. Cashback active, Min=100, Max=5000.\n3. User tham gia, game eligible.',
    TestSteps: '1. Vao Admin > User Games Play > Transaction History.\n2. Tim giao dich trong khoang (VD: 2000).',
    ExpectedResult: 'Hien thi tag "Cashback" tai cot Bonus cho giao dich trong khoang (Min, Max).',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: '10',
    Platform: PLATFORM,
    Page: 'User Games Play - Transaction History',
    Case: 'Xac minh tag Cashback theo gioi han cuoc (Min/Max)',
    Subcase1: 'Cuoc = Max — ap dung (boundary)',
    Subcase2: '',
    CaseType: 'Boundary',
    Priority: 'High',
    Preconditions: '1. Admin dang login.\n2. Cashback active, Min=100, Max=5000.\n3. User tham gia, game eligible.',
    TestSteps: '1. Vao Admin > User Games Play > Transaction History.\n2. Tim hoac dat giao dich = Max (VD: 5000).',
    ExpectedResult: 'Hien thi tag "Cashback" tai cot Bonus cho giao dich = Max (Max la gia tri bao gom).',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: '11',
    Platform: PLATFORM,
    Page: 'User Games Play - Transaction History',
    Case: 'Xac minh tag Cashback theo gioi han cuoc (Min/Max)',
    Subcase1: 'Cuoc > Max — khong ap dung',
    Subcase2: '',
    CaseType: 'Boundary',
    Priority: 'High',
    Preconditions: '1. Admin dang login.\n2. Cashback active, Min=100, Max=5000.\n3. User tham gia.',
    TestSteps: '1. Vao Admin > User Games Play > Transaction History.\n2. Tim giao dich > Max (VD: 6000).',
    ExpectedResult: 'Khong hien thi tag "Cashback" tai cot Bonus cho giao dich > Max.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  // ---- Dieu kien 4: Max refund cap ----
  {
    ID: '12',
    Platform: PLATFORM,
    Page: 'User Games Play - Transaction History',
    Case: 'Xac minh khong hien thi tag Cashback khi max refund cap da vuot',
    Subcase1: '% cashback * giao dich > max refund cap',
    Subcase2: '',
    CaseType: 'Negative',
    Priority: 'High',
    Preconditions: '1. Admin dang login.\n2. Cashback active voi Max Refund Cap (VD: 500).\n3. User dat cuoc lon (VD: 15000 voi % = 5% => 750 > cap).',
    TestSteps: '1. Vao Admin > User Games Play > Transaction History.\n2. Tim giao dich ma (% cashback * bet) > Max Refund Cap.',
    ExpectedResult: 'Khong hien thi tag "Cashback" tai cot Bonus khi max refund cap da vuot.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  // ---- Dieu kien 5: Cashback status inactive ----
  {
    ID: '13',
    Platform: PLATFORM,
    Page: 'User Games Play - Transaction History',
    Case: 'Xac minh khong hien thi tag Cashback khi cashback status = inactive',
    Subcase1: 'Cashback status = inactive',
    Subcase2: '',
    CaseType: 'Negative',
    Priority: 'High',
    Preconditions: '1. Admin dang login.\n2. Cashback duoc cau hinh nhung status = "inactive".\n3. User co participation record nhung bi disabled.',
    TestSteps: '1. Vao Admin > User Games Play > Transaction History.\n2. Tim bat ky giao dich nao.',
    ExpectedResult: 'Khong hien thi tag "Cashback" tai cot Bonus khi cashback status la inactive.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  // ---- Dieu kien 6: Game khong eligible ----
  {
    ID: '14',
    Platform: PLATFORM,
    Page: 'User Games Play - Transaction History',
    Case: 'Xac minh khong hien thi tag Cashback khi game khong nam trong danh sach eligible',
    Subcase1: 'Game choi khong nam trong cashback-eligible game list',
    Subcase2: '',
    CaseType: 'Negative',
    Priority: 'High',
    Preconditions: '1. Admin dang login.\n2. Cashback active.\n3. Game choi khong nam trong danh sach eligible (cau hinh o Admin).',
    TestSteps: '1. Vao Admin > User Games Play > Transaction History.\n2. Tim giao dich dat o game khong eligible.',
    ExpectedResult: 'Khong hien thi tag "Cashback" tai cot Bonus cho giao dich o game khong eligible.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  // ---- Data integrity: Tag dong nhat giua Round History va Transaction History ----
  {
    ID: '15',
    Platform: PLATFORM,
    Page: 'User Games Play - Transaction History',
    Case: 'Xac minh tag Cashback dong nhat giua Transaction History va Round History cho cung mot cuoc',
    Subcase1: 'Giao dich thoa man — tag cung xuat hien o ca 2 view',
    Subcase2: '',
    CaseType: 'Positive',
    Priority: 'High',
    Preconditions: '1. Admin dang login.\n2. User co nhieu giao dich, mix giua qualifying va non-qualifying.\n3. Cac giao dich xuat hien ca o Transaction History va Round History.',
    TestSteps: '1. Vao Admin > User Games Play > Transaction History.\n2. Ghi nhan cac giao dich co tag Cashback (so voi Round History).\n3. Chuyen sang Round History.\n4. So sanh cung mot bet ID giua 2 view.',
    ExpectedResult: 'Voi giao dich thoa man: tag "Cashback" xuat hien o ca Transaction History VA Round History.\nVoi giao dich khong thoa man: khong co tag o ca 2 view.\nKhong co truong hop chi co tag o mot view.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  // ---- UI: Text tag chinh xac ----
  {
    ID: '16',
    Platform: PLATFORM,
    Page: 'User Games Play - Transaction History',
    Case: 'Xac minh cot Bonus hien thi dung text tag "Cashback"',
    Subcase1: 'Text tag chinh xac la "Cashback", khong thieu, khong thua',
    Subcase2: '',
    CaseType: 'Positive',
    Priority: 'Medium',
    Preconditions: '1. Admin dang login.\n2. Co it nhat 1 giao dich thoa man dieu kien cashback.',
    TestSteps: '1. Vao Admin > User Games Play > Transaction History.\n2. Quan sat cot Bonus o hang co tag Cashback.\n3. Kiem tra text cu the.',
    ExpectedResult: 'Text tag la CHINH XAC "Cashback" (phan biet hoa thuong, khong co khoang trang thua, khong co ky tu dac biet).',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
];

// ============================================================
// GENERATE FILES
// ============================================================
async function main() {
  // ---- Round History ----
  const wbRH = makeWorkbook();
  const wsRH = wbRH.addWorksheet('Round History');
  configureSheet(wsRH, COLUMNS);
  addRows(wsRH, roundHistoryCases);
  const outRH = path.join(__dirname, 'output', PLATFORM, PAGE_GROUP, 'User Games Play - Round History', 'testcase.xlsx');
  await save(wbRH, outRH);
  console.log(`Round History: ${roundHistoryCases.length} test cases`);

  // ---- Transaction History ----
  const wbTH = makeWorkbook();
  const wsTH = wbTH.addWorksheet('Transaction History');
  configureSheet(wsTH, COLUMNS);
  addRows(wsTH, transactionHistoryCases);
  const outTH = path.join(__dirname, 'output', PLATFORM, PAGE_GROUP, 'User Games Play - Transaction History', 'testcase.xlsx');
  await save(wbTH, outTH);
  console.log(`Transaction History: ${transactionHistoryCases.length} test cases`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
