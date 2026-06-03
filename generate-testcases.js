/**
 * Test Case Generator Module
 * Generates Excel (5 sheets) + Markdown summary for test cases.
 * All content is in ENGLISH as per the testing prompt requirements.
 */

const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// ============================================================
// COLOR PALETTE
// ============================================================
const C = {
  // Case Type
  CT_POSITIVE_BG: 'E2EFDA', CT_POSITIVE_FG: '375623',
  CT_NEGATIVE_BG: 'FCE4D6', CT_NEGATIVE_FG: '9C0006',
  CT_BOUNDARY_BG: 'FFF2CC', CT_BOUNDARY_FG: '7F6000',
  CT_E2E_BG: 'E2E8F0', CT_E2E_FG: '1E3A5F',
  CT_EXCEPTION_BG: 'EDEDED', CT_EXCEPTION_FG: '404040',
  CT_SECURITY_BG: 'FFE6FF', CT_SECURITY_FG: '7030A0',
  CT_PERMISSION_BG: 'FCE4D6', CT_PERMISSION_FG: '9C0006',

  // Priority
  P_HIGH_BG: 'FFE0CC', P_HIGH_FG: 'C55A11',
  P_MEDIUM_BG: 'DDEBF7', P_MEDIUM_FG: '2E75B6',
  P_LOW_BG: 'F2F2F2', P_LOW_FG: '595959',

  // Status
  S_PASS_BG: 'C6EFCE', S_PASS_FG: '276221',
  S_FAIL_BG: 'FFC7CE', S_FAIL_FG: '9C0006',
  S_BLOCKED_BG: 'FFE699', S_BLOCKED_FG: '7F6000',
  S_PENDING_BG: 'F2F2F2', S_PENDING_FG: '595959',

  // Column colors
  REQ_ID_BG: 'BDD7EE', REQ_ID_FG: '1F3864',
  TC_ID_BG: '1F3864', TC_ID_FG: 'FFFFFF',
  PRECOND_BG: 'F2F7F9',
  PAGE_BG: 'F8F9FA',
  EXPECTED_BG: 'FCE4D6', EXPECTED_FG: '9C0006',
  ALT_ROW_BG: 'F8F9FA',

  // Sheet tab colors — based on sheet nature
  // S1: Overview/Summary = navy (neutral summary)
  // S2: Matrix/Traceability = xanh dương (tracking/coverage)
  // S3: Testcase = xanh dương (execution list)
  // S4: QC/Execute = tím (quality control)
  // S5: Keyword = cam (reference/guide)
  S1_TAB: '1F3864', S2_TAB: '2E75B6', S3_TAB: '2E75B6', S4_TAB: '5C2D91', S5_TAB: 'C55A11',

  // Banner / section
  NAVY: '1F3864', BLUE: '2E75B6', GREEN: '375623', PURPLE: '5C2D91', ORANGE: 'C55A11',

  // Matrix section groups
  MG_BLUE: '2E75B6', MG_GREEN: '375623', MG_NAVY: '1E3A5F', MG_PURPLE: '5C2D91',
  YES_BG: 'C6EFCE', YES_FG: '276221',
  NO_BG: 'FFC7CE', NO_FG: '9C0006',

  WHITE: 'FFFFFF', BLACK: '000000',
};

// ============================================================
// HELPERS
// ============================================================
const boldCenter = { bold: true, align: 'center', valign: 'middle' };
const boldLeft = { bold: true, align: 'left', valign: 'middle' };
const centerMiddle = { align: 'center', valign: 'middle' };
const leftMiddle = { align: 'left', valign: 'middle' };
const wrapLeftMiddle = { align: 'left', valign: 'middle', wrapText: true };
const wrapBoldCenter = { bold: true, align: 'center', valign: 'middle', wrapText: true };
const wrapLeftBold = { bold: true, align: 'left', valign: 'middle', wrapText: true };
const wrapCenterBold = { bold: true, align: 'center', valign: 'middle', wrapText: true };

function fill(hex) { return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + hex } }; }
function font(hex, bold = true) { return { color: { argb: 'FF' + hex }, bold }; }
function fontBold(hex) { return { color: { argb: 'FF' + hex }, bold: true }; }

const BORDER_COLOR = '595959';
const thinBorder = {
  top: { style: 'thin', color: { argb: 'FF' + BORDER_COLOR } },
  bottom: { style: 'thin', color: { argb: 'FF' + BORDER_COLOR } },
  left: { style: 'thin', color: { argb: 'FF' + BORDER_COLOR } },
  right: { style: 'thin', color: { argb: 'FF' + BORDER_COLOR } },
};

function applyCellStyle(cell, bg, fg, bold = true, align = 'left', wrap = true) {
  if (bg) cell.fill = fill(bg);
  if (fg) cell.font = font(fg, bold);
  cell.alignment = { horizontal: align, vertical: 'middle', wrapText: wrap };
  cell.border = thinBorder;
}

function caseTypeStyle(type) {
  switch (type) {
    case 'Positive':   return { bg: C.CT_POSITIVE_BG, fg: C.CT_POSITIVE_FG };
    case 'Negative':    return { bg: C.CT_NEGATIVE_BG, fg: C.CT_NEGATIVE_FG };
    case 'Boundary':    return { bg: C.CT_BOUNDARY_BG, fg: C.CT_BOUNDARY_FG };
    case 'E2E':        return { bg: C.CT_E2E_BG, fg: C.CT_E2E_FG };
    case 'Exception':  return { bg: C.CT_EXCEPTION_BG, fg: C.CT_EXCEPTION_FG };
    case 'Security':    return { bg: C.CT_SECURITY_BG, fg: C.CT_SECURITY_FG };
    case 'Permission':  return { bg: C.CT_PERMISSION_BG, fg: C.CT_PERMISSION_FG };
    default:            return { bg: C.WHITE, fg: C.BLACK };
  }
}

function priorityStyle(priority) {
  switch (priority) {
    case 'High':   return { bg: C.P_HIGH_BG, fg: C.P_HIGH_FG };
    case 'Medium': return { bg: C.P_MEDIUM_BG, fg: C.P_MEDIUM_FG };
    case 'Low':    return { bg: C.P_LOW_BG, fg: C.P_LOW_FG };
    default:       return { bg: C.WHITE, fg: C.BLACK };
  }
}

function statusStyle(status) {
  switch (status) {
    case 'Pass':    return { bg: C.S_PASS_BG, fg: C.S_PASS_FG };
    case 'Fail':    return { bg: C.S_FAIL_BG, fg: C.S_FAIL_FG };
    case 'Blocked': return { bg: C.S_BLOCKED_BG, fg: C.S_BLOCKED_FG };
    case 'Pending': return { bg: C.S_PENDING_BG, fg: C.S_PENDING_FG };
    default:        return { bg: C.WHITE, fg: C.BLACK };
  }
}

function setBanner(ws, row, colStart, colEnd, text, bgColor, fgColor = C.WHITE, fontSize = 14) {
  const cell = ws.getCell(row, colStart);
  cell.value = text;
  cell.fill = fill(bgColor);
  cell.font = { bold: true, color: { argb: 'FF' + fgColor }, size: fontSize };
  cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  cell.border = thinBorder;
  if (colEnd > colStart) {
    ws.mergeCells(row, colStart, row, colEnd);
  }
}

function setSectionHeader(ws, row, colStart, colEnd, text, bgColor, fgColor = C.WHITE) {
  setBanner(ws, row, colStart, colEnd, text, bgColor, fgColor, 12);
}

function calcRowHeight(values) {
  const maxLines = values
    .filter(v => v)
    .reduce((max, v) => {
      const lines = (String(v).match(/\n/g) || []).length + 1;
      return Math.max(max, lines);
    }, 1);
  return Math.min(Math.max(maxLines * 15 + 10, 60), 180);
}

function setCell(ws, row, col, value, bg, fg, bold = true, align = 'left') {
  const cell = ws.getCell(row, col);
  cell.value = value || '';
  applyCellStyle(cell, bg, fg, bold, align);
  return cell;
}

function setCellMerge(ws, row, colStart, colEnd, value, bg, fg, bold = true, align = 'left') {
  const cell = ws.getCell(row, colStart);
  cell.value = value || '';
  applyCellStyle(cell, bg, fg, bold, align);
  if (colEnd > colStart) ws.mergeCells(row, colStart, row, colEnd);
  return cell;
}

function formatDate(d) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

// ============================================================
// SHEET 1 — OVERVIEW
// ============================================================
function buildSheet1(ws, reqInfo, allTestCases, coverageMap) {
  ws.views = [{ state: 'normal', topLeftCell: 'A1', activeTab: 0 }];
  ws.properties.tabColor = C.S1_TAB;

  const today = formatDate(new Date());
  const totalTC = allTestCases.length;
  const rhCount = allTestCases.filter(t => t.Page.includes('Round History')).length;
  const thCount = allTestCases.filter(t => t.Page.includes('Transaction History')).length;

  // Count by case type
  const ctCounts = {};
  allTestCases.forEach(tc => {
    ctCounts[tc.CaseType] = (ctCounts[tc.CaseType] || 0) + 1;
  });
  const pCounts = {};
  allTestCases.forEach(tc => {
    pCounts[tc.Priority] = (pCounts[tc.Priority] || 0) + 1;
  });

  // Banner row 1
  ws.getRow(1).height = 44;
  setBanner(ws, 1, 1, 10, `TEST CASE OVERVIEW — ${reqInfo.id}: ${reqInfo.feature}`, C.NAVY, C.WHITE, 16);

  // KPI Cards (left) + At-a-Glance (right) — row 3
  ws.getRow(3).height = 22;
  setCellMerge(ws, 3, 1, 5, 'REQUIREMENT INFORMATION', C.BLUE, C.WHITE, true, 'center');
  setCellMerge(ws, 3, 6, 10, 'AT-A-GLANCE STATS', C.BLUE, C.WHITE, true, 'center');

  const kpis = [
    ['Requirement ID', reqInfo.id],
    ['Feature', reqInfo.feature],
    ['Platform', reqInfo.platform],
    ['Page Group', reqInfo.pageGroup],
  ];
  const stats = [
    ['Total Test Cases', totalTC],
    ['Round History TCs', rhCount],
    ['Transaction History TCs', thCount],
    ['Date', today],
  ];

  kpis.forEach((item, i) => {
    const row = 4 + i;
    ws.getRow(row).height = 20;
    setCell(ws, row, 1, item[0], C.PRECOND_BG, C.NAVY, true, 'left');
    ws.mergeCells(row, 1, row, 2);
    setCellMerge(ws, row, 3, 5, item[1], C.WHITE, C.BLACK, false, 'left');
  });

  stats.forEach((item, i) => {
    const row = 4 + i;
    ws.getRow(row).height = 20;
    setCell(ws, row, 6, item[0], C.PRECOND_BG, C.NAVY, true, 'left');
    setCellMerge(ws, row, 7, 10, String(item[1]), C.WHITE, C.BLACK, false, 'left');
  });

  // Case Type Distribution — row 9
  ws.getRow(9).height = 22;
  setCellMerge(ws, 9, 1, 10, 'CASE TYPE DISTRIBUTION BY PAGE', C.NAVY, C.WHITE, true, 'center');

  // CT header
  const ctHeaderRow = 10;
  ws.getRow(ctHeaderRow).height = 18;
  ['Page', 'Positive', 'Negative', 'Boundary', 'E2E', 'Exception', 'Security', 'Permission', 'Total'].forEach((h, i) => {
    setCell(ws, ctHeaderRow, i + 1, h, C.NAVY, C.WHITE, true, 'center');
  });

  // CT data rows
  const pages = ['Round History', 'Transaction History'];
  const ctTypes = ['Positive', 'Negative', 'Boundary', 'E2E', 'Exception', 'Security', 'Permission'];

  pages.forEach((page, pi) => {
    const row = 11 + pi;
    ws.getRow(row).height = 18;
    const pageTCs = allTestCases.filter(t => t.Page.includes(page));
    setCell(ws, row, 1, page, C.PAGE_BG, C.NAVY, true, 'left');

    let totalForPage = 0;
    ctTypes.forEach((ct, ci) => {
      const cnt = pageTCs.filter(t => t.CaseType === ct).length;
      totalForPage += cnt;
      const st = caseTypeStyle(ct);
      setCell(ws, row, ci + 2, cnt || '', st.bg, st.fg, true, 'center');
    });

    const permCount = pageTCs.filter(t => t.CaseType === 'Permission').length;
    const secCount = pageTCs.filter(t => t.CaseType === 'Security').length;
    setCell(ws, row, 8, permCount || '', C.PAGE_BG, C.NAVY, true, 'center');
    setCell(ws, row, 9, totalForPage, C.NAVY, C.WHITE, true, 'center');
  });

  // Totals row
  const totalRow = 13;
  ws.getRow(totalRow).height = 18;
  setCell(ws, totalRow, 1, 'TOTAL', C.NAVY, C.WHITE, true, 'center');
  ctTypes.forEach((ct, ci) => {
    const cnt = allTestCases.filter(t => t.CaseType === ct).length;
    const st = caseTypeStyle(ct);
    setCell(ws, totalRow, ci + 2, cnt || '', C.NAVY, C.WHITE, true, 'center');
  });
  const permTotal = allTestCases.filter(t => t.CaseType === 'Permission').length;
  const secTotal = allTestCases.filter(t => t.CaseType === 'Security').length;
  setCell(ws, totalRow, 8, permTotal || '', C.NAVY, C.WHITE, true, 'center');
  setCell(ws, totalRow, 9, totalTC, C.NAVY, C.WHITE, true, 'center');

  // Priority Distribution — row 15
  ws.getRow(15).height = 22;
  setCellMerge(ws, 15, 1, 10, 'PRIORITY DISTRIBUTION BY PAGE', C.NAVY, C.WHITE, true, 'center');

  const pHeaderRow = 16;
  ws.getRow(pHeaderRow).height = 18;
  ['Page', 'High', 'Medium', 'Low', 'Total'].forEach((h, i) => {
    setCell(ws, pHeaderRow, i + 1, h, C.NAVY, C.WHITE, true, 'center');
  });

  pages.forEach((page, pi) => {
    const row = 17 + pi;
    ws.getRow(row).height = 18;
    const pageTCs = allTestCases.filter(t => t.Page.includes(page));
    setCell(ws, row, 1, page, C.PAGE_BG, C.NAVY, true, 'left');
    ['High', 'Medium', 'Low'].forEach((p, pi2) => {
      const cnt = pageTCs.filter(t => t.Priority === p).length;
      const st = priorityStyle(p);
      setCell(ws, row, pi2 + 2, cnt || '', st.bg, st.fg, true, 'center');
    });
    setCell(ws, row, 5, pageTCs.length, C.NAVY, C.WHITE, true, 'center');
  });

  // Priority totals row
  const pTotalRow = 19;
  ws.getRow(pTotalRow).height = 18;
  setCell(ws, pTotalRow, 1, 'TOTAL', C.NAVY, C.WHITE, true, 'center');
  ['High', 'Medium', 'Low'].forEach((p, pi) => {
    const cnt = allTestCases.filter(t => t.Priority === p).length;
    const st = priorityStyle(p);
    setCell(ws, pTotalRow, pi + 2, cnt, C.NAVY, C.WHITE, true, 'center');
  });
  setCell(ws, pTotalRow, 5, totalTC, C.NAVY, C.WHITE, true, 'center');

  // Set column widths
  [8, 12, 14, 22, 30, 20, 20, 12, 12, 18].forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });
}

// ============================================================
// SHEET 2 — MATRIX REQ x TC
// ============================================================
function buildSheet2(ws, reqInfo, coverageMap) {
  ws.views = [{ state: 'normal', topLeftCell: 'A1' }];
  ws.properties.tabColor = C.S2_TAB;

  // Banner
  ws.getRow(1).height = 44;
  setBanner(ws, 1, 1, 4, `REQ x TEST CASE COVERAGE MATRIX — ${reqInfo.id}`, C.S2_TAB, C.WHITE, 16);

  // Headers
  ws.getRow(2).height = 24;
  ['REQ ID', 'Description', '# TC', 'Covered'].forEach((h, i) => {
    setCell(ws, 2, i + 1, h, C.NAVY, C.WHITE, true, 'center');
  });

  const sections = [
    { label: 'ELIGIBILITY CONDITIONS', color: C.MG_BLUE, items: [] },
    { label: 'ACCEPTANCE CRITERIA', color: C.MG_GREEN, items: [] },
    { label: 'E2E STATE TRANSITIONS', color: C.MG_NAVY, items: [] },
    { label: 'DATA INTEGRITY', color: C.MG_PURPLE, items: [] },
  ];

  // Build section items from coverageMap
  Object.entries(coverageMap).forEach(([key, val]) => {
    const k = key.toUpperCase();
    if (k.includes('C1') || k.includes('C2') || k.includes('C3') || k.includes('C5') || k.includes('C6')) {
      sections[0].items.push({ id: key, desc: val.desc, count: val.count, covered: val.covered });
    } else if (k.includes('AC')) {
      sections[1].items.push({ id: key, desc: val.desc, count: val.count, covered: val.covered });
    } else if (k.includes('E2E')) {
      sections[2].items.push({ id: key, desc: val.desc, count: val.count, covered: val.covered });
    } else {
      sections[3].items.push({ id: key, desc: val.desc, count: val.count, covered: val.covered });
    }
  });

  let currentRow = 3;
  sections.forEach(section => {
    if (section.items.length === 0) return;
    ws.getRow(currentRow).height = 20;
    setCellMerge(ws, currentRow, 1, 4, section.label, section.color, C.WHITE, true, 'center');
    currentRow++;

    section.items.forEach(item => {
      ws.getRow(currentRow).height = 18;
      setCell(ws, currentRow, 1, item.id, C.PRECOND_BG, C.NAVY, true, 'left');
      setCell(ws, currentRow, 2, item.desc, C.WHITE, C.BLACK, false, 'left');
      setCell(ws, currentRow, 3, item.count, C.WHITE, C.BLACK, false, 'center');
      const badgeBg = item.covered ? C.YES_BG : C.NO_BG;
      const badgeFg = item.covered ? C.YES_FG : C.NO_FG;
      setCell(ws, currentRow, 4, item.covered ? 'YES' : 'NO', badgeBg, badgeFg, true, 'center');
      currentRow++;
    });
    currentRow++; // blank row between sections
  });

  ws.getColumn(1).width = 16;
  ws.getColumn(2).width = 55;
  ws.getColumn(3).width = 8;
  ws.getColumn(4).width = 10;
}

// ============================================================
// SHEET 3 — TESTCASE
// ============================================================
function buildSheet3(ws, reqInfo, allTestCases) {
  // Freeze row 2 (header) and column F (SUB-CASE 1 = column 6)
  ws.views = [{ state: 'frozen', topLeftCell: 'F3', xSplit: 6, ySplit: 2, activeTab: 0 }];
  ws.properties.tabColor = C.S3_TAB;

  // Banner row 1 — S3 uses blue tab color
  ws.getRow(1).height = 44;
  setBanner(ws, 1, 1, 15, `TEST CASE SUITE — ${reqInfo.id}: ${reqInfo.feature}`, C.S2_TAB, C.WHITE, 16);

  // Header row 2
  const headers = [
    'REQ ID', 'TEST CASE ID', 'PLATFORM', 'PAGE/FEATURE',
    'CASE TITLE', 'SUB-CASE 1', 'SUB-CASE 2', 'CASE TYPE',
    'PRIORITY', 'PRE-CONDITIONS', 'STEPS', 'EXPECTED RESULT',
    'STATUS', 'EXECUTE NAME', 'EXECUTE DATE'
  ];
  ws.getRow(2).height = 30;
  headers.forEach((h, i) => {
    setCell(ws, 2, i + 1, h, C.S2_TAB, C.WHITE, true, 'center');
  });

  // Group by page
  const pages = [...new Set(allTestCases.map(tc => tc.Page))];

  let dataRow = 3;
  let caseInPage = 0;

  pages.forEach(page => {
    const pageTCs = allTestCases.filter(tc => tc.Page === page);
    caseInPage = 0;

    // Stats row (above section header)
    ws.getRow(dataRow).height = 22;
    setCellMerge(ws, dataRow, 1, 15, `${page} — ${pageTCs.length} Test Cases`, C.PAGE_BG, C.NAVY, true, 'left');
    dataRow++;

    // Section header
    ws.getRow(dataRow).height = 24;
    setCellMerge(ws, dataRow, 1, 15, `=== ${page} (${pageTCs.length} Test Cases) ===`, C.S2_TAB, C.WHITE, true, 'center');
    dataRow++;

    // Data rows — with auto height based on wrapped content
    pageTCs.forEach((tc, idx) => {
      const isAlt = idx % 2 === 1;

      // 1. REQ ID
      setCell(ws, dataRow, 1, tc.ReqID || '', C.REQ_ID_BG, C.REQ_ID_FG, true, 'center');
      // 2. TEST CASE ID
      setCell(ws, dataRow, 2, tc.ID, C.TC_ID_BG, C.TC_ID_FG, true, 'center');
      // 3. PLATFORM — always Admin for this suite
      setCell(ws, dataRow, 3, 'Admin', C.ALT_ROW_BG, C.BLACK, false, 'center');
      // 4. PAGE/FEATURE
      setCell(ws, dataRow, 4, tc.Page, isAlt ? C.ALT_ROW_BG : C.WHITE, C.NAVY, true, 'left');
      // 5. CASE TITLE
      setCell(ws, dataRow, 5, tc.Case, isAlt ? C.ALT_ROW_BG : C.WHITE, C.BLACK, false, 'left');
      // 6. SUB-CASE 1
      setCell(ws, dataRow, 6, tc.Subcase1 || '', isAlt ? C.ALT_ROW_BG : C.WHITE, C.BLACK, false, 'left');
      // 7. SUB-CASE 2
      setCell(ws, dataRow, 7, tc.Subcase2 || '', isAlt ? C.ALT_ROW_BG : C.WHITE, C.BLACK, false, 'left');
      // 8. CASE TYPE
      const ctSt = caseTypeStyle(tc.CaseType);
      setCell(ws, dataRow, 8, tc.CaseType, ctSt.bg, ctSt.fg, true, 'center');
      // 9. PRIORITY
      const pSt = priorityStyle(tc.Priority);
      setCell(ws, dataRow, 9, tc.Priority, pSt.bg, pSt.fg, true, 'center');
      // 10. PRE-CONDITIONS
      setCell(ws, dataRow, 10, tc.Preconditions, C.PRECOND_BG, C.BLACK, false, 'left');
      // 11. STEPS
      setCell(ws, dataRow, 11, tc.TestSteps, isAlt ? C.ALT_ROW_BG : C.WHITE, C.BLACK, false, 'left');
      // 12. EXPECTED RESULT
      setCell(ws, dataRow, 12, tc.ExpectedResult, C.EXPECTED_BG, C.EXPECTED_FG, true, 'left');
      // 13. STATUS
      const sSt = statusStyle(tc.Status || '');
      setCell(ws, dataRow, 13, tc.Status || '', sSt.bg, sSt.fg, true, 'center');
      // 14. EXECUTE NAME
      setCell(ws, dataRow, 14, tc.ExecuteName || '', isAlt ? C.ALT_ROW_BG : C.WHITE, C.BLACK, false, 'center');
      // 15. EXECUTE DATE
      setCell(ws, dataRow, 15, tc.ExecuteDate || '', isAlt ? C.ALT_ROW_BG : C.WHITE, C.BLACK, false, 'center');

      // Auto row height based on longest cell content
      ws.getRow(dataRow).height = calcRowHeight([
        tc.Case, tc.Subcase1, tc.Subcase2,
        tc.Preconditions, tc.TestSteps, tc.ExpectedResult,
      ]);

      dataRow++;
    });
  });

  // Column widths (15 columns, PLATFORM added)
  [10, 12, 10, 22, 35, 30, 25, 12, 10, 40, 40, 40, 10, 14, 14].forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });
}

// ============================================================
// SHEET 4 — QC EXECUTE NOTE
// ============================================================
function buildSheet4(ws, reqInfo) {
  ws.views = [{ state: 'normal', topLeftCell: 'A1' }];
  ws.properties.tabColor = C.S4_TAB;

  ws.getRow(1).height = 44;
  setBanner(ws, 1, 1, 4, `QC EXECUTE NOTE — ${reqInfo.id}: ${reqInfo.feature}`, C.S4_TAB, C.WHITE, 16);

  let row = 3;
  const sections = [
    {
      title: '1. PURPOSE & SCOPE', color: C.PURPLE, content: [
        `Requirement ID: ${reqInfo.id}`,
        `Feature: ${reqInfo.feature}`,
        `Platform: ${reqInfo.platform}`,
        `Page Group: ${reqInfo.pageGroup}`,
        'Scope: Verify that the "Cashback" tag is correctly displayed (or hidden) in the Bonus column of Round History and Transaction History under Admin > User Games Play.',
        'The tag must appear only when all 6 eligibility conditions are met simultaneously.',
        'This test suite covers positive flows, negative flows, boundary conditions, and E2E state transitions.',
      ]
    },
    {
      title: '2. CASE TYPE LEGEND', color: C.GREEN, content: [],
      legend: [
        { label: 'Positive', desc: 'Input is valid and expected flow executes correctly', bg: C.CT_POSITIVE_BG, fg: C.CT_POSITIVE_FG },
        { label: 'Negative', desc: 'Input is invalid or conditions are not met — system handles correctly', bg: C.CT_NEGATIVE_BG, fg: C.CT_NEGATIVE_FG },
        { label: 'Boundary', desc: 'Input at or near the boundary of valid/invalid ranges', bg: C.CT_BOUNDARY_BG, fg: C.CT_BOUNDARY_FG },
        { label: 'E2E', desc: 'End-to-end multi-step scenario with state transitions over time or actions', bg: C.CT_E2E_BG, fg: C.CT_E2E_FG },
        { label: 'Exception', desc: 'Error or exception scenario — system handles gracefully', bg: C.CT_EXCEPTION_BG, fg: C.CT_EXCEPTION_FG },
        { label: 'Permission', desc: 'User role or access permission verification', bg: C.CT_PERMISSION_BG, fg: C.CT_PERMISSION_FG },
        { label: 'Security', desc: 'Security risk verification (unauthorized access, injection, etc.)', bg: C.CT_SECURITY_BG, fg: C.CT_SECURITY_FG },
      ]
    },
    {
      title: '3. PRIORITY GUIDE', color: C.ORANGE, content: [],
      legend: [
        { label: 'High', desc: 'Must pass before release. Core business logic. Serious bug if missed.', bg: C.P_HIGH_BG, fg: C.P_HIGH_FG },
        { label: 'Medium', desc: 'Should pass. Important feature with moderate impact if failed.', bg: C.P_MEDIUM_BG, fg: C.P_MEDIUM_FG },
        { label: 'Low', desc: 'Optional but recommended. UI/text validation, cosmetic issues.', bg: C.P_LOW_BG, fg: C.P_LOW_FG },
      ]
    },
    {
      title: '4. STATUS VALUES', color: C.BLUE, content: [],
      legend: [
        { label: 'Pass', desc: 'Test executed successfully and result matches expected outcome', bg: C.S_PASS_BG, fg: C.S_PASS_FG },
        { label: 'Fail', desc: 'Test executed but result does not match expected outcome', bg: C.S_FAIL_BG, fg: C.S_FAIL_FG },
        { label: 'Blocked', desc: 'Test cannot be executed due to dependency or environment issue', bg: C.S_BLOCKED_BG, fg: C.S_BLOCKED_FG },
        { label: 'Pending', desc: 'Test not yet executed', bg: C.S_PENDING_BG, fg: C.S_PENDING_FG },
      ]
    },
    {
      title: '5. EXECUTION TIPS FOR CASHBACK TAG', color: C.NAVY, content: [
        'TIP 1: Always verify that the Cashback tag appears ONLY in the Bonus column — no other columns should be affected.',
        'TIP 2: When testing boundary values (Min/Max), verify inclusive logic: Min <= bet <= Max should display the tag; bet < Min or bet > Max should NOT.',
        'TIP 3: For E2E scenarios (expiry, reactivation, enrollment mid-session), use a test user with a known cashback configuration and simulate time passing or state changes.',
        'TIP 4: When verifying pre-release data (AC4), use a user account with historical bets created before the feature release date. These bets should NOT display the tag.',
        'TIP 5: Cross-check Round History and Transaction History for the same bet/transaction — the Cashback tag must be identical in both views.',
      ]
    },
    {
      title: '6. DEFECT REPORTING', color: 'C00000', content: [
        'When a test fails, document the following:',
        '- Test Case ID and REQ ID',
        '- Actual result vs. expected result',
        '- Steps to reproduce',
        '- Screenshots of Round History and Transaction History',
        '- Cashback configuration at the time of failure (Min, Max, cap, date range, eligible games)',
        '- Browser/environment details',
        'Classify severity: High (tag missing when it should appear, or appears when it should not), Medium (tag text incorrect), Low (minor display issue).',
      ]
    },
    {
      title: '7. REGRESSION CRITERIA', color: C.GREEN, content: [
        'Regression testing is required when:',
        '- Admin cashback configuration changes (Min, Max, cap, date range, eligible games, status)',
        '- User enrollment/cancellation in cashback program',
        '- System date/time changes',
        '- Feature code changes in Round History or Transaction History display logic',
        'Minimum regression scope: All High Priority + E2E test cases must be re-executed.',
        'Full regression: All test cases in this suite must be re-executed.',
      ]
    },
  ];

  sections.forEach(section => {
    ws.getRow(row).height = 22;
    setCellMerge(ws, row, 1, 4, section.title, section.color, C.WHITE, true, 'left');
    row++;

    if (section.legend) {
      section.legend.forEach(item => {
        ws.getRow(row).height = 20;
        setCell(ws, row, 1, item.label, item.bg, item.fg, true, 'center');
        setCellMerge(ws, row, 2, 4, item.desc, C.WHITE, C.BLACK, false, 'left');
        row++;
      });
    } else if (section.content.length > 0) {
      section.content.forEach(line => {
        ws.getRow(row).height = 18;
        setCellMerge(ws, row, 1, 4, line, C.WHITE, C.BLACK, false, 'left');
        row++;
      });
    }
    row++; // blank row
  });

  ws.getColumn(1).width = 20;
  ws.getColumn(2).width = 50;
  ws.getColumn(3).width = 15;
  ws.getColumn(4).width = 15;
}

// ============================================================
// SHEET 5 — KEYWORD EXPLANATION
// ============================================================
function buildSheet5(ws, reqInfo) {
  ws.views = [{ state: 'normal', topLeftCell: 'A1' }];
  ws.properties.tabColor = C.S5_TAB;

  ws.getRow(1).height = 44;
  setBanner(ws, 1, 1, 5, `KEYWORD EXPLANATION — ${reqInfo.id}: ${reqInfo.feature}`, C.S5_TAB, C.WHITE, 16);

  let row = 3;

  // Case Type
  ws.getRow(row).height = 22;
  setCellMerge(ws, row, 1, 5, 'CASE TYPE', C.NAVY, C.WHITE, true, 'center');
  row++;
  ws.getRow(row).height = 20;
  ['Name', 'Definition', 'Note'].forEach((h, i) => {
    setCell(ws, row, i + 1, h, C.BLUE, C.WHITE, true, 'center');
  });
  row++;

  const ctList = [
    ['Positive', 'Input is valid; expected behavior occurs correctly', 'Core happy-path scenarios'],
    ['Negative', 'Input is invalid or conditions fail; system handles correctly', 'Must check that system rejects invalid input'],
    ['Boundary', 'Input at the exact boundary of valid/invalid ranges', 'Min, Max, inclusive/exclusive checks'],
    ['E2E', 'End-to-end scenario with state transitions over time or actions', 'Covers enrollment, expiry, reactivation'],
    ['Exception', 'Error/exception scenario — system handles gracefully', 'Timeout, server error, network issues'],
    ['Permission', 'Role or access control verification', 'Unauthorized access attempts'],
    ['Security', 'Security risk verification (injection, XSS, unauthorized access)', 'High severity if found'],
  ];
  ctList.forEach(item => {
    ws.getRow(row).height = 18;
    const st = caseTypeStyle(item[0]);
    setCell(ws, row, 1, item[0], st.bg, st.fg, true, 'center');
    setCell(ws, row, 2, item[1], C.WHITE, C.BLACK, false, 'left');
    setCell(ws, row, 3, item[2], C.WHITE, C.BLACK, false, 'left');
    row++;
  });
  row++;

  // Priority
  ws.getRow(row).height = 22;
  setCellMerge(ws, row, 1, 5, 'PRIORITY', C.NAVY, C.WHITE, true, 'center');
  row++;
  ws.getRow(row).height = 20;
  ['Level', 'Definition', 'Note'].forEach((h, i) => {
    setCell(ws, row, i + 1, h, C.BLUE, C.WHITE, true, 'center');
  });
  row++;

  const pList = [
    ['High', 'Must pass before release; core business logic', 'Serious bug if missed'],
    ['Medium', 'Should pass; important feature', 'Moderate impact if failed'],
    ['Low', 'Optional but recommended', 'UI/cosmetic issues'],
  ];
  pList.forEach(item => {
    ws.getRow(row).height = 18;
    const st = priorityStyle(item[0]);
    setCell(ws, row, 1, item[0], st.bg, st.fg, true, 'center');
    setCell(ws, row, 2, item[1], C.WHITE, C.BLACK, false, 'left');
    setCell(ws, row, 3, item[2], C.WHITE, C.BLACK, false, 'left');
    row++;
  });
  row++;

  // Status
  ws.getRow(row).height = 22;
  setCellMerge(ws, row, 1, 5, 'STATUS', C.NAVY, C.WHITE, true, 'center');
  row++;
  ws.getRow(row).height = 20;
  ['Value', 'Definition', 'Note'].forEach((h, i) => {
    setCell(ws, row, i + 1, h, C.BLUE, C.WHITE, true, 'center');
  });
  row++;

  const sList = [
    ['Pass', 'Test executed successfully; result matches expected', 'Green badge'],
    ['Fail', 'Test executed; result does not match expected', 'Red badge'],
    ['Blocked', 'Test cannot be executed due to dependency', 'Yellow badge'],
    ['Pending', 'Test not yet executed', 'Gray badge'],
  ];
  sList.forEach(item => {
    ws.getRow(row).height = 18;
    const st = statusStyle(item[0]);
    setCell(ws, row, 1, item[0], st.bg, st.fg, true, 'center');
    setCell(ws, row, 2, item[1], C.WHITE, C.BLACK, false, 'left');
    setCell(ws, row, 3, item[2], C.WHITE, C.BLACK, false, 'left');
    row++;
  });
  row++;

  // Column Explanation
  ws.getRow(row).height = 22;
  setCellMerge(ws, row, 1, 5, 'COLUMN EXPLANATION', C.NAVY, C.WHITE, true, 'center');
  row++;
  ws.getRow(row).height = 20;
  ['Column', 'Description'].forEach((h, i) => {
    setCell(ws, row, i + 1, h, C.BLUE, C.WHITE, true, 'center');
  });
  ws.mergeCells(row, 2, row, 5);
  row++;

  const colExplanations = [
    ['REQ ID', 'Requirement ID that this test case covers (e.g., US-8182, REQ-1-C1)'],
    ['TEST CASE ID', 'Unique identifier for this test case (e.g., RH-01, TH-01)'],
    ['PLATFORM', 'System under test: Admin, User, Mobile, API'],
    ['PAGE/FEATURE', 'The screen or feature area to be tested'],
    ['CASE TITLE', 'Main objective of the test — what is being verified'],
    ['SUB-CASE 1', 'Specific data variant or condition for this test case'],
    ['SUB-CASE 2', 'Secondary variant (if applicable); blank if none'],
    ['CASE TYPE', 'Classification: Positive, Negative, Boundary, E2E, Exception, Permission, Security'],
    ['PRIORITY', 'Execution priority: High, Medium, Low'],
    ['PRE-CONDITIONS', 'Required conditions that must be met before executing this test'],
    ['STEPS', 'Step-by-step actions to execute this test case'],
    ['EXPECTED RESULT', 'Expected outcome after executing the steps — must be measurable'],
    ['STATUS', 'Execution result: Pass, Fail, Blocked, Pending'],
    ['EXECUTE NAME', 'Name of the person who executed this test case'],
    ['EXECUTE DATE', 'Date when this test case was executed (MM/DD/YYYY)'],
  ];
  colExplanations.forEach((item, i) => {
    ws.getRow(row).height = 18;
    setCell(ws, row, 1, item[0], C.PAGE_BG, C.NAVY, true, 'left');
    setCellMerge(ws, row, 2, 5, item[1], C.WHITE, C.BLACK, false, 'left');
    row++;
  });
  row++;

  // Color Reference
  ws.getRow(row).height = 22;
  setCellMerge(ws, row, 1, 5, 'COLOR REFERENCE', C.NAVY, C.WHITE, true, 'center');
  row++;
  ws.getRow(row).height = 20;
  ['Color Type', 'Background', 'Foreground', 'Used For'].forEach((h, i) => {
    setCell(ws, row, i + 1, h, C.BLUE, C.WHITE, true, 'center');
  });
  row++;

  const colorRef = [
    ['Positive', '#E2EFDA', '#375623', 'CASE TYPE = Positive'],
    ['Negative', '#FCE4D6', '#9C0006', 'CASE TYPE = Negative'],
    ['Boundary', '#FFF2CC', '#7F6000', 'CASE TYPE = Boundary'],
    ['E2E', '#E2E8F0', '#1E3A5F', 'CASE TYPE = E2E'],
    ['Exception', '#EDEDED', '#404040', 'CASE TYPE = Exception'],
    ['Security', '#FFE6FF', '#7030A0', 'CASE TYPE = Security'],
    ['Permission', '#FCE4D6', '#9C0006', 'CASE TYPE = Permission'],
    ['High Priority', '#FFE0CC', '#C55A11', 'PRIORITY = High'],
    ['Medium Priority', '#DDEBF7', '#2E75B6', 'PRIORITY = Medium'],
    ['Low Priority', '#F2F2F2', '#595959', 'PRIORITY = Low'],
    ['Pass', '#C6EFCE', '#276221', 'STATUS = Pass'],
    ['Fail', '#FFC7CE', '#9C0006', 'STATUS = Fail'],
    ['Blocked', '#FFE699', '#7F6000', 'STATUS = Blocked'],
    ['Pending', '#F2F2F2', '#595959', 'STATUS = Pending'],
    ['REQ ID Column', '#BDD7EE', '#1F3864', 'Column REQ ID'],
    ['TEST CASE ID Column', '#1F3864', '#FFFFFF', 'Column TEST CASE ID'],
    ['Expected Result', '#FCE4D6', '#9C0006', 'Column EXPECTED RESULT'],
    ['Pre-conditions', '#F2F7F9', '#000000', 'Column PRE-CONDITIONS'],
    ['Alt Row', '#F8F9FA', '#000000', 'Alternate row shading'],
    ['Sheet Tab S1', '#1F3864', '#FFFFFF', 'S1 - Overview'],
    ['Sheet Tab S2', '#2E75B6', '#FFFFFF', 'S2 - Matrix REQ x TC'],
    ['Sheet Tab S3', '#375623', '#FFFFFF', 'S3 - Testcase'],
    ['Sheet Tab S4', '#5C2D91', '#FFFFFF', 'S4 - QC Execute Note'],
    ['Sheet Tab S5', '#C55A11', '#FFFFFF', 'S5 - Keyword Explanation'],
  ];
  colorRef.forEach((item, i) => {
    ws.getRow(row).height = 18;
    setCell(ws, row, 1, item[0], C.WHITE, C.BLACK, false, 'left');
    setCell(ws, row, 2, item[1], item[1].replace('#', ''), C.BLACK, false, 'center');
    setCell(ws, row, 3, item[2], C.WHITE, item[2].replace('#', ''), false, 'center');
    setCellMerge(ws, row, 4, 5, item[3], C.WHITE, C.BLACK, false, 'left');
    row++;
  });

  ws.getColumn(1).width = 24;
  ws.getColumn(2).width = 18;
  ws.getColumn(3).width = 18;
  ws.getColumn(4).width = 25;
  ws.getColumn(5).width = 15;
}

// ============================================================
// MARKDOWN SUMMARY
// ============================================================
function buildMarkdown(reqInfo, allTestCases, coverageMap) {
  const today = formatDate(new Date());
  const totalTC = allTestCases.length;
  const rhCount = allTestCases.filter(t => t.Page.includes('Round History')).length;
  const thCount = allTestCases.filter(t => t.Page.includes('Transaction History')).length;

  const ctCounts = {};
  allTestCases.forEach(tc => {
    ctCounts[tc.CaseType] = (ctCounts[tc.CaseType] || 0) + 1;
  });
  const pCounts = {};
  allTestCases.forEach(tc => {
    pCounts[tc.Priority] = (pCounts[tc.Priority] || 0) + 1;
  });

  // Count coverage
  const covered = Object.values(coverageMap).filter(v => v.covered).length;
  const totalReq = Object.keys(coverageMap).length;

  let md = '';
  md += `# Test Case Summary — ${reqInfo.id}: ${reqInfo.feature}\n\n`;
  md += `| Field | Value |\n`;
  md += `|-------|-------|\n`;
  md += `| Requirement ID | ${reqInfo.id} |\n`;
  md += `| Feature | ${reqInfo.feature} |\n`;
  md += `| Platform | ${reqInfo.platform} |\n`;
  md += `| Page Group | ${reqInfo.pageGroup} |\n`;
  md += `| Total Test Cases | ${totalTC} |\n`;
  md += `| Date | ${today} |\n\n`;

  md += `## REQ Coverage (${covered}/${totalReq} covered)\n\n`;
  md += `| REQ ID | Description | # TC | Covered |\n`;
  md += `|--------|-------------|------|---------|\n`;
  Object.entries(coverageMap).forEach(([key, val]) => {
    md += `| ${key} | ${val.desc} | ${val.count} | ${val.covered ? 'YES' : 'NO'} |\n`;
  });
  md += `\n`;

  md += `## Case Type Distribution\n\n`;
  md += `| Case Type | Count | Percentage |\n`;
  md += `|-----------|-------|------------|\n`;
  const ctTypes = ['Positive', 'Negative', 'Boundary', 'E2E', 'Exception', 'Permission', 'Security'];
  ctTypes.forEach(ct => {
    const cnt = ctCounts[ct] || 0;
    if (cnt > 0) {
      md += `| ${ct} | ${cnt} | ${((cnt / totalTC) * 100).toFixed(1)}% |\n`;
    }
  });
  md += `\n`;

  md += `## Priority Distribution\n\n`;
  md += `| Priority | Count | Percentage |\n`;
  md += `|----------|-------|------------|\n`;
  ['High', 'Medium', 'Low'].forEach(p => {
    const cnt = pCounts[p] || 0;
    md += `| ${p} | ${cnt} | ${((cnt / totalTC) * 100).toFixed(1)}% |\n`;
  });
  md += `\n`;

  md += `## Test Case List (${totalTC} Total)\n\n`;
  md += `| TC ID | Page | Case Title | Sub-case 1 | Expected Result |\n`;
  md += `|-------|------|------------|------------|----------------|\n`;
  allTestCases.forEach(tc => {
    const caseTitle = tc.Case.length > 60 ? tc.Case.substring(0, 60) + '...' : tc.Case;
    const sub1 = (tc.Subcase1 || '').length > 40 ? (tc.Subcase1 || '').substring(0, 40) + '...' : (tc.Subcase1 || '');
    const exp = tc.ExpectedResult.length > 50 ? tc.ExpectedResult.substring(0, 50) + '...' : tc.ExpectedResult;
    md += `| ${tc.ID} | ${tc.Page.includes('Round') ? 'Round History' : 'Transaction History'} | ${caseTitle} | ${sub1} | ${exp} |\n`;
  });
  md += `\n`;

  md += `## Key Coverage Notes\n\n`;
  md += `- **Total**: ${totalTC} test cases (${rhCount} Round History + ${thCount} Transaction History)\n`;
  md += `- **Coverage**: All 6 eligibility conditions are covered with Positive, Negative, and Boundary test cases.\n`;
  md += `- **E2E Coverage**: 7 E2E scenarios covering enrollment mid-session, expiry, reactivation, cancellation, cap exhaustion, and config changes.\n`;
  md += `- **AC1/AC2**: Verified in both Round History and Transaction History.\n`;
  md += `- **AC3**: Boundary conditions for Min/Max inclusive logic verified.\n`;
  md += `- **AC4**: Pre-release historical data does NOT receive the Cashback tag.\n`;
  md += `- **Data Integrity**: Tag consistency between Round History and Transaction History is verified for every qualifying bet.\n`;
  md += `- **High Priority**: ${pCounts['High'] || 0} High priority TCs must pass before release.\n`;
  md += `- All content in this test suite is written in **ENGLISH** as per QA standards.\n`;

  return md;
}

// ============================================================
// MAIN EXPORT
// ============================================================
function generateTestCase(reqInfo, allTestCases, coverageMap, outputXlsx, outputMd) {
  // Ensure output directory exists
  const xlsxDir = path.dirname(outputXlsx);
  const mdDir = path.dirname(outputMd);
  if (!fs.existsSync(xlsxDir)) fs.mkdirSync(xlsxDir, { recursive: true });
  if (!fs.existsSync(mdDir)) fs.mkdirSync(mdDir, { recursive: true });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Test Case Generator';
  workbook.created = new Date();

  // Sheet 1 — Overview
  const ws1 = workbook.addWorksheet('S1 - Overview');
  buildSheet1(ws1, reqInfo, allTestCases, coverageMap);

  // Sheet 2 — Matrix REQ x TC
  const ws2 = workbook.addWorksheet('S2 - Matrix REQ x TC');
  buildSheet2(ws2, reqInfo, coverageMap);

  // Sheet 3 — Testcase
  const ws3 = workbook.addWorksheet('S3-Testcase');
  buildSheet3(ws3, reqInfo, allTestCases);

  // Sheet 4 — QC Execute Note
  const ws4 = workbook.addWorksheet('S4 - QC Execute Note');
  buildSheet4(ws4, reqInfo);

  // Sheet 5 — Keyword Explanation
  const ws5 = workbook.addWorksheet('S5-KeywordExplanation');
  buildSheet5(ws5, reqInfo);

  // Write Excel
  workbook.xlsx.writeFile(outputXlsx).then(() => {
    console.log(`Excel written: ${outputXlsx}`);
  }).catch(err => {
    console.error(`Excel write error: ${err.message}`);
  });

  // Write Markdown
  const md = buildMarkdown(reqInfo, allTestCases, coverageMap);
  fs.writeFileSync(outputMd, md, 'utf8');
  console.log(`Markdown written: ${outputMd}`);
}

module.exports = { generateTestCase };
