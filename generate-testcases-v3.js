const ExcelJS = require('exceljs');
const path = require('path');

// ============================================================
// WORKBOOK SETUP
// ============================================================
const wb = new ExcelJS.Workbook();
wb.creator = 'QA Lead';
wb.created = new Date();

// ============================================================
// COLOR CONSTANTS
// ============================================================
// Header colors
const HDR_DARK  = { argb: 'FF1F3864' }; // dark navy
const HDR_ID    = { argb: 'FF2E75B6' }; // medium blue
const HDR_LABEL = { argb: 'FF375623' }; // dark green
const HDR_CAT   = { argb: 'FF404040' }; // dark gray
const HDR_EXEC  = { argb: 'FF5C2D91' }; // purple

// Case Type badge colors
const CT_POSITIVE   = { bg: 'FFE2EFDA', font: 'FF375623' }; // soft green
const CT_NEGATIVE   = { bg: 'FFFCE4D6', font: 'FF9C0006' }; // soft red
const CT_BOUNDARY   = { bg: 'FFFFF2CC', font: 'FF7F6000' }; // soft yellow
const CT_EXCEPTION  = { bg: 'FFEDEDED', font: 'FF404040' }; // soft gray
const CT_SECURITY   = { bg: 'FFFFE6FF', font: 'FF7030A0' }; // soft purple
const CT_E2E        = { bg: 'FFE2E8F0', font: 'FF1E3A5F' }; // soft blue-gray

// Priority colors
const PRI_HIGH   = { bg: 'FFFFE0CC', font: 'FF000000' }; // orange-tinted
const PRI_MEDIUM = { bg: 'FFEBF3FB', font: 'FF000000' }; // light blue
const PRI_LOW    = { bg: 'FFF2F2F2', font: 'FF595959' }; // light gray

// Status colors
const STS_PASS = { bg: 'FFC6EFCE', font: 'FF276221' };
const STS_FAIL = { bg: 'FFFFC7CE', font: 'FF9C0006' };
const STS_BLOCK = { bg: 'FFFFE699', font: 'FF7F6000' };
const STS_PEND  = { bg: 'FFF2F2F2', font: 'FF595959' };

// Row / cell defaults
const ROW_DEFAULT_BG = { argb: 'FFFAFAFA' };
const ROW_ALT_BG     = { argb: 'FFF0F4FA' };
const EXPECTED_RESULT_BG = { argb: 'FFFFFBE6' }; // light yellow

// ============================================================
// COLUMN DEFINITIONS
// ============================================================
const COLS = [
  { header: 'Test Case ID',    key: 'ID',           width: 12 },
  { header: 'REQ ID',          key: 'ReqID',         width: 10 },
  { header: 'Platform',        key: 'Platform',      width: 11 },
  { header: 'Page',            key: 'Page',          width: 26 },
  { header: 'Case',            key: 'Case',          width: 42 },
  { header: 'Sub-case 1',      key: 'Subcase1',      width: 30 },
  { header: 'Sub-case 2',      key: 'Subcase2',      width: 26 },
  { header: 'Case Type',       key: 'CaseType',      width: 14 },
  { header: 'Priority',        key: 'Priority',      width: 11 },
  { header: 'Pre-conditions',  key: 'Preconditions', width: 46 },
  { header: 'Test Steps',      key: 'TestSteps',     width: 52 },
  { header: 'Expected Result', key: 'ExpectedResult',width: 52 },
  { header: 'Status',          key: 'Status',        width: 11 },
  { header: 'Execute Name',   key: 'ExecuteName',   width: 14 },
  { header: 'Execute Date',   key: 'ExecuteDate',   width: 13 },
];

// ============================================================
// HELPER: build header style by column group
// ============================================================
function headerStyle(key) {
  const idKeys    = ['ID', 'ReqID'];
  const labelKeys  = ['Platform', 'Page'];
  const catKeys   = ['Case', 'Subcase1', 'Subcase2', 'CaseType', 'Priority'];
  const execKeys  = ['Status', 'ExecuteName', 'ExecuteDate'];
  const condKeys  = ['Preconditions', 'TestSteps', 'ExpectedResult'];

  let bg;
  if (idKeys.includes(key))    bg = HDR_ID;
  else if (labelKeys.includes(key)) bg = HDR_LABEL;
  else if (catKeys.includes(key))   bg = HDR_CAT;
  else if (execKeys.includes(key))  bg = HDR_EXEC;
  else                         bg = HDR_DARK;

  return {
    font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: bg },
    alignment: { wrapText: true, vertical: 'middle', horizontal: 'center' },
    border: {
      top:    { style: 'thin', color: { argb: 'FF888888' } },
      left:   { style: 'thin', color: { argb: 'FF888888' } },
      bottom: { style: 'thin', color: { argb: 'FF888888' } },
      right:  { style: 'thin', color: { argb: 'FF888888' } },
    },
  };
}

// ============================================================
// HELPER: apply header row
// ============================================================
function applyHeaderRow(ws) {
  ws.getRow(1).eachCell((cell, colNum) => {
    const key = COLS[colNum - 1].key;
    const s = headerStyle(key);
    cell.font    = s.font;
    cell.fill    = s.fill;
    cell.alignment = s.alignment;
    cell.border  = s.border;
  });
  ws.getRow(1).height = 36;
  ws.getRow(1).commit();
}

// ============================================================
// HELPER: color cell by Case Type
// ============================================================
function ctColor(ct) {
  const map = {
    'Positive':  CT_POSITIVE,
    'Negative':  CT_NEGATIVE,
    'Boundary':  CT_BOUNDARY,
    'Exception': CT_EXCEPTION,
    'Security':  CT_SECURITY,
    'E2E':       CT_E2E,
  };
  return map[ct] || { bg: 'FFFFFFFF', font: 'FF000000' };
}

// ============================================================
// HELPER: color cell by Priority
// ============================================================
function priColor(p) {
  const map = {
    'High':   PRI_HIGH,
    'Medium': PRI_MEDIUM,
    'Low':    PRI_LOW,
  };
  return map[p] || { bg: 'FFFFFFFF', font: 'FF000000' };
}

// ============================================================
// HELPER: color cell by Status
// ============================================================
function stsColor(s) {
  const map = {
    'Pass':    STS_PASS,
    'Fail':    STS_FAIL,
    'Blocked': STS_BLOCK,
    'Pending': STS_PEND,
  };
  return map[s] || { bg: 'FFFFFFFF', font: 'FF000000' };
}

// ============================================================
// HELPER: apply data cell style
// ============================================================
function styleDataCell(cell, key, rowData, rowIdx) {
  const isAlt = rowIdx % 2 === 1;
  const altBg = isAlt ? ROW_ALT_BG : ROW_DEFAULT_BG;
  const thinBorder = {
    top:    { style: 'thin', color: { argb: 'FFCCCCCC' } },
    left:   { style: 'thin', color: { argb: 'FFCCCCCC' } },
    bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
    right:  { style: 'thin', color: { argb: 'FFCCCCCC' } },
  };

  // Default: light row bg
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: altBg };
  cell.alignment = { wrapText: true, vertical: 'top' };
  cell.border = thinBorder;

  // Special columns
  if (key === 'ID') {
    // Centered ID
    cell.alignment = { wrapText: false, vertical: 'middle', horizontal: 'center' };
    cell.font = { bold: true, color: { argb: 'FF1F3864' }, size: 10 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
  } else if (key === 'ReqID') {
    cell.alignment = { wrapText: false, vertical: 'middle', horizontal: 'center' };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E75B6' } };
  } else if (key === 'CaseType') {
    const c = ctColor(rowData.CaseType || '');
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.bg } };
    cell.font = { bold: true, color: { argb: c.font }, size: 10 };
    cell.alignment = { wrapText: false, vertical: 'middle', horizontal: 'center' };
  } else if (key === 'Priority') {
    const c = priColor(rowData.Priority || '');
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.bg } };
    cell.font = { bold: true, color: { argb: c.font }, size: 10 };
    cell.alignment = { wrapText: false, vertical: 'middle', horizontal: 'center' };
  } else if (key === 'Status') {
    const s = rowData.Status || 'Pending';
    const c = stsColor(s);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.bg } };
    cell.font = { bold: true, color: { argb: c.font }, size: 10 };
    cell.alignment = { wrapText: false, vertical: 'middle', horizontal: 'center' };
  } else if (key === 'ExpectedResult') {
    // Distinct color for Expected Result
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: EXPECTED_RESULT_BG };
    cell.font = { size: 10, color: { argb: 'FF3D3D00' } };
  } else {
    cell.font = { size: 10 };
  }
}

// ============================================================
// HELPER: add rows to a sheet
// ============================================================
function addRows(ws, testCases) {
  testCases.forEach((tc, idx) => {
    const row = ws.addRow(tc);
    const rowNum = idx + 2;
    row.height = 85;
    ws.getRow(rowNum).eachCell((cell) => {
      const key = COLS[cell.col - 1] ? COLS[cell.col - 1].key : cell.key;
      styleDataCell(cell, key, tc, idx);
    });
    ws.getRow(rowNum).commit();
  });
}

// ============================================================
// HELPER: freeze panes & filter
// ============================================================
function configureSheet(ws, freezeCol, freezeRow) {
  ws.views = [
    {
      state: 'frozen',
      xSplit: freezeCol,
      ySplit: freezeRow,
    },
  ];
  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to:   { row: 1, column: COLS.length },
  };
}

// ============================================================
// TEST DATA — ROUND HISTORY (RH- prefix)
// ============================================================
const roundHistoryTC = [
  // ---- RH-01: Core positive — all conditions met ----
  {
    ID: 'RH-01', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Round History',
    Case: 'Verify Cashback tag displays when all 6 eligibility conditions are met',
    Subcase1: 'All 6 conditions satisfied',
    Subcase2: '',
    CaseType: 'Positive', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. Cashback bonus is configured and ACTIVE in Admin.\n3. Cashback date range is valid (start_date <= today <= end_date).\n4. Min/Max bet range is configured.\n5. User has an active cashback participation record.\n6. Game played is in the cashback-eligible game list.\n7. Max refund cap has not been exceeded for this user.',
    TestSteps: '1. Go to Admin > User Games Play.\n2. Select the target user with active cashback.\n3. Navigate to Round History tab.\n4. Place or locate a bet within Min <= bet <= Max.\n5. Verify the bet record appears in Round History.',
    ExpectedResult: 'The bet row displays the "Cashback" tag in the Bonus column.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- RH-02: State transition — user joins cashback mid-session ----
  {
    ID: 'RH-02', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Round History',
    Case: 'Verify Cashback tag appears when user enrolls in cashback while already playing',
    Subcase1: 'User joins cashback while a game session is active',
    Subcase2: '',
    CaseType: 'E2E', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. User is already playing (has existing round history).\n3. Admin enrolls user in cashback program.\n4. Cashback is active, eligible game, bet within Min/Max.',
    TestSteps: '1. Go to Admin > User Games Play.\n2. Select the target user.\n3. Navigate to Round History tab.\n4. Place a bet AFTER the user was enrolled in cashback.\n5. Locate the new bet in Round History.',
    ExpectedResult: 'The bet placed AFTER enrollment displays "Cashback" tag in Bonus column. Bet placed before enrollment shows no tag.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- RH-03: C1 fail — user not participating ----
  {
    ID: 'RH-03', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Round History',
    Case: 'Verify NO Cashback tag when user is not enrolled in cashback program',
    Subcase1: 'Condition 1 fails — user has no cashback participation',
    Subcase2: '',
    CaseType: 'Negative', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. Cashback is configured and ACTIVE.\n3. Target user has NO participation record in the cashback program.',
    TestSteps: '1. Go to Admin > User Games Play.\n2. Select a user who is NOT enrolled in cashback.\n3. Navigate to Round History tab.\n4. Locate any bet record.',
    ExpectedResult: 'No bet in Round History displays "Cashback" tag in Bonus column.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- RH-04: C2 fail — cashback date range invalid ----
  {
    ID: 'RH-04', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Round History',
    Case: 'Verify NO Cashback tag when cashback period is not currently valid',
    Subcase1: 'Condition 2 fails — current date outside cashback date range',
    Subcase2: '',
    CaseType: 'Negative', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. Cashback end_date < today (expired) OR start_date > today (not started).\n3. User has a cashback participation record but the period is invalid.',
    TestSteps: '1. Go to Admin > User Games Play.\n2. Select the target user.\n3. Navigate to Round History tab.\n4. Locate a bet record placed during the invalid period.',
    ExpectedResult: 'No "Cashback" tag appears in Bonus column for bets placed outside the valid date range.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- RH-05: C3 boundary — bet below Min ----
  {
    ID: 'RH-05', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Round History',
    Case: 'Verify NO Cashback tag when bet amount is below the configured Min threshold',
    Subcase1: 'Condition 3 boundary — bet < Min (Min=100, example)',
    Subcase2: '',
    CaseType: 'Boundary', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. Cashback is ACTIVE with Min=100, Max=5000.\n3. User is enrolled in cashback, game is eligible.',
    TestSteps: '1. Go to Admin > User Games Play > Round History.\n2. Locate a bet record with amount < Min (e.g., 50).',
    ExpectedResult: 'No "Cashback" tag in Bonus column for bet < Min.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- RH-06: C3 boundary — bet = Min ----
  {
    ID: 'RH-06', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Round History',
    Case: 'Verify Cashback tag displays when bet amount equals Min threshold (inclusive boundary)',
    Subcase1: 'Condition 3 boundary — bet = Min (Min=100)',
    Subcase2: '',
    CaseType: 'Boundary', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. Cashback ACTIVE with Min=100, Max=5000.\n3. User enrolled, game eligible, cap not reached.',
    TestSteps: '1. Go to Admin > User Games Play > Round History.\n2. Locate a bet = Min (e.g., 100).',
    ExpectedResult: '"Cashback" tag appears in Bonus column for bet = Min (Min is inclusive).',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- RH-07: C3 boundary — bet within range ----
  {
    ID: 'RH-07', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Round History',
    Case: 'Verify Cashback tag displays when bet amount is strictly within Min and Max range',
    Subcase1: 'Condition 3 boundary — Min < bet < Max (e.g., 100 < 2500 < 5000)',
    Subcase2: '',
    CaseType: 'Boundary', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. Cashback ACTIVE, Min=100, Max=5000.\n3. User enrolled, game eligible, cap not reached.',
    TestSteps: '1. Go to Admin > User Games Play > Round History.\n2. Locate a bet in the range (e.g., 2500).',
    ExpectedResult: '"Cashback" tag appears in Bonus column for bet within (Min, Max).',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- RH-08: C3 boundary — bet = Max ----
  {
    ID: 'RH-08', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Round History',
    Case: 'Verify Cashback tag displays when bet amount equals Max threshold (inclusive boundary)',
    Subcase1: 'Condition 3 boundary — bet = Max (Max=5000)',
    Subcase2: '',
    CaseType: 'Boundary', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. Cashback ACTIVE with Min=100, Max=5000.\n3. User enrolled, game eligible, cap not reached.',
    TestSteps: '1. Go to Admin > User Games Play > Round History.\n2. Locate a bet = Max (e.g., 5000).',
    ExpectedResult: '"Cashback" tag appears in Bonus column for bet = Max (Max is inclusive).',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- RH-09: C3 boundary — bet above Max ----
  {
    ID: 'RH-09', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Round History',
    Case: 'Verify NO Cashback tag when bet amount exceeds the configured Max threshold',
    Subcase1: 'Condition 3 boundary — bet > Max (Max=5000)',
    Subcase2: '',
    CaseType: 'Boundary', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. Cashback ACTIVE with Min=100, Max=5000.\n3. User enrolled, game eligible.',
    TestSteps: '1. Go to Admin > User Games Play > Round History.\n2. Locate a bet > Max (e.g., 5001).',
    ExpectedResult: 'No "Cashback" tag in Bonus column for bet > Max.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- RH-10: C4 fail — max refund cap exceeded ----
  {
    ID: 'RH-10', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Round History',
    Case: 'Verify NO Cashback tag when calculated cashback exceeds the configured Max Refund Cap',
    Subcase1: 'Condition 4 fails — (% cashback * bet amount) > Max Refund Cap',
    Subcase2: '',
    CaseType: 'Negative', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. Cashback ACTIVE with Max Refund Cap = 500 (example).\n3. User enrolled in cashback.\n4. A bet results in cashback amount > cap (e.g., 5% of 15000 = 750 > 500).',
    TestSteps: '1. Go to Admin > User Games Play > Round History.\n2. Locate a bet where (cashback % * bet) > Max Refund Cap.',
    ExpectedResult: 'No "Cashback" tag appears in Bonus column. The bet is excluded from cashback calculation per AC logic.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- RH-11: State transition — cashback expires mid-session ----
  {
    ID: 'RH-11', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Round History',
    Case: 'Verify Cashback tag behavior when cashback expires during an active game session',
    Subcase1: 'E2E state transition — cashback expires while user is mid-session',
    Subcase2: '',
    CaseType: 'E2E', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. User has an active game session with multiple bets.\n3. Cashback expires (end_date passes) during the session.',
    TestSteps: '1. Go to Admin > User Games Play > Round History.\n2. Locate bets placed BEFORE cashback expiry.\n3. Locate bets placed AFTER cashback expiry.\n4. Compare the Bonus column for each.',
    ExpectedResult: 'Bets placed BEFORE expiry: "Cashback" tag shown.\nBets placed AFTER expiry: NO "Cashback" tag.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- RH-12: State transition — cashback reactivated ----
  {
    ID: 'RH-12', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Round History',
    Case: 'Verify Cashback tag displays when previously inactive cashback is reactivated',
    Subcase1: 'E2E state transition — cashback status changed from inactive to active',
    Subcase2: '',
    CaseType: 'E2E', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. Cashback was previously INACTIVE and is now reactivated.\n3. User has an active participation record.',
    TestSteps: '1. Go to Admin > User Games Play > Round History.\n2. Place or locate a bet after reactivation.\n3. Check the Bonus column.',
    ExpectedResult: 'Bets placed AFTER reactivation display "Cashback" tag. Previous bets (pre-reactivation) show no tag.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- RH-13: C5 fail — cashback status inactive ----
  {
    ID: 'RH-13', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Round History',
    Case: 'Verify NO Cashback tag when cashback status is set to Inactive',
    Subcase1: 'Condition 5 fails — cashback status = Inactive',
    Subcase2: '',
    CaseType: 'Negative', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. Cashback configuration status is set to "Inactive".\n3. User has a participation record (but program is disabled).',
    TestSteps: '1. Go to Admin > User Games Play > Round History.\n2. Locate any bet record for the affected user.',
    ExpectedResult: 'No "Cashback" tag in Bonus column when cashback status is Inactive.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- RH-14: C6 fail — game not eligible ----
  {
    ID: 'RH-14', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Round History',
    Case: 'Verify NO Cashback tag when the game played is not in the eligible game list',
    Subcase1: 'Condition 6 fails — game is not in cashback-eligible list',
    Subcase2: '',
    CaseType: 'Negative', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. Cashback is ACTIVE with valid date range.\n3. User is enrolled in cashback.\n4. Game played is NOT in the cashback-eligible game list (configured in Admin).',
    TestSteps: '1. Go to Admin > User Games Play > Round History.\n2. Locate a bet placed on a non-eligible game (within Min/Max range).',
    ExpectedResult: 'No "Cashback" tag in Bonus column for bets on non-eligible games, even if all other conditions are met.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- RH-15: AC4 — pre-release history no tag ----
  {
    ID: 'RH-15', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Round History',
    Case: 'Verify pre-release historical bets do NOT display Cashback tag (AC4)',
    Subcase1: 'Historical records created before feature release date',
    Subcase2: '',
    CaseType: 'Positive', Priority: 'Medium',
    Preconditions: '1. Admin is logged in.\n2. Cashback tag feature has just been released.\n3. Round History contains bets from before the release date.',
    TestSteps: '1. Go to Admin > User Games Play > Round History.\n2. Filter or locate bets with timestamps BEFORE the feature release date.\n3. Verify these bets would otherwise satisfy all 6 conditions.',
    ExpectedResult: 'Pre-release bet records do NOT display "Cashback" tag, even if all 6 eligibility conditions are met.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- RH-16: Data integrity — tag consistency RH vs TH ----
  {
    ID: 'RH-16', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Round History',
    Case: 'Verify Cashback tag is consistent between Round History and Transaction History for the same bet',
    Subcase1: 'Data integrity — cross-view consistency for qualifying bet',
    Subcase2: '',
    CaseType: 'Positive', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. User has a mix of qualifying and non-qualifying bets.\n3. Both Round History and Transaction History are accessible.',
    TestSteps: '1. Go to Admin > User Games Play > Round History.\n2. Identify qualifying and non-qualifying bet IDs.\n3. Navigate to Transaction History.\n4. Compare the same bet IDs for tag presence.',
    ExpectedResult: 'For qualifying bets: "Cashback" tag appears in BOTH Round History and Transaction History.\nFor non-qualifying bets: NO tag in either view.\nNo discrepancy between the two views.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- RH-17: UI — exact tag text ----
  {
    ID: 'RH-17', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Round History',
    Case: 'Verify Bonus column displays the exact text "Cashback" (case-sensitive, no extra characters)',
    Subcase1: 'UI validation — exact tag text content',
    Subcase2: '',
    CaseType: 'Positive', Priority: 'Medium',
    Preconditions: '1. Admin is logged in.\n2. At least one qualifying bet exists in Round History.',
    TestSteps: '1. Go to Admin > User Games Play > Round History.\n2. Examine the Bonus column for a row with the Cashback tag.\n3. Verify the exact text displayed.',
    ExpectedResult: 'Tag text is exactly "Cashback" — correct capitalization, no extra spaces, no special characters.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- RH-18: State — user cancels cashback after qualifying bet ----
  {
    ID: 'RH-18', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Round History',
    Case: 'Verify NO additional tag logic change for already-placed bets when user cancels cashback',
    Subcase1: 'E2E state — user cancels cashback enrollment after placing qualifying bet',
    Subcase2: '',
    CaseType: 'E2E', Priority: 'Medium',
    Preconditions: '1. Admin is logged in.\n2. User placed a bet that qualified for Cashback tag (tag already shown).\n3. User or Admin then cancels/removes the cashback enrollment.',
    TestSteps: '1. Go to Admin > User Games Play > Round History.\n2. Verify the previously placed qualifying bet still shows "Cashback" tag.\n3. Place a new bet after cancellation.\n4. Verify the new bet shows NO tag.',
    ExpectedResult: 'Already-placed qualifying bet: tag remains unchanged.\nNew bets placed after cancellation: NO "Cashback" tag.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- RH-19: E2E — multiple bets, cap reached mid-session ----
  {
    ID: 'RH-19', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Round History',
    Case: 'Verify Cashback tag disappears for bets placed after Max Refund Cap is reached',
    Subcase1: 'E2E state — cap exhaustion during a sequence of bets',
    Subcase2: '',
    CaseType: 'E2E', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. Cashback is ACTIVE with Max Refund Cap = 500 (example).\n3. User places multiple bets, cumulatively reaching/exceeding the cap.',
    TestSteps: '1. Go to Admin > User Games Play > Round History.\n2. Identify bets placed BEFORE cap is reached (should have tag).\n3. Identify bets placed AFTER cap is reached (should NOT have tag).\n4. Verify the transition point.',
    ExpectedResult: 'Bets where cumulative cashback is still within cap: "Cashback" tag shown.\nBets after cap is exceeded: NO "Cashback" tag.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- RH-20: E2E — admin changes Min/Max range, existing bets unchanged ----
  {
    ID: 'RH-20', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Round History',
    Case: 'Verify existing bets retain their tag status when Admin changes Min/Max range configuration',
    Subcase1: 'E2E state — Min/Max config updated after bets are placed',
    Subcase2: '',
    CaseType: 'E2E', Priority: 'Medium',
    Preconditions: '1. Admin is logged in.\n2. Bets were placed with original Min/Max config and received tags.\n3. Admin changes Min or Max value in configuration.',
    TestSteps: '1. Go to Admin > User Games Play > Round History.\n2. Locate previously placed bets (before config change).\n3. Compare their tag status before and after the config change.',
    ExpectedResult: 'Existing (already placed) bet records retain their original tag status regardless of subsequent Min/Max config changes.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- RH-21: E2E — bet placed before cashback, then cashback starts, existing bet unchanged ----
  {
    ID: 'RH-21', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Round History',
    Case: 'Verify a bet placed BEFORE cashback period starts does NOT get a retroactive tag when cashback activates',
    Subcase1: 'E2E state — cashback period starts after bet is placed',
    Subcase2: '',
    CaseType: 'E2E', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. User placed a bet BEFORE the cashback start_date.\n3. Cashback then becomes active (start_date reached).',
    TestSteps: '1. Go to Admin > User Games Play > Round History.\n2. Locate the bet placed before cashback start_date.\n3. Verify tag status after cashback has become active.',
    ExpectedResult: 'Bet placed before cashback start_date: NO "Cashback" tag (tag is NOT applied retroactively).',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
];

// ============================================================
// TEST DATA — TRANSACTION HISTORY (TH- prefix)
// ============================================================
const transactionHistoryTC = [
  // ---- TH-01: Core positive — all conditions met ----
  {
    ID: 'TH-01', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Transaction History',
    Case: 'Verify Cashback tag displays when all 6 eligibility conditions are met (AC2)',
    Subcase1: 'All 6 conditions satisfied',
    Subcase2: '',
    CaseType: 'Positive', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. Cashback bonus is configured and ACTIVE in Admin.\n3. Cashback date range is valid.\n4. Min/Max bet range is configured.\n5. User has an active cashback participation record.\n6. Game played is in the eligible list.\n7. Max refund cap has not been exceeded.',
    TestSteps: '1. Go to Admin > User Games Play.\n2. Select the target user with active cashback.\n3. Navigate to Transaction History tab.\n4. Locate the qualifying bet transaction.\n5. Verify the Bonus column.',
    ExpectedResult: 'The transaction row displays the "Cashback" tag in the Bonus column, matching Round History.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- TH-02: State transition — user joins cashback mid-session ----
  {
    ID: 'TH-02', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Transaction History',
    Case: 'Verify Cashback tag appears for bets placed AFTER user enrolls in cashback',
    Subcase1: 'User joins cashback while already playing',
    Subcase2: '',
    CaseType: 'E2E', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. User is already playing.\n3. Admin enrolls user in cashback.\n4. User places bets after enrollment.',
    TestSteps: '1. Go to Admin > User Games Play > Transaction History.\n2. Locate transactions placed BEFORE enrollment.\n3. Locate transactions placed AFTER enrollment.\n4. Compare Bonus column for each.',
    ExpectedResult: 'Transactions AFTER enrollment: "Cashback" tag shown.\nTransactions before enrollment: NO tag.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- TH-03: C1 fail — user not participating ----
  {
    ID: 'TH-03', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Transaction History',
    Case: 'Verify NO Cashback tag when user is not enrolled in cashback program',
    Subcase1: 'Condition 1 fails — user has no cashback participation',
    Subcase2: '',
    CaseType: 'Negative', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. Cashback is ACTIVE.\n3. Target user is NOT enrolled in cashback.',
    TestSteps: '1. Go to Admin > User Games Play > Transaction History.\n2. Select a non-enrolled user.\n3. Locate any transaction.',
    ExpectedResult: 'No "Cashback" tag in Bonus column for any transaction of non-enrolled user.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- TH-04: C2 fail — cashback date range invalid ----
  {
    ID: 'TH-04', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Transaction History',
    Case: 'Verify NO Cashback tag when current date is outside cashback validity period',
    Subcase1: 'Condition 2 fails — date outside [start_date, end_date]',
    Subcase2: '',
    CaseType: 'Negative', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. Cashback has expired or not yet started.\n3. User has participation record but period is invalid.',
    TestSteps: '1. Go to Admin > User Games Play > Transaction History.\n2. Locate transactions placed outside the valid date range.',
    ExpectedResult: 'No "Cashback" tag for transactions outside the valid cashback date range.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- TH-05: C3 boundary — bet below Min ----
  {
    ID: 'TH-05', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Transaction History',
    Case: 'Verify NO Cashback tag when bet amount is below configured Min threshold',
    Subcase1: 'Condition 3 boundary — bet < Min (Min=100)',
    Subcase2: '',
    CaseType: 'Boundary', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. Cashback ACTIVE, Min=100, Max=5000.\n3. User enrolled, game eligible.',
    TestSteps: '1. Go to Admin > User Games Play > Transaction History.\n2. Locate a transaction with bet < Min (e.g., 50).',
    ExpectedResult: 'No "Cashback" tag in Bonus column for bet < Min.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- TH-06: C3 boundary — bet = Min ----
  {
    ID: 'TH-06', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Transaction History',
    Case: 'Verify Cashback tag displays when bet amount equals Min threshold (inclusive)',
    Subcase1: 'Condition 3 boundary — bet = Min (Min=100)',
    Subcase2: '',
    CaseType: 'Boundary', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. Cashback ACTIVE, Min=100, Max=5000.\n3. User enrolled, game eligible, cap not reached.',
    TestSteps: '1. Go to Admin > User Games Play > Transaction History.\n2. Locate a transaction with bet = Min (100).',
    ExpectedResult: '"Cashback" tag appears in Bonus column for bet = Min (Min is inclusive).',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- TH-07: C3 boundary — bet within range ----
  {
    ID: 'TH-07', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Transaction History',
    Case: 'Verify Cashback tag displays when bet amount is within Min and Max range',
    Subcase1: 'Condition 3 boundary — Min < bet < Max (e.g., 100 < 3000 < 5000)',
    Subcase2: '',
    CaseType: 'Boundary', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. Cashback ACTIVE, Min=100, Max=5000.\n3. User enrolled, game eligible, cap not reached.',
    TestSteps: '1. Go to Admin > User Games Play > Transaction History.\n2. Locate a transaction with bet within range (e.g., 3000).',
    ExpectedResult: '"Cashback" tag appears in Bonus column for bet within (Min, Max).',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- TH-08: C3 boundary — bet = Max ----
  {
    ID: 'TH-08', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Transaction History',
    Case: 'Verify Cashback tag displays when bet amount equals Max threshold (inclusive)',
    Subcase1: 'Condition 3 boundary — bet = Max (Max=5000)',
    Subcase2: '',
    CaseType: 'Boundary', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. Cashback ACTIVE, Min=100, Max=5000.\n3. User enrolled, game eligible, cap not reached.',
    TestSteps: '1. Go to Admin > User Games Play > Transaction History.\n2. Locate a transaction with bet = Max (5000).',
    ExpectedResult: '"Cashback" tag appears in Bonus column for bet = Max (Max is inclusive).',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- TH-09: C3 boundary — bet above Max ----
  {
    ID: 'TH-09', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Transaction History',
    Case: 'Verify NO Cashback tag when bet amount exceeds the configured Max threshold',
    Subcase1: 'Condition 3 boundary — bet > Max (Max=5000)',
    Subcase2: '',
    CaseType: 'Boundary', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. Cashback ACTIVE, Min=100, Max=5000.\n3. User enrolled, game eligible.',
    TestSteps: '1. Go to Admin > User Games Play > Transaction History.\n2. Locate a transaction with bet > Max (e.g., 6000).',
    ExpectedResult: 'No "Cashback" tag in Bonus column for bet > Max.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- TH-10: C4 fail — max refund cap exceeded ----
  {
    ID: 'TH-10', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Transaction History',
    Case: 'Verify NO Cashback tag when calculated cashback exceeds Max Refund Cap',
    Subcase1: 'Condition 4 fails — (% cashback * bet) > Max Refund Cap',
    Subcase2: '',
    CaseType: 'Negative', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. Cashback ACTIVE with Max Refund Cap = 500 (example).\n3. A bet results in cashback amount > cap.',
    TestSteps: '1. Go to Admin > User Games Play > Transaction History.\n2. Locate the transaction where (cashback % * bet) > Max Refund Cap.',
    ExpectedResult: 'No "Cashback" tag in Bonus column when cap is exceeded.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- TH-11: E2E — cashback expires mid-session ----
  {
    ID: 'TH-11', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Transaction History',
    Case: 'Verify Cashback tag behavior when cashback expires during an active session',
    Subcase1: 'E2E state — cashback expires while user is actively placing bets',
    Subcase2: '',
    CaseType: 'E2E', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. User has multiple active bets.\n3. Cashback expires during the session.',
    TestSteps: '1. Go to Admin > User Games Play > Transaction History.\n2. Identify transactions placed before expiry.\n3. Identify transactions placed after expiry.\n4. Compare Bonus column.',
    ExpectedResult: 'Transactions before expiry: "Cashback" tag shown.\nTransactions after expiry: NO "Cashback" tag.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- TH-12: E2E — cashback reactivated ----
  {
    ID: 'TH-12', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Transaction History',
    Case: 'Verify Cashback tag displays for transactions after cashback is reactivated',
    Subcase1: 'E2E state — cashback status changed from Inactive to Active',
    Subcase2: '',
    CaseType: 'E2E', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. Cashback was Inactive and is now reactivated.\n3. User has active participation.',
    TestSteps: '1. Go to Admin > User Games Play > Transaction History.\n2. Locate transactions placed after reactivation.\n3. Verify Bonus column.',
    ExpectedResult: 'Transactions after reactivation: "Cashback" tag shown.\nTransactions before reactivation: NO tag.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- TH-13: C5 fail — cashback status inactive ----
  {
    ID: 'TH-13', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Transaction History',
    Case: 'Verify NO Cashback tag when cashback status is set to Inactive',
    Subcase1: 'Condition 5 fails — cashback status = Inactive',
    Subcase2: '',
    CaseType: 'Negative', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. Cashback status = "Inactive".\n3. User has participation record but program is disabled.',
    TestSteps: '1. Go to Admin > User Games Play > Transaction History.\n2. Locate any transaction.',
    ExpectedResult: 'No "Cashback" tag in Bonus column when cashback is Inactive.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- TH-14: C6 fail — game not eligible ----
  {
    ID: 'TH-14', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Transaction History',
    Case: 'Verify NO Cashback tag when the game is not in the eligible game list',
    Subcase1: 'Condition 6 fails — game is not in cashback-eligible list',
    Subcase2: '',
    CaseType: 'Negative', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. Cashback ACTIVE, valid date, user enrolled.\n3. Game played is NOT in eligible game list.',
    TestSteps: '1. Go to Admin > User Games Play > Transaction History.\n2. Locate a transaction on a non-eligible game.',
    ExpectedResult: 'No "Cashback" tag in Bonus column for non-eligible game transactions.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- TH-15: AC4 — pre-release history no tag ----
  {
    ID: 'TH-15', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Transaction History',
    Case: 'Verify pre-release transactions do NOT display Cashback tag (AC4)',
    Subcase1: 'Historical records created before feature release',
    Subcase2: '',
    CaseType: 'Positive', Priority: 'Medium',
    Preconditions: '1. Admin is logged in.\n2. Cashback tag feature just released.\n3. Transaction History contains records from before release.',
    TestSteps: '1. Go to Admin > User Games Play > Transaction History.\n2. Locate transactions with timestamps before release date.\n3. Confirm these transactions otherwise meet all 6 conditions.',
    ExpectedResult: 'Pre-release transactions do NOT display "Cashback" tag, even if all 6 conditions are met.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- TH-16: Data integrity — tag consistency TH vs RH ----
  {
    ID: 'TH-16', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Transaction History',
    Case: 'Verify Cashback tag is consistent between Transaction History and Round History for the same transaction',
    Subcase1: 'Data integrity — cross-view consistency for non-qualifying bet',
    Subcase2: '',
    CaseType: 'Positive', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. User has mix of qualifying and non-qualifying transactions.',
    TestSteps: '1. Go to Admin > User Games Play > Transaction History.\n2. Identify qualifying and non-qualifying transaction IDs.\n3. Cross-reference with Round History.\n4. Verify tag status matches.',
    ExpectedResult: 'Tag status is identical between Transaction History and Round History for every transaction ID. No discrepancy.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- TH-17: UI — exact tag text ----
  {
    ID: 'TH-17', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Transaction History',
    Case: 'Verify Bonus column displays the exact text "Cashback" in Transaction History',
    Subcase1: 'UI validation — exact tag text content',
    Subcase2: '',
    CaseType: 'Positive', Priority: 'Medium',
    Preconditions: '1. Admin is logged in.\n2. At least one qualifying transaction exists.',
    TestSteps: '1. Go to Admin > User Games Play > Transaction History.\n2. Examine the Bonus column for a qualifying transaction.\n3. Verify the exact displayed text.',
    ExpectedResult: 'Tag text is exactly "Cashback" — correct capitalization, no extra spaces or characters.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- TH-18: State — user cancels cashback after qualifying bet ----
  {
    ID: 'TH-18', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Transaction History',
    Case: 'Verify existing qualifying transactions retain tag when user cancels cashback enrollment',
    Subcase1: 'E2E state — cashback enrollment cancelled after qualifying bet placed',
    Subcase2: '',
    CaseType: 'E2E', Priority: 'Medium',
    Preconditions: '1. Admin is logged in.\n2. A qualifying transaction already has "Cashback" tag.\n3. User or Admin cancels the cashback enrollment.',
    TestSteps: '1. Go to Admin > User Games Play > Transaction History.\n2. Verify the existing qualifying transaction still shows "Cashback" tag.\n3. Identify new transactions placed after cancellation.\n4. Verify new transactions show NO tag.',
    ExpectedResult: 'Existing qualifying transaction: tag unchanged.\nNew transactions after cancellation: NO "Cashback" tag.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- TH-19: E2E — multiple transactions, cap reached ----
  {
    ID: 'TH-19', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Transaction History',
    Case: 'Verify Cashback tag disappears for transactions after Max Refund Cap is exhausted',
    Subcase1: 'E2E state — cap exhaustion during sequential transactions',
    Subcase2: '',
    CaseType: 'E2E', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. Cashback ACTIVE with Max Refund Cap = 500.\n3. User places multiple transactions reaching the cap.',
    TestSteps: '1. Go to Admin > User Games Play > Transaction History.\n2. Identify transactions before cap exhaustion (should have tag).\n3. Identify transactions after cap exhaustion (should NOT have tag).\n4. Verify the transition.',
    ExpectedResult: 'Transactions within cap: "Cashback" tag shown.\nTransactions after cap exceeded: NO "Cashback" tag.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- TH-20: E2E — admin changes Min/Max, existing transactions unchanged ----
  {
    ID: 'TH-20', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Transaction History',
    Case: 'Verify existing transactions retain their tag when Admin updates Min/Max configuration',
    Subcase1: 'E2E state — Min/Max config changed after transactions are recorded',
    Subcase2: '',
    CaseType: 'E2E', Priority: 'Medium',
    Preconditions: '1. Admin is logged in.\n2. Transactions were recorded with original Min/Max config.\n3. Admin changes Min or Max value in configuration.',
    TestSteps: '1. Go to Admin > User Games Play > Transaction History.\n2. Check existing transaction tag status.\n3. Verify status is unchanged after config change.',
    ExpectedResult: 'Existing transactions retain their original tag status regardless of subsequent Min/Max config changes.',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
  // ---- TH-21: E2E — transaction before cashback, then cashback starts ----
  {
    ID: 'TH-21', ReqID: 'REQ-1', Platform: 'Admin',
    Page: 'User Games Play - Transaction History',
    Case: 'Verify transactions placed BEFORE cashback period starts do NOT get retroactive tag when cashback activates',
    Subcase1: 'E2E state — cashback period starts after transaction is placed',
    Subcase2: '',
    CaseType: 'E2E', Priority: 'High',
    Preconditions: '1. Admin is logged in.\n2. A transaction was placed before cashback start_date.\n3. Cashback then becomes active.',
    TestSteps: '1. Go to Admin > User Games Play > Transaction History.\n2. Locate the transaction placed before cashback start_date.\n3. Verify tag status after cashback has activated.',
    ExpectedResult: 'Transaction placed before cashback start_date: NO "Cashback" tag (NOT retroactive).',
    Status: '', ExecuteName: '', ExecuteDate: '',
  },
];

// ============================================================
// SHEET 1: OVERVIEW
// ============================================================
function buildOverviewSheet(wb) {
  const ws = wb.addWorksheet('S1 - Overview');

  // Column widths
  ws.getColumn(1).width = 30;
  ws.getColumn(2).width = 35;
  ws.getColumn(3).width = 20;

  // Row heights & content
  const setRow = (rowNum, height, cells) => {
    const row = ws.getRow(rowNum);
    row.height = height;
    cells.forEach(([col, val, bold, bg, fg, halign]) => {
      const c = row.getCell(col);
      c.value = val;
      c.font = { bold: !!bold, size: bold ? 13 : 10, color: { argb: fg || 'FF000000' } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg || 'FFFFFFFF' } };
      c.alignment = { wrapText: true, vertical: 'middle', horizontal: halign || 'left' };
      c.border = {
        top:    { style: 'thin', color: { argb: 'FFAAAAAA' } },
        left:   { style: 'thin', color: { argb: 'FFAAAAAA' } },
        bottom: { style: 'thin', color: { argb: 'FFAAAAAA' } },
        right:  { style: 'thin', color: { argb: 'FFAAAAAA' } },
      };
    });
    row.commit();
  };

  // Title block
  ws.mergeCells('A1:C1');
  const titleCell = ws.getCell('A1');
  titleCell.value = 'CASHBACK TAG — TEST CASE SUITE OVERVIEW';
  titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } };
  titleCell.alignment = { wrapText: false, vertical: 'middle', horizontal: 'center' };
  titleCell.border = {
    top:    { style: 'medium', color: { argb: 'FF000000' } },
    left:   { style: 'medium', color: { argb: 'FF000000' } },
    bottom: { style: 'medium', color: { argb: 'FF000000' } },
    right:  { style: 'medium', color: { argb: 'FF000000' } },
  };
  ws.getRow(1).height = 40;
  ws.getRow(1).commit();

  setRow(2, 8, []); // spacer

  setRow(3, 25, [
    [1, 'Requirement ID', true, 'FFD9E1F2', 'FF1F3864', 'left'],
    [2, 'REQ-1', false, 'FFFFFFFF', 'FF1F3864', 'left'],
    [3, '', false, 'FFFFFFFF', 'FF000000', 'left'],
  ]);
  setRow(4, 25, [
    [1, 'Feature', true, 'FFD9E1F2', 'FF1F3864', 'left'],
    [2, 'Display Cashback Tag in Bonus Column', false, 'FFFFFFFF', 'FF000000', 'left'],
    [3, '', false, 'FFFFFFFF', 'FF000000', 'left'],
  ]);
  setRow(5, 25, [
    [1, 'Platform', true, 'FFD9E1F2', 'FF1F3864', 'left'],
    [2, 'Admin > User Games Play', false, 'FFFFFFFF', 'FF000000', 'left'],
    [3, '', false, 'FFFFFFFF', 'FF000000', 'left'],
  ]);
  setRow(6, 25, [
    [1, 'Scope', true, 'FFD9E1F2', 'FF1F3864', 'left'],
    [2, 'Round History | Transaction History', false, 'FFFFFFFF', 'FF000000', 'left'],
    [3, '', false, 'FFFFFFFF', 'FF000000', 'left'],
  ]);
  setRow(7, 25, [
    [1, 'Total Test Cases', true, 'FFD9E1F2', 'FF1F3864', 'left'],
    [2, `${roundHistoryTC.length + transactionHistoryTC.length} (${roundHistoryTC.length} RH + ${transactionHistoryTC.length} TH)`, false, 'FFFFFFFF', 'FF000000', 'left'],
    [3, '', false, 'FFFFFFFF', 'FF000000', 'left'],
  ]);
  setRow(8, 25, [
    [1, 'Date Generated', true, 'FFD9E1F2', 'FF1F3864', 'left'],
    [2, new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), false, 'FFFFFFFF', 'FF000000', 'left'],
    [3, '', false, 'FFFFFFFF', 'FF000000', 'left'],
  ]);

  setRow(9, 8, []); // spacer

  // Summary table header
  setRow(10, 28, [
    [1, 'Page', true, 'FF1F3864', 'FFFFFFFF', 'center'],
    [2, 'Case Type', true, 'FF1F3864', 'FFFFFFFF', 'center'],
    [3, 'Count', true, 'FF1F3864', 'FFFFFFFF', 'center'],
  ]);

  // Summary data
  const ctSummary = (cases) => {
    const counts = {};
    cases.forEach(c => { counts[c.CaseType] = (counts[c.CaseType] || 0) + 1; });
    return counts;
  };
  const rhCT = ctSummary(roundHistoryTC);
  const thCT = ctSummary(transactionHistoryTC);

  const summaryRows = [
    ['Round History', 'Positive', rhCT['Positive'] || 0],
    ['Round History', 'Negative', rhCT['Negative'] || 0],
    ['Round History', 'Boundary', rhCT['Boundary'] || 0],
    ['Round History', 'E2E', rhCT['E2E'] || 0],
    ['Transaction History', 'Positive', thCT['Positive'] || 0],
    ['Transaction History', 'Negative', thCT['Negative'] || 0],
    ['Transaction History', 'Boundary', thCT['Boundary'] || 0],
    ['Transaction History', 'E2E', thCT['E2E'] || 0],
  ];

  summaryRows.forEach((r, i) => {
    const bg = i % 2 === 0 ? 'FFF0F4FA' : 'FFFFFFFF';
    setRow(11 + i, 22, [
      [1, r[0], false, bg, 'FF000000', 'left'],
      [2, r[1], false, bg, 'FF000000', 'left'],
      [3, r[2], false, bg, 'FF000000', 'center'],
    ]);
  });

  setRow(20, 8, []); // spacer

  // Priority summary
  setRow(21, 28, [
    [1, 'Priority', true, 'FF1F3864', 'FFFFFFFF', 'center'],
    [2, 'Round History', true, 'FF1F3864', 'FFFFFFFF', 'center'],
    [3, 'Transaction History', true, 'FF1F3864', 'FFFFFFFF', 'center'],
  ]);
  const priSummary = (cases) => {
    const counts = {};
    cases.forEach(c => { counts[c.Priority] = (counts[c.Priority] || 0) + 1; });
    return counts;
  };
  const rhPri = priSummary(roundHistoryTC);
  const thPri = priSummary(transactionHistoryTC);
  const priRows = [
    ['High', rhPri['High'] || 0, thPri['High'] || 0],
    ['Medium', rhPri['Medium'] || 0, thPri['Medium'] || 0],
    ['Low', rhPri['Low'] || 0, thPri['Low'] || 0],
  ];
  priRows.forEach((r, i) => {
    const bg = i % 2 === 0 ? 'FFF0F4FA' : 'FFFFFFFF';
    setRow(22 + i, 22, [
      [1, r[0], false, bg, 'FF000000', 'center'],
      [2, r[1], false, bg, 'FF000000', 'center'],
      [3, r[2], false, bg, 'FF000000', 'center'],
    ]);
  });

  // Freeze
  ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
  return ws;
}

// ============================================================
// SHEET 2: REQUIREMENT COVERAGE MATRIX
// ============================================================
function buildMatrixSheet(wb) {
  const ws = wb.addWorksheet('S2 - Req Coverage Matrix');

  ws.getColumn(1).width = 18;
  ws.getColumn(2).width = 55;
  ws.getColumn(3).width = 12;
  ws.getColumn(4).width = 12;
  ws.getColumn(5).width = 12;
  ws.getColumn(6).width = 12;

  const hRow = (rowNum, cells) => {
    const row = ws.getRow(rowNum);
    row.height = 30;
    cells.forEach(([col, val, bg, fg, bold]) => {
      const c = row.getCell(col);
      c.value = val;
      c.font = { bold: !!bold, size: 10, color: { argb: fg || 'FFFFFFFF' } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      c.alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };
      c.border = {
        top:    { style: 'thin', color: { argb: 'FF888888' } },
        left:   { style: 'thin', color: { argb: 'FF888888' } },
        bottom: { style: 'thin', color: { argb: 'FF888888' } },
        right:  { style: 'thin', color: { argb: 'FF888888' } },
      };
    });
    row.commit();
  };

  hRow(1, [
    [1, 'REQ ID', 'FF1F3864', 'FFFFFFFF', true],
    [2, 'Requirement / Acceptance Criteria', 'FF1F3864', 'FFFFFFFF', true],
    [3, 'RH TC', 'FF1F3864', 'FFFFFFFF', true],
    [4, 'TH TC', 'FF1F3864', 'FFFFFFFF', true],
    [5, 'Total TC', 'FF1F3864', 'FFFFFFFF', true],
    [6, 'Covered', 'FF1F3864', 'FFFFFFFF', true],
  ]);

  const matrix = [
    ['REQ-1', 'Tag displayed for bets meeting all 6 eligibility conditions'],
    ['REQ-1-C1', 'Condition 1: User is enrolled in cashback'],
    ['REQ-1-C2', 'Condition 2: Cashback is within valid date range'],
    ['REQ-1-C3', 'Condition 3: Bet amount within Min <= bet <= Max'],
    ['REQ-1-C4', 'Condition 4: Max Refund Cap not exceeded'],
    ['REQ-1-C5', 'Condition 5: Cashback status = Active'],
    ['REQ-1-C6', 'Condition 6: Game is in cashback-eligible list'],
    ['REQ-1-AC1', 'AC1: Cashback tag in Round History when cashback is active'],
    ['REQ-1-AC2', 'AC2: Cashback tag in Transaction History (matching Round History)'],
    ['REQ-1-AC3', 'AC3: NO tag when bet placed before/after cashback period'],
    ['REQ-1-AC4', 'AC4: NO tag for pre-release historical bets'],
    ['REQ-1-DI', 'Data Integrity: Tag consistency between Round History and Transaction History'],
    ['REQ-1-E2E-1', 'E2E: Cashback enrolled mid-session — tag for post-enrollment bets only'],
    ['REQ-1-E2E-2', 'E2E: Cashback expires mid-session — correct transition'],
    ['REQ-1-E2E-3', 'E2E: Cashback reactivated — tag for post-reactivation bets only'],
    ['REQ-1-E2E-4', 'E2E: Bet placed before cashback, cashback starts — no retroactive tag'],
    ['REQ-1-E2E-5', 'E2E: User cancels enrollment — existing tags unchanged, new bets no tag'],
    ['REQ-1-E2E-6', 'E2E: Max Refund Cap exhausted mid-session — correct transition'],
    ['REQ-1-E2E-7', 'E2E: Admin changes Min/Max config — existing bets retain tags'],
  ];

  // Map which TC IDs cover each row
  const rhIds = new Set(roundHistoryTC.map(t => t.ID));
  const thIds = new Set(transactionHistoryTC.map(t => t.ID));

  // Simple coverage: each matrix row is broadly covered
  const coverageMap = {
    'REQ-1':             { rh: 21, th: 21 },
    'REQ-1-C1':          { rh: 1, th: 1 },
    'REQ-1-C2':          { rh: 1, th: 1 },
    'REQ-1-C3':          { rh: 4, th: 4 },
    'REQ-1-C4':          { rh: 1, th: 1 },
    'REQ-1-C5':          { rh: 1, th: 1 },
    'REQ-1-C6':          { rh: 1, th: 1 },
    'REQ-1-AC1':         { rh: 1, th: 0 },
    'REQ-1-AC2':         { rh: 0, th: 1 },
    'REQ-1-AC3':         { rh: 1, th: 1 },
    'REQ-1-AC4':         { rh: 1, th: 1 },
    'REQ-1-DI':          { rh: 1, th: 1 },
    'REQ-1-E2E-1':       { rh: 1, th: 1 },
    'REQ-1-E2E-2':       { rh: 1, th: 1 },
    'REQ-1-E2E-3':       { rh: 1, th: 1 },
    'REQ-1-E2E-4':       { rh: 1, th: 1 },
    'REQ-1-E2E-5':       { rh: 1, th: 1 },
    'REQ-1-E2E-6':       { rh: 1, th: 1 },
    'REQ-1-E2E-7':       { rh: 1, th: 1 },
  };

  matrix.forEach((row, idx) => {
    const bg = idx % 2 === 0 ? 'FFF0F4FA' : 'FFFFFFFF';
    const cov = coverageMap[row[0]] || { rh: 0, th: 0 };
    const total = cov.rh + cov.th;
    const rhCell = ws.getRow(idx + 2).getCell(3);
    const rowCells = [
      [1, row[0], bg, 'FF2E75B6', true],
      [2, row[1], bg, 'FF000000', false],
      [3, cov.rh > 0 ? cov.rh : '-', bg, 'FF000000', false],
      [4, cov.th > 0 ? cov.th : '-', bg, 'FF000000', false],
      [5, total > 0 ? total : '-', bg, 'FF000000', false],
      [6, total > 0 ? 'Yes' : 'No', total > 0 ? 'FFE2EFDA' : 'FFFCE4D6',
       total > 0 ? 'FF375623' : 'FF9C0006', true],
    ];
    const rowObj = ws.getRow(idx + 2);
    rowObj.height = 28;
    rowCells.forEach(([col, val, bgC, fg, bold]) => {
      const c = rowObj.getCell(col);
      c.value = val;
      c.font = { bold: !!bold, size: 10, color: { argb: fg } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgC } };
      c.alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };
      c.border = {
        top:    { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left:   { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right:  { style: 'thin', color: { argb: 'FFCCCCCC' } },
      };
    });
    rowObj.commit();
  });

  ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 6 } };
  return ws;
}

// ============================================================
// SHEET 3: TEST CASES (combined)
// ============================================================
function buildTestCaseSheet(wb) {
  const ws = wb.addWorksheet('S3 - Test Cases');

  ws.columns = COLS;
  applyHeaderRow(ws);

  // RH section header
  const rhHeader = ws.addRow({
    ID: '', ReqID: '', Platform: '',
    Page: '=== ROUND HISTORY (21 Test Cases) ===',
    Case: '', Subcase1: '', Subcase2: '',
    CaseType: '', Priority: '',
    Preconditions: '', TestSteps: '', ExpectedResult: '',
    Status: '', ExecuteName: '', ExecuteDate: '',
  });
  const rhHeaderRowNum = 2;
  ws.getRow(rhHeaderRowNum).eachCell((cell) => {
    cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } };
    cell.alignment = { wrapText: false, vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top:    { style: 'medium', color: { argb: 'FF1F3864' } },
      left:   { style: 'medium', color: { argb: 'FF1F3864' } },
      bottom: { style: 'medium', color: { argb: 'FF1F3864' } },
      right:  { style: 'medium', color: { argb: 'FF1F3864' } },
    };
  });
  ws.getRow(rhHeaderRowNum).height = 22;
  ws.getRow(rhHeaderRowNum).commit();

  roundHistoryTC.forEach((tc, idx) => {
    const row = ws.addRow(tc);
    const rowNum = idx + 3; // +3 because row 1=header, row 2=section header
    ws.getRow(rowNum).height = 85;
    ws.getRow(rowNum).eachCell((cell) => {
      const key = COLS[cell.col - 1] ? COLS[cell.col - 1].key : cell.key;
      styleDataCell(cell, key, tc, idx);
    });
    ws.getRow(rowNum).commit();
  });

  // TH section header
  const thStartRow = roundHistoryTC.length + 3;
  const thHeader = ws.addRow({
    ID: '', ReqID: '', Platform: '',
    Page: '=== TRANSACTION HISTORY (21 Test Cases) ===',
    Case: '', Subcase1: '', Subcase2: '',
    CaseType: '', Priority: '',
    Preconditions: '', TestSteps: '', ExpectedResult: '',
    Status: '', ExecuteName: '', ExecuteDate: '',
  });
  ws.getRow(thStartRow).eachCell((cell) => {
    cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } };
    cell.alignment = { wrapText: false, vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top:    { style: 'medium', color: { argb: 'FF1F3864' } },
      left:   { style: 'medium', color: { argb: 'FF1F3864' } },
      bottom: { style: 'medium', color: { argb: 'FF1F3864' } },
      right:  { style: 'medium', color: { argb: 'FF1F3864' } },
    };
  });
  ws.getRow(thStartRow).height = 22;
  ws.getRow(thStartRow).commit();

  transactionHistoryTC.forEach((tc, idx) => {
    const row = ws.addRow(tc);
    const rowNum = thStartRow + 1 + idx;
    ws.getRow(rowNum).height = 85;
    ws.getRow(rowNum).eachCell((cell) => {
      const key = COLS[cell.col - 1] ? COLS[cell.col - 1].key : cell.key;
      styleDataCell(cell, key, tc, idx);
    });
    ws.getRow(rowNum).commit();
  });

  configureSheet(ws, 1, 1); // freeze col A and row 1
  return ws;
}

// ============================================================
// SHEET 4: EXECUTION NOTES
// ============================================================
function buildNotesSheet(wb) {
  const ws = wb.addWorksheet('S4 - QC Execution Notes');

  ws.getColumn(1).width = 22;
  ws.getColumn(2).width = 72;

  const hCell = (row, col, val, bg, fg) => {
    const c = row.getCell(col);
    c.value = val;
    c.font = { bold: true, size: 10, color: { argb: fg || 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    c.alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };
    c.border = {
      top:    { style: 'thin', color: { argb: 'FF888888' } },
      left:   { style: 'thin', color: { argb: 'FF888888' } },
      bottom: { style: 'thin', color: { argb: 'FF888888' } },
      right:  { style: 'thin', color: { argb: 'FF888888' } },
    };
  };

  const dCell = (row, col, val, bg, fg, bold) => {
    const c = row.getCell(col);
    c.value = val;
    c.font = { bold: !!bold, size: 10, color: { argb: fg || 'FF000000' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    c.alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
    c.border = {
      top:    { style: 'thin', color: { argb: 'FFCCCCCC' } },
      left:   { style: 'thin', color: { argb: 'FFCCCCCC' } },
      bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      right:  { style: 'thin', color: { argb: 'FFCCCCCC' } },
    };
  };

  // Title
  ws.mergeCells('A1:B1');
  const title = ws.getRow(1);
  title.height = 36;
  const tc = title.getCell(1);
  tc.value = 'QC EXECUTION NOTES — CASHBACK TAG BONUS COLUMN';
  tc.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  tc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } };
  tc.alignment = { wrapText: false, vertical: 'middle', horizontal: 'center' };
  tc.border = {
    top:    { style: 'medium', color: { argb: 'FF000000' } },
    left:   { style: 'medium', color: { argb: 'FF000000' } },
    bottom: { style: 'medium', color: { argb: 'FF000000' } },
    right:  { style: 'medium', color: { argb: 'FF000000' } },
  };
  title.commit();

  const notes = [
    {
      section: 'GENERAL',
      items: [
        ['Purpose', 'This document provides guidance for QC engineers executing test cases in Sheet S3 (Test Cases).'],
        ['Scope', 'Displaying the "Cashback" tag in the Bonus column within Admin > User Games Play for both Round History and Transaction History pages.'],
        ['Assumption', 'Admin panel access with sufficient privileges to configure cashback settings and view user game history.'],
        ['Test Data', 'Test data (users, bet amounts, game types) must be prepared in the staging/test environment before test execution begins.'],
        ['Pre-test Setup', '1. Configure a cashback program in Admin with known Min/Max values.\n2. Enroll at least one test user.\n3. Ensure at least one game is in the eligible list.\n4. Note the Max Refund Cap value.'],
      ],
    },
    {
      section: 'ELIGIBILITY CONDITIONS (6 conditions — ALL must be true for tag to appear)',
      items: [
        ['C1', 'User is enrolled/participating in the cashback program.'],
        ['C2', 'Cashback is within its configured valid date range (start_date <= today <= end_date).'],
        ['C3', 'Bet amount satisfies: Min <= bet_amount <= Max (inclusive on both ends).'],
        ['C4', 'The calculated cashback (% of bet) does not exceed the Max Refund Cap.'],
        ['C5', 'Cashback configuration status = Active (not Inactive/Suspended).'],
        ['C6', 'The game played is in the cashback-eligible game list configured in Admin.'],
        ['Important', 'ALL 6 conditions must be true simultaneously. Failing any one condition means NO "Cashback" tag.'],
      ],
    },
    {
      section: 'ACCEPTANCE CRITERIA SUMMARY',
      items: [
        ['AC1', 'Round History: qualifying bets display "Cashback" tag in Bonus column.'],
        ['AC2', 'Transaction History: same qualifying bets display "Cashback" tag in Bonus column (matching RH).'],
        ['AC3', 'Bets placed before cashback starts OR after it ends show NO "Cashback" tag.'],
        ['AC4', 'Pre-release historical bets do NOT display "Cashback" tag (feature not yet available).'],
      ],
    },
    {
      section: 'CASE TYPE LEGEND',
      items: [
        ['Positive', 'Valid inputs meeting all conditions — expected behavior confirmed.'],
        ['Negative', 'One or more conditions fail — expected: NO tag displayed.'],
        ['Boundary', 'Data at Min/Max edges — tests inclusive/exclusive range logic.'],
        ['E2E', 'End-to-end state transitions — multi-step scenarios across time or config changes.'],
      ],
    },
    {
      section: 'PRIORITY GUIDE',
      items: [
        ['High', 'Must pass before release. Core business logic, high bug risk if missed.'],
        ['Medium', 'Should pass. Important feature coverage, moderate impact if failed.'],
        ['Low', 'Nice to have. UI/text validation, cosmetic issues.'],
      ],
    },
    {
      section: 'STATUS VALUES',
      items: [
        ['Pass', 'Test executed successfully — actual result matches Expected Result.'],
        ['Fail', 'Test executed — actual result does NOT match Expected Result. Log defect.'],
        ['Blocked', 'Cannot execute due to dependency failure (e.g., environment issue).'],
        ['Pending', 'Not yet executed.'],
      ],
    },
    {
      section: 'EXECUTION TIPS',
      items: [
        ['State transitions', 'For E2E cases (RH-02, RH-11, RH-12, RH-18, RH-19, RH-20, RH-21 and TH counterparts), coordinate with Admin to change cashback status/date at the right time.'],
        ['Boundary values', 'For Min/Max boundary cases, verify with at least 2 decimal precision if applicable.'],
        ['Retroactivity check', 'For AC3/AC4 cases, verify that tags are NOT applied retroactively to existing bets.'],
        ['Cross-view verification', 'Always compare Round History and Transaction History simultaneously for the same bet ID to verify data consistency (TC-16 in each page).'],
        ['Tag text', 'Verify exact text "Cashback" — case-sensitive. No extra spaces or characters.'],
        ['Pre-release data', 'If historical data from before release is not available, coordinate with backend to simulate via DB query or test data setup.'],
      ],
    },
    {
      section: 'DEFECT REPORTING',
      items: [
        ['Fields', 'Defect ID, Test Case ID (e.g., RH-05), Page, Steps to Reproduce, Expected Result, Actual Result, Severity, Priority, Screenshot/Video.'],
        ['Severity Scale', 'Sev-1: Tag missing for qualifying bet (core broken).\nSev-2: Tag showing for non-qualifying bet (data integrity broken).\nSev-3: UI display issue (text wrong, formatting).\nSev-4: Minor cosmetic issue.'],
      ],
    },
    {
      section: 'REGRESSION CRITERIA',
      items: [
        ['When to regress', 'After any code change to cashback configuration, tagging logic, or Admin UI rendering.'],
        ['Key cases', 'RH-01, RH-03, RH-05, RH-06, RH-08, RH-10, RH-13, RH-14, RH-16, TH-01, TH-03, TH-16 (highest value regression candidates).'],
      ],
    },
  ];

  let currentRow = 2;
  notes.forEach(({ section, items }) => {
    // Section header
    const sRow = ws.getRow(currentRow);
    sRow.height = 26;
    ws.mergeCells(`A${currentRow}:B${currentRow}`);
    const sc = sRow.getCell(1);
    sc.value = section;
    sc.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    sc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E75B6' } };
    sc.alignment = { wrapText: false, vertical: 'middle', horizontal: 'left' };
    sc.border = {
      top:    { style: 'thin', color: { argb: 'FF888888' } },
      left:   { style: 'thin', color: { argb: 'FF888888' } },
      bottom: { style: 'thin', color: { argb: 'FF888888' } },
      right:  { style: 'thin', color: { argb: 'FF888888' } },
    };
    sRow.commit();
    currentRow++;

    items.forEach(([label, content], idx) => {
      const bg = idx % 2 === 0 ? 'FFF0F4FA' : 'FFFFFFFF';
      const iRow = ws.getRow(currentRow);
      iRow.height = content.split('\n').length * 18 + 10;
      hCell(iRow, 1, label, 'FFD9E1F2', 'FF1F3864');
      dCell(iRow, 2, content, bg, 'FF000000', false);
      iRow.commit();
      currentRow++;
    });

    // Spacer
    const spRow = ws.getRow(currentRow);
    spRow.height = 6;
    spRow.commit();
    currentRow++;
  });

  ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 2 }];
  return ws;
}

const fs = require('fs');

// ============================================================
// ASSEMBLE AND SAVE
// ============================================================
function generateMarkdownSummary(rhTC, thTC) {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const totalTC = rhTC.length + thTC.length;

  // Coverage mapping
  const coverageMap = {
    'REQ-1':             { desc: 'All 6 eligibility conditions met', rh: 21, th: 21 },
    'REQ-1-C1':          { desc: 'Condition 1: User enrolled in cashback', rh: 1, th: 1 },
    'REQ-1-C2':          { desc: 'Condition 2: Cashback within valid date range', rh: 1, th: 1 },
    'REQ-1-C3':          { desc: 'Condition 3: Bet within Min <= bet <= Max', rh: 4, th: 4 },
    'REQ-1-C4':          { desc: 'Condition 4: Max Refund Cap not exceeded', rh: 1, th: 1 },
    'REQ-1-C5':          { desc: 'Condition 5: Cashback status = Active', rh: 1, th: 1 },
    'REQ-1-C6':          { desc: 'Condition 6: Game in eligible list', rh: 1, th: 1 },
    'REQ-1-AC1':         { desc: 'AC1: Tag in Round History when cashback active', rh: 1, th: 0 },
    'REQ-1-AC2':         { desc: 'AC2: Tag in Transaction History (matching RH)', rh: 0, th: 1 },
    'REQ-1-AC3':         { desc: 'AC3: NO tag before/after cashback period', rh: 1, th: 1 },
    'REQ-1-AC4':         { desc: 'AC4: NO tag for pre-release historical bets', rh: 1, th: 1 },
    'REQ-1-DI':          { desc: 'Data Integrity: Tag consistency RH vs TH', rh: 1, th: 1 },
    'REQ-1-E2E-1':       { desc: 'E2E: Enrollment mid-session — post-enrollment bets only', rh: 1, th: 1 },
    'REQ-1-E2E-2':       { desc: 'E2E: Cashback expires mid-session', rh: 1, th: 1 },
    'REQ-1-E2E-3':       { desc: 'E2E: Cashback reactivated', rh: 1, th: 1 },
    'REQ-1-E2E-4':       { desc: 'E2E: Bet before cashback starts — no retroactive tag', rh: 1, th: 1 },
    'REQ-1-E2E-5':       { desc: 'E2E: User cancels enrollment — existing tags unchanged', rh: 1, th: 1 },
    'REQ-1-E2E-6':       { desc: 'E2E: Max Refund Cap exhausted mid-session', rh: 1, th: 1 },
    'REQ-1-E2E-7':       { desc: 'E2E: Admin changes Min/Max config — existing bets unchanged', rh: 1, th: 1 },
  };

  const ctSummary = (cases) => {
    const counts = {};
    cases.forEach(c => { counts[c.CaseType] = (counts[c.CaseType] || 0) + 1; });
    return counts;
  };
  const priSummary = (cases) => {
    const counts = {};
    cases.forEach(c => { counts[c.Priority] = (counts[c.Priority] || 0) + 1; });
    return counts;
  };

  const rhCT = ctSummary(rhTC);
  const thCT = ctSummary(thTC);
  const rhPri = priSummary(rhTC);
  const thPri = priSummary(thTC);

  // All case types in order
  const allCT = ['Positive', 'Negative', 'Boundary', 'E2E', 'Exception', 'Permission', 'Security'];

  const md = [];
  md.push(`# Test Case Summary — Cashback Tag Bonus Column\n`);
  md.push(`| **Requirement ID** | REQ-1 |`);
  md.push(`|---|---|`);
  md.push(`| **Feature** | Display Cashback Tag in Bonus Column |`);
  md.push(`| **Platform** | Admin > User Games Play |`);
  md.push(`| **Scope** | Round History, Transaction History |`);
  md.push(`| **Date Generated** | ${today} |`);
  md.push(`| **Total Test Cases** | ${totalTC} (${rhTC.length} RH + ${thTC.length} TH) |`);
  md.push(`\n---\n`);
  md.push(`## 1. REQ Coverage Matrix\n`);
  md.push(`| REQ ID | Description | RH TC | TH TC | Total | Covered |`);
  md.push(`|---|---|---|---|---|---|`);
  Object.entries(coverageMap).forEach(([id, v]) => {
    const total = v.rh + v.th;
    md.push(`| ${id} | ${v.desc} | ${v.rh || '-'} | ${v.th || '-'} | ${total || '-'} | ${total > 0 ? 'Yes' : 'No'} |`);
  });
  md.push(`\n---\n`);
  md.push(`## 2. Case Type Distribution\n`);
  md.push(`| Case Type | Round History | Transaction History | Total |`);
  md.push(`|---|---|---|---|`);
  allCT.forEach(ct => {
    const rh = rhCT[ct] || 0;
    const th = thCT[ct] || 0;
    if (rh > 0 || th > 0) md.push(`| ${ct} | ${rh} | ${th} | ${rh + th} |`);
  });
  md.push(`\n---\n`);
  md.push(`## 3. Priority Distribution\n`);
  md.push(`| Priority | Round History | Transaction History | Total |`);
  md.push(`|---|---|---|---|`);
  ['High', 'Medium', 'Low'].forEach(p => {
    const rh = rhPri[p] || 0;
    const th = thPri[p] || 0;
    if (rh > 0 || th > 0) md.push(`| ${p} | ${rh} | ${th} | ${rh + th} |`);
  });
  md.push(`\n---\n`);
  md.push(`## 4. Test Case ID List\n`);
  md.push(`| ID | Page | Case Type | Priority | Sub-case 1 |`);
  md.push(`|---|---|---|---|---|`);

  rhTC.forEach(tc => {
    md.push(`| ${tc.ID} | ${tc.Page} | ${tc.CaseType} | ${tc.Priority} | ${tc.Subcase1} |`);
  });
  thTC.forEach(tc => {
    md.push(`| ${tc.ID} | ${tc.Page} | ${tc.CaseType} | ${tc.Priority} | ${tc.Subcase1} |`);
  });

  md.push(`\n---\n`);
  md.push(`## 5. Key Coverage Notes\n`);
  md.push(`- **Positive cases** verify that the "Cashback" tag appears when ALL 6 eligibility conditions are met.\n`);
  md.push(`- **Negative cases** verify that the tag does NOT appear when any single condition fails.\n`);
  md.push(`- **Boundary cases** verify Min/Max bet range logic (inclusive on both ends).\n`);
  md.push(`- **E2E cases** verify state transitions across time and configuration changes:\n`);
  md.push(`  - Enrollment mid-session, expiry mid-session, reactivation, cancellation.\n`);
  md.push(`  - Bet placed before cashback starts — tag is NOT applied retroactively.\n`);
  md.push(`  - Max Refund Cap exhaustion during a sequence of bets.\n`);
  md.push(`  - Admin config changes (Min/Max) do not affect already-placed bets.\n`);
  md.push(`- **Data integrity**: Tag consistency between Round History and Transaction History is verified for every qualifying/non-qualifying bet.\n`);
  md.push(`- **UI validation**: Tag text is verified to be exactly "Cashback" (case-sensitive).\n`);
  md.push(`- **Regression candidates** (High priority): RH-01, RH-03, RH-05, RH-06, RH-08, RH-10, RH-13, RH-14, RH-16, TH-01, TH-03, TH-16.\n`);

  return md.join('\n');
}

function main() {
  buildOverviewSheet(wb);
  buildMatrixSheet(wb);
  buildTestCaseSheet(wb);
  buildNotesSheet(wb);

  // Tab colors
  wb.worksheets[0].properties.tabColor = { argb: 'FF1F3864' };
  wb.worksheets[1].properties.tabColor = { argb: 'FF2E75B6' };
  wb.worksheets[2].properties.tabColor = { argb: 'FF375623' };
  wb.worksheets[3].properties.tabColor = { argb: 'FF5C2D91' };

  const outputDir = path.join(__dirname, 'output', 'Admin', 'User Games Play');
  const xlsxPath = path.join(outputDir, 'testcase.xlsx');
  const mdPath   = path.join(outputDir, 'testcase-summary.md');

  wb.xlsx
    .writeFile(xlsxPath)
    .then(() => {
      console.log(`Saved: ${xlsxPath}`);
      const mdContent = generateMarkdownSummary(roundHistoryTC, transactionHistoryTC);
      fs.writeFileSync(mdPath, mdContent, 'utf8');
      console.log(`Saved: ${mdPath}`);
      console.log(`Total test cases: ${roundHistoryTC.length + transactionHistoryTC.length} (${roundHistoryTC.length} RH + ${transactionHistoryTC.length} TH)`);
    })
    .catch((err) => {
      console.error('Error:', err);
      process.exit(1);
    });
}

main();
