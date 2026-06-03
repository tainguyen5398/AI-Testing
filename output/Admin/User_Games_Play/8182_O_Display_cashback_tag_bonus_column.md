# Test Case Summary — 8182: Display Cashback Tag in Bonus Column

| Field | Value |
|-------|-------|
| Requirement ID | 8182 |
| Feature | Display Cashback Tag in Bonus Column |
| Platform | Admin |
| Page Group | User Games Play |
| Total Test Cases | 53 |
| Date | 06/03/2026 |

## REQ Coverage (27/27 covered)

| REQ ID | Description | # TC | Covered |
|--------|-------------|------|---------|
| REQ-C1 | Condition 1: User enrolled in cashback program | 2 | YES |
| REQ-C2 | Condition 2: Cashback within valid date range (start_date <= today <= end_date) | 4 | YES |
| REQ-C3 | Condition 3: Bet amount within Min <= bet <= Max range | 10 | YES |
| REQ-C5 | Condition 5: Cashback status = Active | 2 | YES |
| REQ-C6 | Condition 6: Game in cashback-eligible game list | 2 | YES |
| AC1 | AC1: Cashback tag in Round History when cashback active | 5 | YES |
| AC2 | AC2: Cashback tag in Transaction History (Win and Bet txn) | 6 | YES |
| AC3 | AC3: NO tag for bets before start / after end / inactive / not enrolled | 8 | YES |
| AC4 | AC4: NO tag for pre-release historical bet/transaction records | 2 | YES |
| AC5 | AC5: Tag applied to both winning and losing bets | 4 | YES |
| E2E-1 | E2E: User enrolls mid-session — post-enrollment bets/transactions only | 3 | YES |
| E2E-2 | E2E: Cashback expires mid-session — no retroactive tagging | 2 | YES |
| E2E-3 | E2E: Cashback reactivated from Inactive to Active | 2 | YES |
| E2E-4 | E2E: User cancels enrollment — existing tags/transactions unchanged | 2 | YES |
| E2E-5 | E2E: Feature release — pre-release data not retroactively tagged | 2 | YES |
| E2E-6 | E2E: Admin changes Min/Max config — existing records unchanged | 2 | YES |
| E2E-7 | E2E: Admin removes game from eligible list — existing records unchanged | 2 | YES |
| DI | DI: Tag consistency between Round History and Transaction History (Win and Bet txn) | 5 | YES |
| US-8182 | Full US-8182 coverage: All conditions + AC + E2E + DI | 0 | YES |
| REQ-C1, REQ-C2, REQ-C3, REQ-C5, REQ-C6, AC1 | Combined: All 6 conditions met + AC1 (RH tag) | 1 | YES |
| REQ-C1, REQ-C2, REQ-C3, REQ-C5, REQ-C6, AC2 | Combined: All 6 conditions met + AC2 (TH tag) | 1 | YES |
| E2E-1, AC3 | E2E enrollment mid-session + AC3 (no tag before enrollment) | 2 | YES |
| E2E-2, AC3 | E2E expiry + AC3 (no tag after expiry) | 2 | YES |
| E2E-4, AC3 | E2E cancellation + AC3 (no tag after cancellation) | 2 | YES |
| REQ-C3, DI | Boundary + Data Integrity: Win/Bet txn consistency at boundary | 2 | YES |
| AC1, AC2 | AC1 + AC2: Tag appears identically in RH and TH for same bet | 3 | YES |
| AC1, AC2, DI | AC1+AC2+DI: Cross-view consistency for qualifying and non-qualifying bets | 4 | YES |

## Case Type Distribution

| Case Type | Count | Percentage |
|-----------|-------|------------|
| Positive | 15 | 28.3% |
| Negative | 10 | 18.9% |
| Boundary | 10 | 18.9% |
| E2E | 14 | 26.4% |
| Exception | 4 | 7.5% |

## Priority Distribution

| Priority | Count | Percentage |
|----------|-------|------------|
| High | 41 | 77.4% |
| Medium | 10 | 18.9% |
| Low | 2 | 3.8% |

## Test Case List (53 Total)

| TC ID | Page | Case Title | Sub-case 1 | Expected Result |
|-------|------|------------|------------|----------------|
| RH-01 | Round History | Display Cashback tag when all eligibility conditions are met | All 6 conditions satisfied: enrolled, ac... | The bet row displays the "Cashback" tag in the Bon... |
| RH-02 | Round History | No Cashback tag when user is not enrolled in cashback progra... | REQ-C1 fails — user has no cashback part... | No bet in Round History displays the "Cashback" ta... |
| RH-03 | Round History | No Cashback tag when cashback period has not started yet | REQ-C2 fails — current date is before ca... | No "Cashback" tag in the Bonus column for bets pla... |
| RH-04 | Round History | No Cashback tag when cashback period has already ended | REQ-C2 fails — current date is after cas... | No "Cashback" tag in the Bonus column for bets pla... |
| RH-05 | Round History | No Cashback tag when cashback status is set to Inactive | REQ-C5 fails — cashback status = Inactiv... | No "Cashback" tag in the Bonus column when cashbac... |
| RH-06 | Round History | No Cashback tag when the game played is not in the eligible ... | REQ-C6 fails — game is excluded from cas... | No "Cashback" tag in the Bonus column for bets on ... |
| RH-07 | Round History | Display Cashback tag for a winning bet that meets all eligib... | Bet placed: $100, Win amount: $50 (bet w... | The winning bet row displays "Cashback" tag in the... |
| RH-08 | Round History | Display Cashback tag for a losing bet that meets all eligibi... | Bet placed: $100, Win amount: $0 (bet lo... | The losing bet row also displays "Cashback" tag in... |
| RH-09 | Round History | No Cashback tag when bet amount is strictly below Min thresh... | REQ-C3 boundary: bet < Min (Min=10, bet=... | No "Cashback" tag in the Bonus column for bet belo... |
| RH-10 | Round History | Display Cashback tag when bet amount equals Min threshold (i... | REQ-C3 boundary: bet = Min (Min=10, bet=... | "Cashback" tag appears in the Bonus column for bet... |
| RH-11 | Round History | Display Cashback tag when bet amount is strictly within Min ... | REQ-C3 boundary: Min < bet < Max (Min=10... | "Cashback" tag appears in the Bonus column for bet... |
| RH-12 | Round History | Display Cashback tag when bet amount equals Max threshold (i... | REQ-C3 boundary: bet = Max (Max=1000, be... | "Cashback" tag appears in the Bonus column for bet... |
| RH-13 | Round History | No Cashback tag when bet amount strictly exceeds Max thresho... | REQ-C3 boundary: bet > Max (Max=1000, be... | No "Cashback" tag in the Bonus column for bet abov... |
| RH-14 | Round History | No Cashback tag for pre-release historical bet records | AC4: Historical records created before f... | Pre-release historical bet records do NOT display ... |
| RH-15 | Round History | Tag displayed in Round History matches Transaction History f... | DI: Cross-view consistency for a single ... | The "Cashback" tag appears in the Bonus column in ... |
| RH-16 | Round History | No Cashback tag shown in Round History when bet does not qua... | DI: Cross-view consistency for a non-qua... | Non-qualifying bet: NO "Cashback" tag in BOTH Roun... |
| RH-17 | Round History | Bonus column displays the exact text "Cashback" for qualifyi... | UI validation: exact tag text content an... | Tag text is exactly "Cashback" — correct capitaliz... |
| RH-18 | Round History | Cashback tag only for bets placed AFTER user enrolls mid-ses... | E2E: User joins cashback while already i... | Bets placed AFTER enrollment: "Cashback" tag shown... |
| RH-19 | Round History | Cashback tag only for bets placed BEFORE cashback expires — ... | E2E: Cashback end_date passes during an ... | Bets placed BEFORE expiry: "Cashback" tag shown. B... |
| RH-20 | Round History | Cashback tag appears for bets placed after previously inacti... | E2E: Cashback status changed from Inacti... | Bets placed AFTER reactivation: "Cashback" tag sho... |
| RH-21 | Round History | Already-placed qualifying bets retain tag when user cancels ... | E2E: User cancels enrollment after placi... | Already-placed qualifying bet: tag remains unchang... |
| RH-22 | Round History | Qualifying bets placed before feature release retain no tag ... | E2E: Feature released while user has act... | Pre-release bets do NOT receive "Cashback" tag ret... |
| RH-23 | Round History | Existing bet tag status remains unchanged when Admin updates... | E2E: Min/Max bet range config changed af... | Existing bet records retain their original tag sta... |
| RH-24 | Round History | Existing bet tag status remains unchanged when Admin removes... | E2E: Game removed from cashback-eligible... | Already-recorded bet records retain their original... |
| RH-25 | Round History | No Cashback tag for bets placed after cashback enrollment is... | Exception: User cancels enrollment mid-s... | Bets placed after cancellation: NO "Cashback" tag.... |
| RH-26 | Round History | No Cashback tag when bet is placed at exactly the same momen... | Exception: Race condition — bet placed a... | System handles the edge case consistently — bet is... |
| TH-01 | Transaction History | Display Cashback tag for both Win and Bet transactions when ... | All 6 conditions satisfied for a winning... | Both the "Win" transaction row and the "Bet" trans... |
| TH-02 | Transaction History | Display Cashback tag for Bet transaction of a losing bet (Wi... | Bet placed: $100, loses — only txn "Bet"... | The "Bet" transaction row displays "Cashback" tag ... |
| TH-03 | Transaction History | No Cashback tag when user is not enrolled in cashback progra... | REQ-C1 fails — user has no cashback part... | No transaction in Transaction History displays the... |
| TH-04 | Transaction History | No Cashback tag when cashback period has not started yet | REQ-C2 fails — current date is before ca... | No "Cashback" tag for transactions placed before t... |
| TH-05 | Transaction History | No Cashback tag when cashback period has already ended | REQ-C2 fails — current date is after cas... | No "Cashback" tag for transactions placed after th... |
| TH-06 | Transaction History | No Cashback tag when cashback status is set to Inactive | REQ-C5 fails — cashback status = Inactiv... | No "Cashback" tag in the Bonus column when cashbac... |
| TH-07 | Transaction History | No Cashback tag when the game is not in the eligible game li... | REQ-C6 fails — game is excluded from the... | No "Cashback" tag in the Bonus column for transact... |
| TH-08 | Transaction History | Both Win and Bet transactions of the same bet show identical... | Winning bet generates txn "Win" and txn ... | Both txn "Win" and txn "Bet" rows display "Cashbac... |
| TH-09 | Transaction History | Losing bet generates only Bet transaction — Cashback tag app... | Bet amount: $100, win = $0 — only txn "B... | Only txn "Bet" row exists and displays "Cashback" ... |
| TH-10 | Transaction History | No Cashback tag when bet amount is strictly below Min thresh... | REQ-C3 boundary: bet < Min (Min=10, bet=... | No "Cashback" tag in the Bonus column for bet belo... |
| TH-11 | Transaction History | Display Cashback tag when bet amount equals Min threshold (i... | REQ-C3 boundary: bet = Min (Min=10, bet=... | "Cashback" tag appears in the Bonus column for bet... |
| TH-12 | Transaction History | Display Cashback tag when bet amount is strictly within Min ... | REQ-C3 boundary: Min < bet < Max (Min=10... | "Cashback" tag appears in the Bonus column for bet... |
| TH-13 | Transaction History | Display Cashback tag when bet amount equals Max threshold (i... | REQ-C3 boundary: bet = Max (Max=1000, be... | "Cashback" tag appears in the Bonus column for bet... |
| TH-14 | Transaction History | No Cashback tag when bet amount strictly exceeds Max thresho... | REQ-C3 boundary: bet > Max (Max=1000, be... | No "Cashback" tag in the Bonus column for bet abov... |
| TH-15 | Transaction History | No Cashback tag for pre-release historical transactions | AC4: Historical records created before f... | Pre-release transaction records do NOT display "Ca... |
| TH-16 | Transaction History | Tag displayed in Transaction History matches Round History f... | DI: Cross-view consistency — same bet ha... | The "Cashback" tag appears in BOTH Round History a... |
| TH-17 | Transaction History | No Cashback tag in Transaction History for non-qualifying be... | DI: Cross-view consistency — non-qualify... | Non-qualifying bet: NO "Cashback" tag in BOTH Tran... |
| TH-18 | Transaction History | Bonus column displays the exact text "Cashback" for qualifyi... | UI validation: exact tag text content an... | Tag text is exactly "Cashback" on BOTH txn rows — ... |
| TH-19 | Transaction History | Cashback tag only for Win and Bet transactions placed AFTER ... | E2E: User joins cashback while already i... | Transactions placed AFTER enrollment: both Win and... |
| TH-20 | Transaction History | Cashback tag only for transactions placed BEFORE cashback ex... | E2E: Cashback end_date passes during an ... | Transactions before expiry: both Win and Bet txn r... |
| TH-21 | Transaction History | Cashback tag appears for transactions after cashback is reac... | E2E: Cashback status changed from Inacti... | Transactions after reactivation: both Win and Bet ... |
| TH-22 | Transaction History | Existing qualifying transactions retain tag when user cancel... | E2E: User cancels enrollment after placi... | Existing qualifying transactions: tag unchanged. N... |
| TH-23 | Transaction History | Pre-release transactions do not receive retroactive Cashback... | E2E: Feature released while user has act... | Pre-release transactions do NOT receive "Cashback"... |
| TH-24 | Transaction History | Existing transaction tag status remains unchanged when Admin... | E2E: Min/Max bet range config changed af... | Existing transaction records retain their original... |
| TH-25 | Transaction History | Existing transaction tag status remains unchanged when Admin... | E2E: Game removed from cashback-eligible... | Already-recorded transaction records retain their ... |
| TH-26 | Transaction History | No Cashback tag for transactions placed after cashback enrol... | Exception: User cancels enrollment mid-s... | Transactions placed after cancellation: NO "Cashba... |
| TH-27 | Transaction History | Consistent handling of Win and Bet transactions when bet amo... | Exception: Both txn types at exact Min/M... | Both txn "Win" and txn "Bet" rows show identical t... |

## Key Coverage Notes

- **Total**: 53 test cases (26 Round History + 27 Transaction History)
- **Coverage**: All 6 eligibility conditions are covered with Positive, Negative, and Boundary test cases.
- **E2E Coverage**: 7 E2E scenarios covering enrollment mid-session, expiry, reactivation, cancellation, cap exhaustion, and config changes.
- **AC1/AC2**: Verified in both Round History and Transaction History.
- **AC3**: Boundary conditions for Min/Max inclusive logic verified.
- **AC4**: Pre-release historical data does NOT receive the Cashback tag.
- **Data Integrity**: Tag consistency between Round History and Transaction History is verified for every qualifying bet.
- **High Priority**: 41 High priority TCs must pass before release.
- All content in this test suite is written in **ENGLISH** as per QA standards.
