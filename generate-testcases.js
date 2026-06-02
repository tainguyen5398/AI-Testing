/**
 * Test Case Generator
 * Generates: testcase.xlsx (4 sheets) + testcase-summary.md
 *
 * USAGE: node generate-testcases.js <dataFile.js>
 * The dataFile.js exports: { reqInfo, coverageMap, roundHistoryTC, transactionHistoryTC }
 *
 * Example dataFile: REQ-1/data.js
 */

const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const DATA_FILE = process.argv[2];
if (!DATA_FILE) {
  console.error('Usage: node generate-testcases.js <dataFile.js>');
  console.error('Example: node generate-testcases.js REQ-1/data.js');
  process.exit(1);
}

// Load test data from external file
let testData;
try {
  testData = require(path.resolve(DATA_FILE));
} catch (e) {
  console.error(`Cannot load data file: ${DATA_FILE}`);
  console.error(e.message);
  process.exit(1);
}

const { reqInfo, coverageMap, testCases, overviewMeta } = testData;

// Default overview meta if not provided
const meta = {
  platform: reqInfo.platform || 'Admin',
  pageGroup: reqInfo.pageGroup || reqInfo.feature || 'General',
  pages: overviewMeta || Object.keys(
    testCases.reduce((acc, tc) => { acc[tc.Page] = true; return acc; }, {})
  ),
  ...overviewMeta,
};

// ============================================================
// WORKBOOK SETUP
// ============================================================
const wb = new ExcelJS.Workbook();
wb.creator = 'QA Lead';
wb.created = new Date();

// ============================================================
// COLOR CONSTANTS
// ============================================================
const HDR_DARK  = { argb: 'FF1F3864' };
const HDR_ID    = { argb: 'FF2E75B6' };
const HDR_LABEL = { argb: 'FF375623' };
const HDR_CAT   = { argb: 'FF404040' };
const HDR_EXEC  = { argb: 'FF5C2D91' };

const CT_COLORS = {
  Positive:  { bg: 'FFE2EFDA', font: 'FF375623' },
  Negative:  { bg: 'FFFCE4D6', font: 'FF9C0006' },
  Boundary:  { bg: 'FFFFF2CC', font: 'FF7F6000' },
  E2E:       { bg: 'FFE2E8F0', font: 'FF1E3A5F' },
  Exception: { bg: 'FFEDEDED', font: 'FF404040' },
  Permission:{ bg: 'FFDAE8FC', font: 'FF1A3A7F' },
  Security:  { bg: 'FFFFE6FF', font: 'FF7030A0' },
};

const PRI_COLORS = {
  High:   { bg: 'FFFFE0CC', font: 'FF000000' },
  Medium: { bg: 'FFEBF3FB', font: 'FF000000' },
  Low:    { bg: 'FFF2F2F2', font: 'FF595959' },
};

const STS_COLORS = {
  Pass:    { bg: 'FFC6EFCE', font: 'FF276221' },
  Fail:    { bg: 'FFFFC7CE', font: 'FF9C0006' },
  Blocked: { bg: 'FFFFE699', font: 'FF7F6000' },
  Pending: { bg: 'FFF2F2F2', font: 'FF595959' },
};

const ROW_DEFAULT_BG = { argb: 'FFFAFAFA' };
const ROW_ALT_BG     = { argb: 'FFF0F4FA' };
const EXPECTED_BG    = { argb: 'FFFFFBE6' };

// ============================================================
// COLUMN DEFINITIONS
// ============================================================
const COLS = [
  { header: 'Test Case ID',     key: 'ID',             width: 12 },
  { header: 'REQ ID',           key: 'ReqID',           width: 10 },
  { header: 'Platform',         key: 'Platform',        width: 11 },
  { header: 'Page',             key: 'Page',            width: 26 },
  { header: 'Case',             key: 'Case',            width: 42 },
  { header: 'Sub-case 1',       key: 'Subcase1',        width: 30 },
  { header: 'Sub-case 2',       key: 'Subcase2',        width: 26 },
  { header: 'Case Type',        key: 'CaseType',        width: 14 },
  { header: 'Priority',         key: 'Priority',        width: 11 },
  { header: 'Pre-conditions',   key: 'Preconditions',  width: 46 },
  { header: 'Test Steps',       key: 'TestSteps',       width: 52 },
  { header: 'Expected Result',  key: 'ExpectedResult', width: 52 },
  { header: 'Status',           key: 'Status',          width: 11 },
  { header: 'Execute Name',     key: 'ExecuteName',    width: 14 },
  { header: 'Execute Date',     key: 'ExecuteDate',    width: 13 },
];

// ============================================================
// HELPERS
// ============================================================
function applyHeaderRow(ws) {
  ws.getRow(1).eachCell((cell, colNum) => {
    const key = COLS[colNum - 1]?.key || '';
    const idKeys    = ['ID', 'ReqID'];
    const labelKeys = ['Platform', 'Page'];
    const catKeys   = ['Case', 'Subcase1', 'Subcase2', 'CaseType', 'Priority'];
    const execKeys  = ['Status', 'ExecuteName', 'ExecuteDate'];

    let bg;
    if (idKeys.includes(key))       bg = HDR_ID;
    else if (labelKeys.includes(key)) bg = HDR_LABEL;
    else if (catKeys.includes(key))  bg = HDR_CAT;
    else if (execKeys.includes(key)) bg = HDR_EXEC;
    else                            bg = HDR_DARK;

    cell.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: bg };
    cell.alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };
    cell.border    = {
      top:    { style: 'thin', color: { argb: 'FF888888' } },
      left:   { style: 'thin', color: { argb: 'FF888888' } },
      bottom: { style: 'thin', color: { argb: 'FF888888' } },
      right:  { style: 'thin', color: { argb: 'FF888888' } },
    };
  });
  ws.getRow(1).height = 36;
  ws.getRow(1).commit();
}

function styleDataCell(cell, key, rowData, rowIdx) {
  const isAlt = rowIdx % 2 === 1;
  const altBg = isAlt ? ROW_ALT_BG : ROW_DEFAULT_BG;
  const thinBorder = {
    top:    { style: 'thin', color: { argb: 'FFCCCCCC' } },
    left:   { style: 'thin', color: { argb: 'FFCCCCCC' } },
    bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
    right:  { style: 'thin', color: { argb: 'FFCCCCCC' } },
  };

  cell.alignment = { wrapText: true, vertical: 'top' };
  cell.border = thinBorder;

  if (key === 'ID') {
    cell.alignment = { wrapText: false, vertical: 'middle', horizontal: 'center' };
    cell.font = { bold: true, color: { argb: 'FF1F3864' }, size: 10 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
  } else if (key === 'ReqID') {
    cell.alignment = { wrapText: false, vertical: 'middle', horizontal: 'center' };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E75B6' } };
  } else if (key === 'CaseType') {
    const c = CT_COLORS[rowData.CaseType] || { bg: 'FFFFFFFF', font: 'FF000000' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.bg } };
    cell.font = { bold: true, color: { argb: c.font }, size: 10 };
    cell.alignment = { wrapText: false, vertical: 'middle', horizontal: 'center' };
  } else if (key === 'Priority') {
    const c = PRI_COLORS[rowData.Priority] || { bg: 'FFFFFFFF', font: 'FF000000' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.bg } };
    cell.font = { bold: true, color: { argb: c.font }, size: 10 };
    cell.alignment = { wrapText: false, vertical: 'middle', horizontal: 'center' };
  } else if (key === 'Status') {
    const s = rowData.Status || 'Pending';
    const c = STS_COLORS[s] || { bg: 'FFFFFFFF', font: 'FF000000' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.bg } };
    cell.font = { bold: true, color: { argb: c.font }, size: 10 };
    cell.alignment = { wrapText: false, vertical: 'middle', horizontal: 'center' };
  } else if (key === 'ExpectedResult') {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: EXPECTED_BG };
    cell.font = { size: 10, color: { argb: 'FF3D3D00' } };
  } else {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: altBg };
    cell.font = { size: 10 };
  }
}

function addTestRows(ws, testCases) {
  testCases.forEach((tc, idx) => {
    const row = ws.addRow(tc);
    ws.getRow(idx + 2).height = 85;
    ws.getRow(idx + 2).eachCell((cell) => {
      const key = COLS[cell.col - 1]?.key || '';
      styleDataCell(cell, key, tc, idx);
    });
    ws.getRow(idx + 2).commit();
  });
}

function addSectionHeader(ws, rowNum, title) {
  const row = ws.addRow({
    ID: '', ReqID: '', Platform: '',
    Page: title,
    Case: '', Subcase1: '', Subcase2: '',
    CaseType: '', Priority: '',
    Preconditions: '', TestSteps: '', ExpectedResult: '',
    Status: '', ExecuteName: '', ExecuteDate: '',
  });
  ws.getRow(rowNum).eachCell((cell) => {
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
  ws.getRow(rowNum).height = 22;
  ws.getRow(rowNum).commit();
}

function configureSheet(ws, freezeCol, freezeRow) {
  ws.views = [{ state: 'frozen', xSplit: freezeCol, ySplit: freezeRow }];
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: COLS.length } };
}

// ============================================================
// SHEET 1: OVERVIEW
// ============================================================
function buildOverviewSheet(wb, reqInfo, testCases) {
  const ws = wb.addWorksheet('S1 - Overview');
  ws.getColumn(1).width = 30;
  ws.getColumn(2).width = 35;
  ws.getColumn(3).width = 20;

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

  // Title
  ws.mergeCells('A1:C1');
  const t = ws.getRow(1);
  t.height = 40;
  const tc = t.getCell(1);
  tc.value = `${reqInfo.reqId || 'REQ'} — ${reqInfo.feature || 'Test Case Suite Overview'}`;
  tc.font = { bold: true, size: 15, color: { argb: 'FFFFFFFF' } };
  tc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } };
  tc.alignment = { wrapText: false, vertical: 'middle', horizontal: 'center' };
  tc.border = {
    top:    { style: 'medium', color: { argb: 'FF000000' } },
    left:   { style: 'medium', color: { argb: 'FF000000' } },
    bottom: { style: 'medium', color: { argb: 'FF000000' } },
    right:  { style: 'medium', color: { argb: 'FF000000' } },
  };
  t.commit();

  setRow(2, 8, []); // spacer
  setRow(3, 25, [[1, 'Requirement ID', true, 'FFD9E1F2', 'FF1F3864', 'left'], [2, reqInfo.reqId || '', false, 'FFFFFFFF', 'FF000000', 'left'], [3, '', false, 'FFFFFFFF', 'FF000000', 'left']]);
  setRow(4, 25, [[1, 'Feature', true, 'FFD9E1F2', 'FF1F3864', 'left'], [2, reqInfo.feature || '', false, 'FFFFFFFF', 'FF000000', 'left'], [3, '', false, 'FFFFFFFF', 'FF000000', 'left']]);
  setRow(5, 25, [[1, 'Platform', true, 'FFD9E1F2', 'FF1F3864', 'left'], [2, reqInfo.platform || '', false, 'FFFFFFFF', 'FF000000', 'left'], [3, '', false, 'FFFFFFFF', 'FF000000', 'left']]);
  setRow(6, 25, [[1, 'Scope', true, 'FFD9E1F2', 'FF1F3864', 'left'], [2, (reqInfo.scope || '').split(',').join(' | '), false, 'FFFFFFFF', 'FF000000', 'left'], [3, '', false, 'FFFFFFFF', 'FF000000', 'left']]);
  setRow(7, 25, [[1, 'Total Test Cases', true, 'FFD9E1F2', 'FF1F3864', 'left'], [2, `${testCases.length}`, false, 'FFFFFFFF', 'FF000000', 'left'], [3, '', false, 'FFFFFFFF', 'FF000000', 'left']]);
  setRow(8, 25, [[1, 'Date Generated', true, 'FFD9E1F2', 'FF1F3864', 'left'], [2, new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), false, 'FFFFFFFF', 'FF000000', 'left'], [3, '', false, 'FFFFFFFF', 'FF000000', 'left']]);
  setRow(9, 8, []); // spacer

  // Case type summary by page
  const ctByPage = {};
  testCases.forEach(tc => {
    if (!ctByPage[tc.Page]) ctByPage[tc.Page] = {};
    ctByPage[tc.Page][tc.CaseType] = (ctByPage[tc.Page][tc.CaseType] || 0) + 1;
  });

  // Summary table header
  const pages = Object.keys(ctByPage);
  const allCT = ['Positive', 'Negative', 'Boundary', 'E2E', 'Exception', 'Permission', 'Security'];

  setRow(10, 28, [
    [1, 'Page', true, 'FF1F3864', 'FFFFFFFF', 'center'],
    ...pages.map((p, i) => [i + 2, p, true, 'FF1F3864', 'FFFFFFFF', 'center']),
    [pages.length + 2, 'Total', true, 'FF1F3864', 'FFFFFFFF', 'center'],
  ]);

  let rowOffset = 11;
  allCT.forEach(ct => {
    const hasCt = pages.some(p => ctByPage[p][ct]);
    if (!hasCt) return;
    const bg = (rowOffset - 11) % 2 === 0 ? 'FFF0F4FA' : 'FFFFFFFF';
    const cells = [[1, ct, false, bg, 'FF000000', 'left']];
    let rowTotal = 0;
    pages.forEach(p => {
      const cnt = ctByPage[p][ct] || 0;
      rowTotal += cnt;
      cells.push([pages.indexOf(p) + 2, cnt, false, bg, 'FF000000', 'center']);
    });
    cells.push([pages.length + 2, rowTotal, false, bg, 'FF000000', 'center']);
    setRow(rowOffset, 22, cells);
    rowOffset++;
  });

  // Priority summary
  const priByPage = {};
  testCases.forEach(tc => {
    if (!priByPage[tc.Page]) priByPage[tc.Page] = {};
    priByPage[tc.Page][tc.Priority] = (priByPage[tc.Page][tc.Priority] || 0) + 1;
  });

  setRow(rowOffset + 1, 8, []); // spacer
  setRow(rowOffset + 2, 28, [
    [1, 'Priority', true, 'FF1F3864', 'FFFFFFFF', 'center'],
    ...pages.map((p, i) => [i + 2, p, true, 'FF1F3864', 'FFFFFFFF', 'center']),
    [pages.length + 2, 'Total', true, 'FF1F3864', 'FFFFFFFF', 'center'],
  ]);

  ['High', 'Medium', 'Low'].forEach(pri => {
    const hasPri = pages.some(p => priByPage[p][pri]);
    if (!hasPri) return;
    const bg = (rowOffset + 3) % 2 === 0 ? 'FFF0F4FA' : 'FFFFFFFF';
    const cells = [[1, pri, false, bg, 'FF000000', 'center']];
    let rowTotal = 0;
    pages.forEach(p => {
      const cnt = priByPage[p][pri] || 0;
      rowTotal += cnt;
      cells.push([pages.indexOf(p) + 2, cnt, false, bg, 'FF000000', 'center']);
    });
    cells.push([pages.length + 2, rowTotal, false, bg, 'FF000000', 'center']);
    setRow(rowOffset + 3, 22, cells);
    rowOffset++;
  });

  ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
}

// ============================================================
// SHEET 2: REQ COVERAGE MATRIX
// ============================================================
function buildMatrixSheet(wb, coverageMap, testCases) {
  const ws = wb.addWorksheet('S2 - Req Coverage Matrix');
  ws.getColumn(1).width = 18;
  ws.getColumn(2).width = 55;
  ws.getColumn(3).width = 12;
  ws.getColumn(4).width = 12;

  // Header
  const hRow = ws.getRow(1);
  hRow.height = 30;
  [[1, 'REQ ID', 'FF1F3864'], [2, 'Description', 'FF1F3864'], [3, 'Test Cases', 'FF1F3864'], [4, 'Covered', 'FF1F3864']].forEach(([col, val, bg]) => {
    const c = hRow.getCell(col);
    c.value = val;
    c.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    c.alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };
    c.border = {
      top:    { style: 'thin', color: { argb: 'FF888888' } },
      left:   { style: 'thin', color: { argb: 'FF888888' } },
      bottom: { style: 'thin', color: { argb: 'FF888888' } },
      right:  { style: 'thin', color: { argb: 'FF888888' } },
    };
  });
  hRow.commit();

  Object.entries(coverageMap).forEach(([id, entry], idx) => {
    const bg = idx % 2 === 0 ? 'FFF0F4FA' : 'FFFFFFFF';
    const total = entry.count || 0;
    const row = ws.getRow(idx + 2);
    row.height = 28;
    [[1, id, 'FF2E75B6', 'FFFFFFFF', true], [2, entry.desc, bg, 'FF000000', false],
     [3, total > 0 ? total : '-', bg, 'FF000000', false],
     [4, total > 0 ? 'Yes' : 'No', total > 0 ? 'FFE2EFDA' : 'FFFCE4D6',
      total > 0 ? 'FF375623' : 'FF9C0006', true]].forEach(([col, val, bgC, fg, bold]) => {
      const c = row.getCell(col);
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
    row.commit();
  });

  ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 4 } };
}

// ============================================================
// SHEET 3: TEST CASES
// ============================================================
function buildTestCaseSheet(wb, testCases) {
  const ws = wb.addWorksheet('S3 - Test Cases');
  ws.columns = COLS;
  applyHeaderRow(ws);

  // Group by Page
  const byPage = {};
  testCases.forEach(tc => {
    if (!byPage[tc.Page]) byPage[tc.Page] = [];
    byPage[tc.Page].push(tc);
  });

  let currentRow = 2;
  Object.entries(byPage).forEach(([page, tcs], pIdx) => {
    addSectionHeader(ws, currentRow, `=== ${page} (${tcs.length} Test Cases) ===`);
    currentRow++;
    tcs.forEach((tc, idx) => {
      const row = ws.addRow(tc);
      ws.getRow(currentRow).height = 85;
      ws.getRow(currentRow).eachCell((cell) => {
        const key = COLS[cell.col - 1]?.key || '';
        styleDataCell(cell, key, tc, idx);
      });
      ws.getRow(currentRow).commit();
      currentRow++;
    });
  });

  configureSheet(ws, 1, 1);
}

// ============================================================
// SHEET 4: QC EXECUTION NOTES
// ============================================================
function buildNotesSheet(wb, reqInfo) {
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
  const dCell = (row, col, val, bg, fg) => {
    const c = row.getCell(col);
    c.value = val;
    c.font = { bold: false, size: 10, color: { argb: fg || 'FF000000' } };
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
  const t = ws.getRow(1);
  t.height = 36;
  const tc = t.getCell(1);
  tc.value = `QC EXECUTION NOTES — ${reqInfo.reqId || 'REQ'} ${reqInfo.feature || ''}`;
  tc.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  tc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } };
  tc.alignment = { wrapText: false, vertical: 'middle', horizontal: 'center' };
  tc.border = {
    top:    { style: 'medium', color: { argb: 'FF000000' } },
    left:   { style: 'medium', color: { argb: 'FF000000' } },
    bottom: { style: 'medium', color: { argb: 'FF000000' } },
    right:  { style: 'medium', color: { argb: 'FF000000' } },
  };
  t.commit();

  const notes = (reqInfo.executionNotes || []).concat([
    {
      section: 'GENERAL',
      items: [
        ['Purpose', 'This document provides guidance for QC engineers executing test cases in Sheet S3 (Test Cases).'],
        ['Scope', reqInfo.scope || 'See S1 - Overview for full scope.'],
        ['Assumption', reqInfo.assumptions || 'Test environment is ready. Test data has been prepared.'],
        ['Pre-test Setup', reqInfo.preTestSetup || 'No specific pre-test setup required beyond standard environment readiness.'],
      ],
    },
    {
      section: 'CASE TYPE LEGEND',
      items: [
        ['Positive', 'Valid inputs meeting all conditions — expected behavior confirmed.'],
        ['Negative', 'One or more conditions fail — expected: system handles gracefully (e.g., no tag displayed).'],
        ['Boundary', 'Data at Min/Max edges — tests inclusive/exclusive range logic.'],
        ['E2E', 'End-to-end state transition — multi-step or multi-time scenarios.'],
        ['Exception', 'Error handling scenarios.'],
        ['Permission', 'Role-based access scenarios.'],
        ['Security', 'Security risk scenarios.'],
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
        ['Pass', 'Actual result matches Expected Result.'],
        ['Fail', 'Actual result does NOT match Expected Result. Log a defect.'],
        ['Blocked', 'Cannot execute due to dependency failure (environment, data...).'],
        ['Pending', 'Not yet executed.'],
      ],
    },
    {
      section: 'DEFECT REPORTING',
      items: [
        ['Fields', 'Defect ID, Test Case ID, Page, Steps to Reproduce, Expected Result, Actual Result, Severity, Priority, Screenshot.'],
        ['Severity Scale', 'Sev-1: Core logic broken.\nSev-2: Data integrity broken.\nSev-3: UI/UX issue.\nSev-4: Cosmetic.'],
      ],
    },
  ]);

  let currentRow = 2;
  notes.forEach(({ section, items }) => {
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

    items.forEach(([label, content]) => {
      const iRow = ws.getRow(currentRow);
      iRow.height = content.split('\n').length * 18 + 10;
      hCell(iRow, 1, label, 'FFD9E1F2', 'FF1F3864');
      dCell(iRow, 2, content, 'FFFFFFFF', 'FF000000');
      iRow.commit();
      currentRow++;
    });

    const spRow = ws.getRow(currentRow);
    spRow.height = 6;
    spRow.commit();
    currentRow++;
  });

  ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 2 }];
}

// ============================================================
// MARKDOWN SUMMARY GENERATOR
// ============================================================
function generateMarkdownSummary(reqInfo, coverageMap, testCases) {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const ctByPage = {};
  const priByPage = {};
  testCases.forEach(tc => {
    if (!ctByPage[tc.Page]) ctByPage[tc.Page] = {};
    if (!priByPage[tc.Page]) priByPage[tc.Page] = {};
    ctByPage[tc.Page][tc.CaseType] = (ctByPage[tc.Page][tc.CaseType] || 0) + 1;
    priByPage[tc.Page][tc.Priority] = (priByPage[tc.Page][tc.Priority] || 0) + 1;
  });

  const pages = Object.keys(ctByPage);
  const allCT = ['Positive', 'Negative', 'Boundary', 'E2E', 'Exception', 'Permission', 'Security'];
  const allPri = ['High', 'Medium', 'Low'];

  const md = [];
  md.push(`# Test Case Summary\n`);
  md.push(`| **Field** | **Value** |`);
  md.push(`|---|---|`);
  md.push(`| Requirement ID | ${reqInfo.reqId || ''} |`);
  md.push(`| Feature | ${reqInfo.feature || ''} |`);
  md.push(`| Platform | ${reqInfo.platform || ''} |`);
  md.push(`| Scope | ${reqInfo.scope || ''} |`);
  md.push(`| Date Generated | ${today} |`);
  md.push(`| Total Test Cases | ${testCases.length} |`);
  md.push(`\n---\n`);
  md.push(`## 1. REQ Coverage Matrix\n`);
  md.push(`| REQ ID | Description | TC Count | Covered |`);
  md.push(`|---|---|---|---|`);
  Object.entries(coverageMap).forEach(([id, entry]) => {
    const total = entry.count || 0;
    md.push(`| ${id} | ${entry.desc} | ${total || '-'} | ${total > 0 ? 'Yes' : 'No'} |`);
  });
  md.push(`\n---\n`);
  md.push(`## 2. Case Type Distribution\n`);
  md.push(`| Case Type | ${pages.join(' | ')} | Total |`);
  md.push(`|---|${pages.map(() => '---|').join('')}---|`);
  allCT.forEach(ct => {
    const hasCt = pages.some(p => ctByPage[p][ct]);
    if (!hasCt) return;
    const vals = pages.map(p => ctByPage[p][ct] || 0);
    const total = vals.reduce((a, b) => a + b, 0);
    md.push(`| ${ct} | ${vals.join(' | ')} | ${total} |`);
  });
  md.push(`\n---\n`);
  md.push(`## 3. Priority Distribution\n`);
  md.push(`| Priority | ${pages.join(' | ')} | Total |`);
  md.push(`|---|${pages.map(() => '---|').join('')}---|`);
  allPri.forEach(pri => {
    const hasPri = pages.some(p => priByPage[p][pri]);
    if (!hasPri) return;
    const vals = pages.map(p => priByPage[p][pri] || 0);
    const total = vals.reduce((a, b) => a + b, 0);
    md.push(`| ${pri} | ${vals.join(' | ')} | ${total} |`);
  });
  md.push(`\n---\n`);
  md.push(`## 4. Test Case ID List\n`);
  md.push(`| ID | Case | Sub-case 1 | Sub-case 2 | Expected Result |`);
  md.push(`|---|---|---|---|---|`);
  testCases.forEach(tc => {
    md.push(`| ${tc.ID} | ${tc.Case} | ${tc.Subcase1} | ${tc.Subcase2 || ''} | ${tc.ExpectedResult} |`);
  });
  md.push(`\n---\n`);
  md.push(`## 5. Key Coverage Notes\n`);
  md.push(`- Review S2 - Req Coverage Matrix to confirm all requirements are covered.\n`);
  md.push(`- Review S4 - QC Execution Notes for detailed execution guidance.\n`);
  if (reqInfo.keyCoverageNotes) {
    reqInfo.keyCoverageNotes.forEach(note => md.push(`- ${note}\n`));
  }
  return md.join('\n');
}

// ============================================================
// MAIN
// ============================================================
function main() {
  buildOverviewSheet(wb, reqInfo, testCases);
  buildMatrixSheet(wb, coverageMap, testCases);
  buildTestCaseSheet(wb, testCases);
  buildNotesSheet(wb, reqInfo);

  // Tab colors
  wb.worksheets[0].properties.tabColor = { argb: 'FF1F3864' };
  wb.worksheets[1].properties.tabColor = { argb: 'FF2E75B6' };
  wb.worksheets[2].properties.tabColor = { argb: 'FF375623' };
  wb.worksheets[3].properties.tabColor = { argb: 'FF5C2D91' };

  const outputDir = path.join(
    __dirname, 'output',
    reqInfo.platform || 'General',
    reqInfo.pageGroup || reqInfo.feature || 'TestSuite'
  );

  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fileName = `${reqInfo.reqId}_${reqInfo.platform}_${(reqInfo.feature || 'TestSuite').replace(/\s+/g, ' ').trim().replace(/\s+/g, '-').toLowerCase()}`;
  const xlsxPath = path.join(outputDir, `${fileName}.xlsx`);
  const mdPath   = path.join(outputDir, `${fileName}_summary.md`);

  wb.xlsx.writeFile(xlsxPath).then(() => {
    console.log(`Saved: ${xlsxPath}`);
    const mdContent = generateMarkdownSummary(reqInfo, coverageMap, testCases);
    fs.writeFileSync(mdPath, mdContent, 'utf8');
    console.log(`Saved: ${mdPath}`);
    console.log(`Total test cases: ${testCases.length}`);
  }).catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}

main();
