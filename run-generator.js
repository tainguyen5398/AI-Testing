/**
 * Test Case Generator Script — US-8182
 * Feature: Display Cashback Tag in Bonus Column
 * Platform: Admin | Page Group: User Games Play
 */
'use strict';

const { generateTestCase } = require('./generate-testcases');
const path = require('path');

// ============================================================
// REQ INFO
// ============================================================
const reqInfo = {
  id: '8182',
  title: 'CASHBACK TAG — TEST CASE SUITE',
  feature: 'Display Cashback Tag in Bonus Column',
  featureSlug: 'Display_cashback_tag_bonus_column',
  platform: 'Admin',
  pageGroup: 'User Games Play',
};

// ============================================================
// TEST DATA
// ============================================================
const roundHistoryTC = [
  // ── ELIGIBILITY CONDITIONS ─────────────────────────────────
  {
    ID: 'RH-01',
    ReqID: 'REQ-C1, REQ-C2, REQ-C3, REQ-C5, REQ-C6, AC1',
    Page: 'User Games Play - Round History',
    Case: 'Display Cashback tag when all eligibility conditions are met',
    Subcase1: 'All 6 conditions satisfied: enrolled, active, valid date, bet in range, status active, game eligible',
    Subcase2: '',
    CaseType: 'Positive',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. User has an active cashback participation record.\n3. Cashback configuration is ACTIVE (status = Active).\n4. Current date is within [start_date, end_date].\n5. Game played is in the cashback-eligible game list.\n6. Max refund cap has not been exceeded.\n7. Min/Max bet range is configured (e.g., Min=10, Max=1000).',
    TestSteps:
      '1. Go to Admin > User Games Play.\n2. Select the target user.\n3. Navigate to Round History tab.\n4. Place or locate a qualifying bet (Min <= bet <= Max).\n5. Verify the Bonus column for the bet row.',
    ExpectedResult:
      'The bet row displays the "Cashback" tag in the Bonus column.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'RH-02',
    ReqID: 'REQ-C1, AC3',
    Page: 'User Games Play - Round History',
    Case: 'No Cashback tag when user is not enrolled in cashback program',
    Subcase1: 'REQ-C1 fails — user has no cashback participation record',
    Subcase2: '',
    CaseType: 'Negative',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. Cashback bonus is configured and ACTIVE.\n3. Target user has NO participation/enrollment record in the cashback program.',
    TestSteps:
      '1. Go to Admin > User Games Play.\n2. Select the non-enrolled user.\n3. Navigate to Round History tab.\n4. Locate any bet record.',
    ExpectedResult:
      'No bet in Round History displays the "Cashback" tag in the Bonus column.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'RH-03',
    ReqID: 'REQ-C2, AC3',
    Page: 'User Games Play - Round History',
    Case: 'No Cashback tag when cashback period has not started yet',
    Subcase1: 'REQ-C2 fails — current date is before cashback start_date',
    Subcase2: '',
    CaseType: 'Negative',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. Cashback start_date is in the future (today < start_date).\n3. User has a participation record but the program has not yet started.',
    TestSteps:
      '1. Go to Admin > User Games Play > Round History.\n2. Select the target user.\n3. Locate a bet placed before the cashback start_date.',
    ExpectedResult:
      'No "Cashback" tag in the Bonus column for bets placed before the cashback period starts.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'RH-04',
    ReqID: 'REQ-C2, AC3',
    Page: 'User Games Play - Round History',
    Case: 'No Cashback tag when cashback period has already ended',
    Subcase1: 'REQ-C2 fails — current date is after cashback end_date',
    Subcase2: '',
    CaseType: 'Negative',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. Cashback end_date is in the past (today > end_date).\n3. User has a participation record but the program has expired.',
    TestSteps:
      '1. Go to Admin > User Games Play > Round History.\n2. Select the target user.\n3. Locate a bet placed after the cashback end_date.',
    ExpectedResult:
      'No "Cashback" tag in the Bonus column for bets placed after the cashback period ended.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'RH-05',
    ReqID: 'REQ-C5, AC3',
    Page: 'User Games Play - Round History',
    Case: 'No Cashback tag when cashback status is set to Inactive',
    Subcase1: 'REQ-C5 fails — cashback status = Inactive (date range may be valid)',
    Subcase2: '',
    CaseType: 'Negative',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. Cashback status is set to "Inactive".\n3. User has an active participation record.',
    TestSteps:
      '1. Go to Admin > User Games Play > Round History.\n2. Select the target user.\n3. Locate any bet record.',
    ExpectedResult:
      'No "Cashback" tag in the Bonus column when cashback status is Inactive.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'RH-06',
    ReqID: 'REQ-C6, AC3',
    Page: 'User Games Play - Round History',
    Case: 'No Cashback tag when the game played is not in the eligible game list',
    Subcase1: 'REQ-C6 fails — game is excluded from cashback-eligible list',
    Subcase2: '',
    CaseType: 'Negative',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. Cashback is ACTIVE with valid date range.\n3. User is enrolled.\n4. The game played is NOT in the cashback-eligible game configuration list.',
    TestSteps:
      '1. Go to Admin > User Games Play > Round History.\n2. Select the target user.\n3. Locate a bet placed on a game that is excluded from the eligible list.\n4. Verify the Bonus column.',
    ExpectedResult:
      'No "Cashback" tag in the Bonus column for bets on non-eligible games.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'RH-07',
    ReqID: 'AC5',
    Page: 'User Games Play - Round History',
    Case: 'Display Cashback tag for a winning bet that meets all eligibility conditions',
    Subcase1: 'Bet placed: $100, Win amount: $50 (bet wins), all conditions met',
    Subcase2: '',
    CaseType: 'Positive',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. User is enrolled, cashback ACTIVE, date valid, game eligible, bet within range.',
    TestSteps:
      '1. Go to Admin > User Games Play > Round History.\n2. Place a bet and win (win amount > 0).\n3. Locate the bet in Round History.',
    ExpectedResult:
      'The winning bet row displays "Cashback" tag in the Bonus column. The Win amount (e.g., $50) is recorded separately.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'RH-08',
    ReqID: 'AC5',
    Page: 'User Games Play - Round History',
    Case: 'Display Cashback tag for a losing bet that meets all eligibility conditions',
    Subcase1: 'Bet placed: $100, Win amount: $0 (bet loses), all conditions met',
    Subcase2: '',
    CaseType: 'Positive',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. User is enrolled, cashback ACTIVE, date valid, game eligible, bet within range.',
    TestSteps:
      '1. Go to Admin > User Games Play > Round History.\n2. Place a bet and lose (win amount = $0).\n3. Locate the bet in Round History.',
    ExpectedResult:
      'The losing bet row also displays "Cashback" tag in the Bonus column (Win amount = $0 but tag is shown).',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  // ── BOUNDARY — BET AMOUNT ──────────────────────────────────
  {
    ID: 'RH-09',
    ReqID: 'REQ-C3',
    Page: 'User Games Play - Round History',
    Case: 'No Cashback tag when bet amount is strictly below Min threshold',
    Subcase1: 'REQ-C3 boundary: bet < Min (Min=10, bet=9.99)',
    Subcase2: '',
    CaseType: 'Boundary',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. Cashback ACTIVE with Min=10, Max=1000.\n3. User enrolled, game eligible, date valid, status active.',
    TestSteps:
      '1. Go to Admin > User Games Play > Round History.\n2. Place a bet of $9.99 (below Min).\n3. Locate the bet record.',
    ExpectedResult:
      'No "Cashback" tag in the Bonus column for bet below Min ($9.99 < Min $10).',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'RH-10',
    ReqID: 'REQ-C3',
    Page: 'User Games Play - Round History',
    Case: 'Display Cashback tag when bet amount equals Min threshold (inclusive boundary)',
    Subcase1: 'REQ-C3 boundary: bet = Min (Min=10, bet=10.00)',
    Subcase2: '',
    CaseType: 'Boundary',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. Cashback ACTIVE with Min=10, Max=1000.\n3. User enrolled, game eligible, date valid, status active, cap not reached.',
    TestSteps:
      '1. Go to Admin > User Games Play > Round History.\n2. Place a bet of exactly $10.00 (equal to Min).\n3. Locate the bet record.',
    ExpectedResult:
      '"Cashback" tag appears in the Bonus column for bet equal to Min ($10.00 is inclusive).',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'RH-11',
    ReqID: 'REQ-C3',
    Page: 'User Games Play - Round History',
    Case: 'Display Cashback tag when bet amount is strictly within Min and Max range',
    Subcase1: 'REQ-C3 boundary: Min < bet < Max (Min=10, bet=500, Max=1000)',
    Subcase2: '',
    CaseType: 'Boundary',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. Cashback ACTIVE, Min=10, Max=1000.\n3. User enrolled, game eligible, date valid, status active, cap not reached.',
    TestSteps:
      '1. Go to Admin > User Games Play > Round History.\n2. Place a bet of $500 (within range).\n3. Locate the bet record.',
    ExpectedResult:
      '"Cashback" tag appears in the Bonus column for bet within range ($10 < $500 < $1000).',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'RH-12',
    ReqID: 'REQ-C3',
    Page: 'User Games Play - Round History',
    Case: 'Display Cashback tag when bet amount equals Max threshold (inclusive boundary)',
    Subcase1: 'REQ-C3 boundary: bet = Max (Max=1000, bet=1000.00)',
    Subcase2: '',
    CaseType: 'Boundary',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. Cashback ACTIVE with Min=10, Max=1000.\n3. User enrolled, game eligible, date valid, status active, cap not reached.',
    TestSteps:
      '1. Go to Admin > User Games Play > Round History.\n2. Place a bet of exactly $1000.00 (equal to Max).\n3. Locate the bet record.',
    ExpectedResult:
      '"Cashback" tag appears in the Bonus column for bet equal to Max ($1000.00 is inclusive).',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'RH-13',
    ReqID: 'REQ-C3',
    Page: 'User Games Play - Round History',
    Case: 'No Cashback tag when bet amount strictly exceeds Max threshold',
    Subcase1: 'REQ-C3 boundary: bet > Max (Max=1000, bet=1000.01)',
    Subcase2: '',
    CaseType: 'Boundary',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. Cashback ACTIVE with Min=10, Max=1000.\n3. User enrolled, game eligible, date valid, status active.',
    TestSteps:
      '1. Go to Admin > User Games Play > Round History.\n2. Place a bet of $1000.01 (above Max).\n3. Locate the bet record.',
    ExpectedResult:
      'No "Cashback" tag in the Bonus column for bet above Max ($1000.01 > Max $1000).',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  // ── ACCEPTANCE CRITERIA ────────────────────────────────────
  {
    ID: 'RH-14',
    ReqID: 'AC4',
    Page: 'User Games Play - Round History',
    Case: 'No Cashback tag for pre-release historical bet records',
    Subcase1: 'AC4: Historical records created before feature release date',
    Subcase2: '',
    CaseType: 'Positive',
    Priority: 'Medium',
    Preconditions:
      '1. Admin is logged in.\n2. Cashback tag feature has been released.\n3. Round History contains bet records with timestamps BEFORE the feature release date.\n4. These historical bets otherwise satisfy all eligibility conditions.',
    TestSteps:
      '1. Go to Admin > User Games Play > Round History.\n2. Filter or locate bets with timestamps before the feature release date.\n3. Verify these bets otherwise meet all 6 conditions.',
    ExpectedResult:
      'Pre-release historical bet records do NOT display "Cashback" tag.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'RH-15',
    ReqID: 'AC1, AC2, DI',
    Page: 'User Games Play - Round History',
    Case: 'Tag displayed in Round History matches Transaction History for the same qualifying bet',
    Subcase1: 'DI: Cross-view consistency for a single qualifying bet across Round and Transaction History',
    Subcase2: '',
    CaseType: 'Positive',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. User has at least one qualifying bet (all conditions met).\n3. Both Round History and Transaction History tabs are accessible.',
    TestSteps:
      '1. Go to Admin > User Games Play > Round History.\n2. Identify the bet ID of a qualifying bet.\n3. Navigate to Transaction History.\n4. Locate the same bet ID and compare Bonus column.',
    ExpectedResult:
      'The "Cashback" tag appears in the Bonus column in BOTH Round History and Transaction History for the same bet.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'RH-16',
    ReqID: 'AC1, AC2, DI',
    Page: 'User Games Play - Round History',
    Case: 'No Cashback tag shown in Round History when bet does not qualify — confirmed no tag in Transaction History',
    Subcase1: 'DI: Cross-view consistency for a non-qualifying bet',
    Subcase2: '',
    CaseType: 'Positive',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. User has both qualifying and non-qualifying bets.\n3. Both Round History and Transaction History are accessible.',
    TestSteps:
      '1. Go to Admin > User Games Play > Round History.\n2. Identify a non-qualifying bet ID.\n3. Navigate to Transaction History.\n4. Locate the same bet ID and verify Bonus column.',
    ExpectedResult:
      'Non-qualifying bet: NO "Cashback" tag in BOTH Round History and Transaction History.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'RH-17',
    ReqID: 'AC1',
    Page: 'User Games Play - Round History',
    Case: 'Bonus column displays the exact text "Cashback" for qualifying bet',
    Subcase1: 'UI validation: exact tag text content and capitalization',
    Subcase2: '',
    CaseType: 'Positive',
    Priority: 'Medium',
    Preconditions:
      '1. Admin is logged in.\n2. At least one qualifying bet exists in Round History.',
    TestSteps:
      '1. Go to Admin > User Games Play > Round History.\n2. Locate a bet with a Cashback tag.\n3. Examine the exact text in the Bonus column.',
    ExpectedResult:
      'Tag text is exactly "Cashback" — correct capitalization, no extra spaces, no special characters or prefixes.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  // ── E2E STATE TRANSITIONS ──────────────────────────────────
  {
    ID: 'RH-18',
    ReqID: 'E2E-1',
    Page: 'User Games Play - Round History',
    Case: 'Cashback tag only for bets placed AFTER user enrolls mid-session',
    Subcase1: 'E2E: User joins cashback while already in an active game session',
    Subcase2: '',
    CaseType: 'E2E',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. User is already in an active game session.\n3. Admin enrolls user in cashback program while session is ongoing.\n4. Cashback is active, game eligible, bet within Min/Max.',
    TestSteps:
      '1. Go to Admin > User Games Play > Round History.\n2. Identify bets placed BEFORE enrollment.\n3. Identify bets placed AFTER enrollment.\n4. Verify the Bonus column for each.',
    ExpectedResult:
      'Bets placed AFTER enrollment: "Cashback" tag shown. Bets placed BEFORE enrollment: NO tag.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'RH-19',
    ReqID: 'E2E-2, AC3',
    Page: 'User Games Play - Round History',
    Case: 'Cashback tag only for bets placed BEFORE cashback expires — no retroactive tagging',
    Subcase1: 'E2E: Cashback end_date passes during an active user session',
    Subcase2: '',
    CaseType: 'E2E',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. User has an active game session with multiple bets.\n3. Cashback is about to expire (end_date will pass during the session).',
    TestSteps:
      '1. Go to Admin > User Games Play > Round History.\n2. Identify bets placed BEFORE the cashback expiry.\n3. Identify bets placed AFTER the expiry.\n4. Verify Bonus column for each.',
    ExpectedResult:
      'Bets placed BEFORE expiry: "Cashback" tag shown. Bets placed AFTER expiry: NO tag. No retroactive tagging applied.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'RH-20',
    ReqID: 'E2E-3',
    Page: 'User Games Play - Round History',
    Case: 'Cashback tag appears for bets placed after previously inactive cashback is reactivated',
    Subcase1: 'E2E: Cashback status changed from Inactive to Active during ongoing engagement',
    Subcase2: '',
    CaseType: 'E2E',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. Cashback was previously Inactive.\n3. Admin reactivates the cashback program.\n4. User has an active participation record.',
    TestSteps:
      '1. Go to Admin > User Games Play > Round History.\n2. Identify bets placed BEFORE reactivation.\n3. Place or locate bets AFTER reactivation.\n4. Check the Bonus column.',
    ExpectedResult:
      'Bets placed AFTER reactivation: "Cashback" tag shown. Bets placed before: NO tag.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'RH-21',
    ReqID: 'E2E-4, AC3',
    Page: 'User Games Play - Round History',
    Case: 'Already-placed qualifying bets retain tag when user cancels cashback enrollment',
    Subcase1: 'E2E: User cancels enrollment after placing a qualifying bet',
    Subcase2: '',
    CaseType: 'E2E',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. User had a qualifying bet that already received "Cashback" tag.\n3. User or Admin cancels/removes the cashback enrollment.',
    TestSteps:
      '1. Go to Admin > User Games Play > Round History.\n2. Verify the already-placed qualifying bet still shows "Cashback" tag.\n3. Place a new bet after cancellation.\n4. Verify Bonus column for the new bet.',
    ExpectedResult:
      'Already-placed qualifying bet: tag remains unchanged. New bets placed after cancellation: NO "Cashback" tag.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'RH-22',
    ReqID: 'E2E-5',
    Page: 'User Games Play - Round History',
    Case: 'Qualifying bets placed before feature release retain no tag after feature goes live',
    Subcase1: 'E2E: Feature released while user has active cashback and active enrollment',
    Subcase2: '',
    CaseType: 'E2E',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. Feature is now live (after release).\n3. User has qualifying bets placed before the release date.',
    TestSteps:
      '1. Go to Admin > User Games Play > Round History.\n2. Filter for bets placed before feature release.\n3. Verify these bets do not receive retroactive Cashback tag.',
    ExpectedResult:
      'Pre-release bets do NOT receive "Cashback" tag retroactively. Only bets placed after feature release are eligible.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'RH-23',
    ReqID: 'E2E-6',
    Page: 'User Games Play - Round History',
    Case: 'Existing bet tag status remains unchanged when Admin updates Min/Max configuration',
    Subcase1: 'E2E: Min/Max bet range config changed after qualifying bets are already recorded',
    Subcase2: '',
    CaseType: 'E2E',
    Priority: 'Medium',
    Preconditions:
      '1. Admin is logged in.\n2. Qualifying bets were already recorded and tagged with original Min/Max.\n3. Admin changes the Min or Max value in the cashback configuration.',
    TestSteps:
      '1. Go to Admin > User Games Play > Round History.\n2. Locate previously recorded bet records.\n3. Verify their tag status after the config change.',
    ExpectedResult:
      'Existing bet records retain their original tag status regardless of Min/Max configuration changes.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'RH-24',
    ReqID: 'E2E-7',
    Page: 'User Games Play - Round History',
    Case: 'Existing bet tag status remains unchanged when Admin removes game from eligible list',
    Subcase1: 'E2E: Game removed from cashback-eligible list after qualifying bets are already recorded',
    Subcase2: '',
    CaseType: 'E2E',
    Priority: 'Medium',
    Preconditions:
      '1. Admin is logged in.\n2. Qualifying bets on a game were already recorded and tagged.\n3. Admin removes that game from the eligible game list.',
    TestSteps:
      '1. Go to Admin > User Games Play > Round History.\n2. Locate bets placed on the game before removal.\n3. Verify their tag status.',
    ExpectedResult:
      'Already-recorded bet records retain their original tag status even after the game is removed from the eligible list.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  // ── EXCEPTION ──────────────────────────────────────────────
  {
    ID: 'RH-25',
    ReqID: 'E2E-1, AC3',
    Page: 'User Games Play - Round History',
    Case: 'No Cashback tag for bets placed after cashback enrollment is cancelled mid-session',
    Subcase1: 'Exception: User cancels enrollment mid-session',
    Subcase2: '',
    CaseType: 'Exception',
    Priority: 'Medium',
    Preconditions:
      '1. Admin is logged in.\n2. User is in an active game session with cashback active.\n3. User or Admin cancels the cashback enrollment mid-session.\n4. User continues playing.',
    TestSteps:
      '1. Go to Admin > User Games Play > Round History.\n2. Locate bets placed after the cancellation point.\n3. Verify the Bonus column.',
    ExpectedResult:
      'Bets placed after cancellation: NO "Cashback" tag. Only bets placed before cancellation are tagged.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'RH-26',
    ReqID: 'REQ-C3, DI',
    Page: 'User Games Play - Round History',
    Case: 'No Cashback tag when bet is placed at exactly the same moment as cashback expires',
    Subcase1: 'Exception: Race condition — bet placed at exact expiry timestamp',
    Subcase2: '',
    CaseType: 'Exception',
    Priority: 'Low',
    Preconditions:
      '1. Admin is logged in.\n2. Cashback end_date is about to expire.\n3. User places a bet at the exact moment the cashback expires.',
    TestSteps:
      '1. Go to Admin > User Games Play > Round History.\n2. Identify the bet placed at the boundary timestamp.\n3. Verify the Bonus column.',
    ExpectedResult:
      'System handles the edge case consistently — bet is either tagged or not based on timestamp precision.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
];

const transactionHistoryTC = [
  // ── ELIGIBILITY CONDITIONS ─────────────────────────────────
  {
    ID: 'TH-01',
    ReqID: 'REQ-C1, REQ-C2, REQ-C3, REQ-C5, REQ-C6, AC2',
    Page: 'User Games Play - Transaction History',
    Case: 'Display Cashback tag for both Win and Bet transactions when all conditions are met',
    Subcase1: 'All 6 conditions satisfied for a winning bet — txn "Win" and txn "Bet" both generated',
    Subcase2: '',
    CaseType: 'Positive',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. User is enrolled, cashback ACTIVE, date valid, game eligible, bet within range.\n3. The bet wins (win amount > 0), generating both "Win" and "Bet" transactions simultaneously.',
    TestSteps:
      '1. Go to Admin > User Games Play.\n2. Select the target user.\n3. Navigate to Transaction History tab.\n4. Locate the qualifying bet — find both txn "Win" and txn "Bet" rows.',
    ExpectedResult:
      'Both the "Win" transaction row and the "Bet" transaction row display "Cashback" tag in the Bonus column.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'TH-02',
    ReqID: 'AC5, AC2',
    Page: 'User Games Play - Transaction History',
    Case: 'Display Cashback tag for Bet transaction of a losing bet (Win txn not generated)',
    Subcase1: 'Bet placed: $100, loses — only txn "Bet" generated (no "Win" txn), all conditions met',
    Subcase2: '',
    CaseType: 'Positive',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. User is enrolled, cashback ACTIVE, date valid, game eligible, bet within range.\n3. The bet loses (win amount = 0), generating only the "Bet" transaction.',
    TestSteps:
      '1. Go to Admin > User Games Play > Transaction History.\n2. Locate a losing bet (win amount = $0) — find the txn "Bet" row only.',
    ExpectedResult:
      'The "Bet" transaction row displays "Cashback" tag in the Bonus column. No "Win" txn row exists for this bet.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'TH-03',
    ReqID: 'REQ-C1, AC3',
    Page: 'User Games Play - Transaction History',
    Case: 'No Cashback tag when user is not enrolled in cashback program',
    Subcase1: 'REQ-C1 fails — user has no cashback participation record',
    Subcase2: '',
    CaseType: 'Negative',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. Cashback bonus is configured and ACTIVE.\n3. Target user is NOT enrolled in the cashback program.',
    TestSteps:
      '1. Go to Admin > User Games Play > Transaction History.\n2. Select the non-enrolled user.\n3. Locate any transaction.',
    ExpectedResult:
      'No transaction in Transaction History displays the "Cashback" tag in the Bonus column.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'TH-04',
    ReqID: 'REQ-C2, AC3',
    Page: 'User Games Play - Transaction History',
    Case: 'No Cashback tag when cashback period has not started yet',
    Subcase1: 'REQ-C2 fails — current date is before cashback start_date',
    Subcase2: '',
    CaseType: 'Negative',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. Cashback start_date is in the future.\n3. User has a participation record but the program has not started.',
    TestSteps:
      '1. Go to Admin > User Games Play > Transaction History.\n2. Select the target user.\n3. Locate transactions placed before the start_date.',
    ExpectedResult:
      'No "Cashback" tag for transactions placed before the cashback period starts.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'TH-05',
    ReqID: 'REQ-C2, AC3',
    Page: 'User Games Play - Transaction History',
    Case: 'No Cashback tag when cashback period has already ended',
    Subcase1: 'REQ-C2 fails — current date is after cashback end_date',
    Subcase2: '',
    CaseType: 'Negative',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. Cashback end_date is in the past.\n3. User has a participation record but the program has expired.',
    TestSteps:
      '1. Go to Admin > User Games Play > Transaction History.\n2. Select the target user.\n3. Locate transactions placed after the end_date.',
    ExpectedResult:
      'No "Cashback" tag for transactions placed after the cashback period ended.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'TH-06',
    ReqID: 'REQ-C5, AC3',
    Page: 'User Games Play - Transaction History',
    Case: 'No Cashback tag when cashback status is set to Inactive',
    Subcase1: 'REQ-C5 fails — cashback status = Inactive',
    Subcase2: '',
    CaseType: 'Negative',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. Cashback status is set to "Inactive".\n3. User has an active participation record.',
    TestSteps:
      '1. Go to Admin > User Games Play > Transaction History.\n2. Select the target user.\n3. Locate any transaction.',
    ExpectedResult:
      'No "Cashback" tag in the Bonus column when cashback status is Inactive.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'TH-07',
    ReqID: 'REQ-C6, AC3',
    Page: 'User Games Play - Transaction History',
    Case: 'No Cashback tag when the game is not in the eligible game list',
    Subcase1: 'REQ-C6 fails — game is excluded from the cashback-eligible configuration',
    Subcase2: '',
    CaseType: 'Negative',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. Cashback is ACTIVE with valid date range.\n3. User is enrolled.\n4. The game played is NOT in the eligible game list.',
    TestSteps:
      '1. Go to Admin > User Games Play > Transaction History.\n2. Select the target user.\n3. Locate a transaction on a non-eligible game.',
    ExpectedResult:
      'No "Cashback" tag in the Bonus column for transactions on non-eligible games.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  // ── TRANSACTION TYPE COVERAGE ──────────────────────────────
  {
    ID: 'TH-08',
    ReqID: 'AC2, DI',
    Page: 'User Games Play - Transaction History',
    Case: 'Both Win and Bet transactions of the same bet show identical Cashback tag',
    Subcase1: 'Winning bet generates txn "Win" and txn "Bet" simultaneously — tag must appear on both',
    Subcase2: '',
    CaseType: 'Positive',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. User places a winning bet that qualifies for cashback (win amount > 0, all conditions met).',
    TestSteps:
      '1. Go to Admin > User Games Play > Transaction History.\n2. Locate the qualifying winning bet — find txn "Win" and txn "Bet".\n3. Compare the Bonus column for both transaction rows.',
    ExpectedResult:
      'Both txn "Win" and txn "Bet" rows display "Cashback" tag in the Bonus column with identical tag text.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'TH-09',
    ReqID: 'AC2, DI',
    Page: 'User Games Play - Transaction History',
    Case: 'Losing bet generates only Bet transaction — Cashback tag appears only on Bet row',
    Subcase1: 'Bet amount: $100, win = $0 — only txn "Bet" generated, no txn "Win"',
    Subcase2: '',
    CaseType: 'Positive',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. User places a losing bet that qualifies for cashback (all conditions met).',
    TestSteps:
      '1. Go to Admin > User Games Play > Transaction History.\n2. Locate the losing bet — verify only txn "Bet" exists.\n3. Check the Bonus column.',
    ExpectedResult:
      'Only txn "Bet" row exists and displays "Cashback" tag. No txn "Win" row is generated for this bet.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  // ── BOUNDARY — BET AMOUNT ──────────────────────────────────
  {
    ID: 'TH-10',
    ReqID: 'REQ-C3',
    Page: 'User Games Play - Transaction History',
    Case: 'No Cashback tag when bet amount is strictly below Min threshold',
    Subcase1: 'REQ-C3 boundary: bet < Min (Min=10, bet=9.99)',
    Subcase2: '',
    CaseType: 'Boundary',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. Cashback ACTIVE with Min=10, Max=1000.\n3. User enrolled, game eligible, date valid, status active.',
    TestSteps:
      '1. Go to Admin > User Games Play > Transaction History.\n2. Locate a transaction with bet amount $9.99 (below Min).',
    ExpectedResult:
      'No "Cashback" tag in the Bonus column for bet below Min ($9.99 < Min $10).',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'TH-11',
    ReqID: 'REQ-C3',
    Page: 'User Games Play - Transaction History',
    Case: 'Display Cashback tag when bet amount equals Min threshold (inclusive)',
    Subcase1: 'REQ-C3 boundary: bet = Min (Min=10, bet=10.00)',
    Subcase2: '',
    CaseType: 'Boundary',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. Cashback ACTIVE with Min=10, Max=1000.\n3. User enrolled, game eligible, date valid, status active, cap not reached.',
    TestSteps:
      '1. Go to Admin > User Games Play > Transaction History.\n2. Locate a transaction with bet amount exactly $10.00 (equal to Min).',
    ExpectedResult:
      '"Cashback" tag appears in the Bonus column for bet equal to Min ($10.00 is inclusive).',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'TH-12',
    ReqID: 'REQ-C3',
    Page: 'User Games Play - Transaction History',
    Case: 'Display Cashback tag when bet amount is strictly within Min and Max range',
    Subcase1: 'REQ-C3 boundary: Min < bet < Max (Min=10, bet=500, Max=1000)',
    Subcase2: '',
    CaseType: 'Boundary',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. Cashback ACTIVE, Min=10, Max=1000.\n3. User enrolled, game eligible, date valid, status active, cap not reached.',
    TestSteps:
      '1. Go to Admin > User Games Play > Transaction History.\n2. Locate a transaction with bet $500 (within range).',
    ExpectedResult:
      '"Cashback" tag appears in the Bonus column for bet within range ($10 < $500 < $1000).',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'TH-13',
    ReqID: 'REQ-C3',
    Page: 'User Games Play - Transaction History',
    Case: 'Display Cashback tag when bet amount equals Max threshold (inclusive)',
    Subcase1: 'REQ-C3 boundary: bet = Max (Max=1000, bet=1000.00)',
    Subcase2: '',
    CaseType: 'Boundary',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. Cashback ACTIVE with Min=10, Max=1000.\n3. User enrolled, game eligible, date valid, status active, cap not reached.',
    TestSteps:
      '1. Go to Admin > User Games Play > Transaction History.\n2. Locate a transaction with bet amount exactly $1000.00 (equal to Max).',
    ExpectedResult:
      '"Cashback" tag appears in the Bonus column for bet equal to Max ($1000.00 is inclusive).',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'TH-14',
    ReqID: 'REQ-C3',
    Page: 'User Games Play - Transaction History',
    Case: 'No Cashback tag when bet amount strictly exceeds Max threshold',
    Subcase1: 'REQ-C3 boundary: bet > Max (Max=1000, bet=1000.01)',
    Subcase2: '',
    CaseType: 'Boundary',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. Cashback ACTIVE with Min=10, Max=1000.\n3. User enrolled, game eligible, date valid, status active.',
    TestSteps:
      '1. Go to Admin > User Games Play > Transaction History.\n2. Locate a transaction with bet $1000.01 (above Max).',
    ExpectedResult:
      'No "Cashback" tag in the Bonus column for bet above Max ($1000.01 > Max $1000).',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  // ── ACCEPTANCE CRITERIA ────────────────────────────────────
  {
    ID: 'TH-15',
    ReqID: 'AC4',
    Page: 'User Games Play - Transaction History',
    Case: 'No Cashback tag for pre-release historical transactions',
    Subcase1: 'AC4: Historical records created before feature release',
    Subcase2: '',
    CaseType: 'Positive',
    Priority: 'Medium',
    Preconditions:
      '1. Admin is logged in.\n2. Cashback tag feature has been released.\n3. Transaction History contains records with timestamps before the feature release date.',
    TestSteps:
      '1. Go to Admin > User Games Play > Transaction History.\n2. Filter or locate transactions before feature release date.\n3. Verify these transactions otherwise meet all 6 conditions.',
    ExpectedResult:
      'Pre-release transaction records do NOT display "Cashback" tag.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'TH-16',
    ReqID: 'AC1, AC2, DI',
    Page: 'User Games Play - Transaction History',
    Case: 'Tag displayed in Transaction History matches Round History for the same qualifying bet',
    Subcase1: 'DI: Cross-view consistency — same bet has identical tag status in both views',
    Subcase2: '',
    CaseType: 'Positive',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. User has at least one qualifying bet in both views.\n3. Both Round History and Transaction History tabs are accessible.',
    TestSteps:
      '1. Go to Admin > User Games Play > Round History.\n2. Identify a qualifying bet ID.\n3. Navigate to Transaction History.\n4. Locate the same bet ID and compare Bonus column.',
    ExpectedResult:
      'The "Cashback" tag appears in BOTH Round History and Transaction History for the same qualifying bet.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'TH-17',
    ReqID: 'AC1, AC2, DI',
    Page: 'User Games Play - Transaction History',
    Case: 'No Cashback tag in Transaction History for non-qualifying bet — confirmed consistent with Round History',
    Subcase1: 'DI: Cross-view consistency — non-qualifying bet has no tag in both views',
    Subcase2: '',
    CaseType: 'Positive',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. User has both qualifying and non-qualifying transactions.\n3. Both views are accessible.',
    TestSteps:
      '1. Go to Admin > User Games Play > Transaction History.\n2. Identify a non-qualifying transaction ID.\n3. Cross-reference with Round History.\n4. Verify tag status.',
    ExpectedResult:
      'Non-qualifying bet: NO "Cashback" tag in BOTH Transaction History and Round History.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'TH-18',
    ReqID: 'AC2',
    Page: 'User Games Play - Transaction History',
    Case: 'Bonus column displays the exact text "Cashback" for qualifying transactions',
    Subcase1: 'UI validation: exact tag text content and capitalization for Win and Bet txn rows',
    Subcase2: '',
    CaseType: 'Positive',
    Priority: 'Medium',
    Preconditions:
      '1. Admin is logged in.\n2. At least one qualifying winning bet exists (generating Win and Bet txn).',
    TestSteps:
      '1. Go to Admin > User Games Play > Transaction History.\n2. Locate qualifying transactions with the Cashback tag.\n3. Examine the exact text in the Bonus column for both Win and Bet txn rows.',
    ExpectedResult:
      'Tag text is exactly "Cashback" on BOTH txn rows — correct capitalization, no extra spaces or characters.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  // ── E2E STATE TRANSITIONS ──────────────────────────────────
  {
    ID: 'TH-19',
    ReqID: 'E2E-1',
    Page: 'User Games Play - Transaction History',
    Case: 'Cashback tag only for Win and Bet transactions placed AFTER user enrolls mid-session',
    Subcase1: 'E2E: User joins cashback while already in an active game session',
    Subcase2: '',
    CaseType: 'E2E',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. User is already playing.\n3. Admin enrolls user in cashback mid-session.\n4. User continues placing bets after enrollment.',
    TestSteps:
      '1. Go to Admin > User Games Play > Transaction History.\n2. Identify transactions placed BEFORE enrollment (no tag expected).\n3. Identify transactions placed AFTER enrollment.\n4. Verify Bonus column for both Win and Bet txn rows.',
    ExpectedResult:
      'Transactions placed AFTER enrollment: both Win and Bet txn rows show "Cashback" tag. Transactions before enrollment: NO tag on either txn type.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'TH-20',
    ReqID: 'E2E-2, AC3',
    Page: 'User Games Play - Transaction History',
    Case: 'Cashback tag only for transactions placed BEFORE cashback expires — no retroactive tagging',
    Subcase1: 'E2E: Cashback end_date passes during an active user session',
    Subcase2: '',
    CaseType: 'E2E',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. User has an active session with multiple bets.\n3. Cashback is about to expire during the session.',
    TestSteps:
      '1. Go to Admin > User Games Play > Transaction History.\n2. Identify transactions placed BEFORE expiry.\n3. Identify transactions placed AFTER expiry.\n4. Verify Bonus column for each (both Win and Bet txn types where applicable).',
    ExpectedResult:
      'Transactions before expiry: both Win and Bet txn rows show "Cashback" tag. Transactions after expiry: NO tag. No retroactive tagging.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'TH-21',
    ReqID: 'E2E-3',
    Page: 'User Games Play - Transaction History',
    Case: 'Cashback tag appears for transactions after cashback is reactivated from Inactive state',
    Subcase1: 'E2E: Cashback status changed from Inactive to Active during ongoing engagement',
    Subcase2: '',
    CaseType: 'E2E',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. Cashback was previously Inactive.\n3. Admin reactivates the cashback program.\n4. User has an active participation record.',
    TestSteps:
      '1. Go to Admin > User Games Play > Transaction History.\n2. Identify transactions placed BEFORE reactivation.\n3. Place or locate transactions AFTER reactivation.\n4. Verify Bonus column for both Win and Bet txn types.',
    ExpectedResult:
      'Transactions after reactivation: both Win and Bet txn rows show "Cashback" tag. Transactions before reactivation: NO tag.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'TH-22',
    ReqID: 'E2E-4, AC3',
    Page: 'User Games Play - Transaction History',
    Case: 'Existing qualifying transactions retain tag when user cancels cashback enrollment',
    Subcase1: 'E2E: User cancels enrollment after placing qualifying bets',
    Subcase2: '',
    CaseType: 'E2E',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. User had qualifying transactions that already received "Cashback" tag.\n3. User or Admin cancels the cashback enrollment.\n4. User continues placing new bets.',
    TestSteps:
      '1. Go to Admin > User Games Play > Transaction History.\n2. Verify the existing qualifying transactions still show "Cashback" tag on both Win and Bet txn rows.\n3. Identify new transactions placed after cancellation.\n4. Verify Bonus column for new transactions.',
    ExpectedResult:
      'Existing qualifying transactions: tag unchanged. New transactions after cancellation: NO "Cashback" tag on either txn type.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'TH-23',
    ReqID: 'E2E-5',
    Page: 'User Games Play - Transaction History',
    Case: 'Pre-release transactions do not receive retroactive Cashback tag after feature goes live',
    Subcase1: 'E2E: Feature released while user has active cashback enrollment',
    Subcase2: '',
    CaseType: 'E2E',
    Priority: 'High',
    Preconditions:
      '1. Admin is logged in.\n2. Feature is now live.\n3. User has qualifying transactions placed before the release date.',
    TestSteps:
      '1. Go to Admin > User Games Play > Transaction History.\n2. Filter for transactions placed before feature release.\n3. Verify these transactions do not receive retroactive Cashback tag.',
    ExpectedResult:
      'Pre-release transactions do NOT receive "Cashback" tag retroactively. Only transactions after feature release are eligible.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'TH-24',
    ReqID: 'E2E-6',
    Page: 'User Games Play - Transaction History',
    Case: 'Existing transaction tag status remains unchanged when Admin updates Min/Max configuration',
    Subcase1: 'E2E: Min/Max bet range config changed after qualifying transactions are already recorded',
    Subcase2: '',
    CaseType: 'E2E',
    Priority: 'Medium',
    Preconditions:
      '1. Admin is logged in.\n2. Qualifying transactions were recorded with original Min/Max.\n3. Admin changes Min or Max value.',
    TestSteps:
      '1. Go to Admin > User Games Play > Transaction History.\n2. Locate previously recorded transactions.\n3. Verify tag status on both Win and Bet txn rows after the config change.',
    ExpectedResult:
      'Existing transaction records retain their original tag status regardless of Min/Max configuration changes.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'TH-25',
    ReqID: 'E2E-7',
    Page: 'User Games Play - Transaction History',
    Case: 'Existing transaction tag status remains unchanged when Admin removes game from eligible list',
    Subcase1: 'E2E: Game removed from cashback-eligible list after qualifying transactions are recorded',
    Subcase2: '',
    CaseType: 'E2E',
    Priority: 'Medium',
    Preconditions:
      '1. Admin is logged in.\n2. Qualifying transactions on a game were already tagged.\n3. Admin removes that game from the eligible game list.',
    TestSteps:
      '1. Go to Admin > User Games Play > Transaction History.\n2. Locate transactions on the game before removal.\n3. Verify tag status on both Win and Bet txn rows.',
    ExpectedResult:
      'Already-recorded transaction records retain their original tag status even after the game is removed from the eligible list.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  // ── EXCEPTION ──────────────────────────────────────────────
  {
    ID: 'TH-26',
    ReqID: 'E2E-1, AC3',
    Page: 'User Games Play - Transaction History',
    Case: 'No Cashback tag for transactions placed after cashback enrollment is cancelled mid-session',
    Subcase1: 'Exception: User cancels enrollment mid-session',
    Subcase2: '',
    CaseType: 'Exception',
    Priority: 'Medium',
    Preconditions:
      '1. Admin is logged in.\n2. User is in an active session with cashback active.\n3. User or Admin cancels enrollment mid-session.\n4. User continues placing bets.',
    TestSteps:
      '1. Go to Admin > User Games Play > Transaction History.\n2. Locate transactions placed after cancellation point.\n3. Verify Bonus column for both Win and Bet txn types.',
    ExpectedResult:
      'Transactions placed after cancellation: NO "Cashback" tag on either txn type. Only transactions before cancellation are tagged.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
  {
    ID: 'TH-27',
    ReqID: 'REQ-C3, DI',
    Page: 'User Games Play - Transaction History',
    Case: 'Consistent handling of Win and Bet transactions when bet amount equals boundary value',
    Subcase1: 'Exception: Both txn types at exact Min/Max boundary — consistent tag logic',
    Subcase2: '',
    CaseType: 'Exception',
    Priority: 'Low',
    Preconditions:
      '1. Admin is logged in.\n2. Cashback ACTIVE with Min=10, Max=1000.\n3. User places a winning bet of exactly $10.00 (Min boundary).',
    TestSteps:
      '1. Go to Admin > User Games Play > Transaction History.\n2. Locate the winning bet at exactly $10.00.\n3. Verify both txn "Win" and txn "Bet" rows.',
    ExpectedResult:
      'Both txn "Win" and txn "Bet" rows show identical tag behavior at the Min boundary. No discrepancy between the two transaction types for the same bet.',
    Status: '',
    ExecuteName: '',
    ExecuteDate: '',
  },
];

// Combine all test cases
const allTestCases = [...roundHistoryTC, ...transactionHistoryTC];

// ============================================================
// COVERAGE MAP
// ============================================================
const coverageMap = {
  // Eligibility Conditions
  'REQ-C1':       { desc: 'Condition 1: User enrolled in cashback program', count: 2, covered: true },
  'REQ-C2':       { desc: 'Condition 2: Cashback within valid date range (start_date <= today <= end_date)', count: 4, covered: true },
  'REQ-C3':       { desc: 'Condition 3: Bet amount within Min <= bet <= Max range', count: 10, covered: true },
  'REQ-C5':       { desc: 'Condition 5: Cashback status = Active', count: 2, covered: true },
  'REQ-C6':       { desc: 'Condition 6: Game in cashback-eligible game list', count: 2, covered: true },
  // Acceptance Criteria
  'AC1':          { desc: 'AC1: Cashback tag in Round History when cashback active', count: 5, covered: true },
  'AC2':          { desc: 'AC2: Cashback tag in Transaction History (Win and Bet txn)', count: 6, covered: true },
  'AC3':          { desc: 'AC3: NO tag for bets before start / after end / inactive / not enrolled', count: 8, covered: true },
  'AC4':          { desc: 'AC4: NO tag for pre-release historical bet/transaction records', count: 2, covered: true },
  'AC5':          { desc: 'AC5: Tag applied to both winning and losing bets', count: 4, covered: true },
  // E2E State Transitions
  'E2E-1':        { desc: 'E2E: User enrolls mid-session — post-enrollment bets/transactions only', count: 3, covered: true },
  'E2E-2':        { desc: 'E2E: Cashback expires mid-session — no retroactive tagging', count: 2, covered: true },
  'E2E-3':        { desc: 'E2E: Cashback reactivated from Inactive to Active', count: 2, covered: true },
  'E2E-4':        { desc: 'E2E: User cancels enrollment — existing tags/transactions unchanged', count: 2, covered: true },
  'E2E-5':        { desc: 'E2E: Feature release — pre-release data not retroactively tagged', count: 2, covered: true },
  'E2E-6':        { desc: 'E2E: Admin changes Min/Max config — existing records unchanged', count: 2, covered: true },
  'E2E-7':        { desc: 'E2E: Admin removes game from eligible list — existing records unchanged', count: 2, covered: true },
  // Data Integrity
  'DI':           { desc: 'DI: Tag consistency between Round History and Transaction History (Win and Bet txn)', count: 5, covered: true },
  // Full US coverage
  'US-8182':      { desc: 'Full US-8182 coverage: All conditions + AC + E2E + DI', count: 0, covered: true },
  // Combined
  'REQ-C1, REQ-C2, REQ-C3, REQ-C5, REQ-C6, AC1':
                   { desc: 'Combined: All 6 conditions met + AC1 (RH tag)', count: 1, covered: true },
  'REQ-C1, REQ-C2, REQ-C3, REQ-C5, REQ-C6, AC2':
                   { desc: 'Combined: All 6 conditions met + AC2 (TH tag)', count: 1, covered: true },
  'E2E-1, AC3':   { desc: 'E2E enrollment mid-session + AC3 (no tag before enrollment)', count: 2, covered: true },
  'E2E-2, AC3':   { desc: 'E2E expiry + AC3 (no tag after expiry)', count: 2, covered: true },
  'E2E-4, AC3':   { desc: 'E2E cancellation + AC3 (no tag after cancellation)', count: 2, covered: true },
  'REQ-C3, DI':   { desc: 'Boundary + Data Integrity: Win/Bet txn consistency at boundary', count: 2, covered: true },
  'AC1, AC2':     { desc: 'AC1 + AC2: Tag appears identically in RH and TH for same bet', count: 3, covered: true },
  'AC1, AC2, DI': { desc: 'AC1+AC2+DI: Cross-view consistency for qualifying and non-qualifying bets', count: 4, covered: true },
};

// ============================================================
// RUN GENERATOR
// ============================================================
const outputXlsx = path.join(
  __dirname, 'output', reqInfo.platform, 'User_Games_Play',
  `${reqInfo.id}_TC_${reqInfo.featureSlug}.xlsx`
);
const outputMd = path.join(
  __dirname, 'output', reqInfo.platform, 'User_Games_Play',
  `${reqInfo.id}_O_${reqInfo.featureSlug}.md`
);

generateTestCase(reqInfo, allTestCases, coverageMap, outputXlsx, outputMd);

console.log(`Total test cases: ${allTestCases.length} (${roundHistoryTC.length} RH + ${transactionHistoryTC.length} TH)`);
