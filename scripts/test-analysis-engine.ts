/**
 * Test script for the Core Analysis Engine
 * Uses Elijah D Adayehi expected data to verify ~10-11 unique negatives
 */

import { runAnalysisPipeline } from '../server/analysisEngine';

// Mock account data based on Elijah D Adayehi analysis (expected: 10-11 unique)
const ELIJAH_ACCOUNTS = [
  // AUTOMAX - TU + EQ
  { accountName: 'AUTOMAX', accountNumber: '1234', balance: 9270, status: 'Open', paymentStatus: 'Repossession/Foreclosure', paymentHistory: '4/1/1', bureau: 'TransUnion', dateOpened: '2020-01-01', lastActivity: '2025-12-01', accountType: 'Auto Loan', negativeReason: 'Repossession' },
  { accountName: 'AUTOMAX', accountNumber: '1234', balance: 9270, status: 'Past Due', paymentStatus: 'Past Due', paymentHistory: '4/1/1', bureau: 'Equifax', dateOpened: '2020-01-01', lastActivity: '2025-12-01', accountType: 'Auto Loan', negativeReason: 'Past due' },
  // CAPITAL ONE AUTO - all 3 bureaus
  { accountName: 'CAPITAL ONE AUTO FINAN', accountNumber: '5678', balance: 0, status: 'Charge Off', paymentStatus: 'Charge Off', paymentHistory: '0/0/0', bureau: 'TransUnion', dateOpened: '2018-01-01', lastActivity: '2021-08-01', accountType: 'Auto Loan', negativeReason: 'Charge-off' },
  { accountName: 'CAPITAL ONE AUTO FINAN', accountNumber: '5678', balance: 0, status: 'Open', paymentStatus: 'In good standing', paymentHistory: '6/8/28', bureau: 'Equifax', dateOpened: '2018-01-01', lastActivity: '2025-01-01', accountType: 'Auto Loan', negativeReason: '6/8/28 lates' },
  { accountName: 'CAPITAL ONE AUTO FINAN', accountNumber: '5678', balance: 0, status: 'Charge Off', paymentStatus: 'Charge Off', paymentHistory: '6/8/4', bureau: 'Experian', dateOpened: '2018-01-01', lastActivity: '2023-06-01', accountType: 'Auto Loan', negativeReason: 'Charge-off' },
  // ADONISAUTO - TU + EX
  { accountName: 'ADONISAUTO', accountNumber: '9012', balance: 0, status: 'Closed', paymentStatus: 'Paid Repossession', paymentHistory: '0/0/2', bureau: 'TransUnion', dateOpened: '2019-01-01', lastActivity: '2022-01-01', accountType: 'Auto Loan', negativeReason: 'Paid repo' },
  { accountName: 'ADONISAUTO', accountNumber: '9012', balance: 0, status: 'Closed', paymentStatus: 'Paid Repossession', paymentHistory: '0/0/2', bureau: 'Experian', dateOpened: '2019-01-01', lastActivity: '2022-01-01', accountType: 'Auto Loan', negativeReason: 'Paid repo' },
  // TSI DEER RUN - all 3
  { accountName: 'TSI/940 - DEER RUN', accountNumber: '1001', balance: 2769, status: 'Collection', paymentStatus: 'Collection', paymentHistory: '0/0/0', bureau: 'TransUnion', dateOpened: '2021-08-03', lastActivity: '2024-01-01', accountType: 'Collection', originalCreditor: 'DEER RUN', negativeReason: 'Collection' },
  { accountName: 'TSI/940 - DEER RUN', accountNumber: '1001', balance: 2769, status: 'Collection', paymentStatus: 'Collection', paymentHistory: '0/0/0', bureau: 'Equifax', dateOpened: '2021-08-03', lastActivity: '2024-01-01', accountType: 'Collection', originalCreditor: 'DEER RUN', negativeReason: 'Collection' },
  { accountName: 'TSI/940 - DEER RUN', accountNumber: '1001', balance: 2769, status: 'Collection', paymentStatus: 'Collection', paymentHistory: '0/0/0', bureau: 'Experian', dateOpened: '2021-08-03', lastActivity: '2024-01-01', accountType: 'Collection', originalCreditor: 'DEER RUN', negativeReason: 'Collection' },
  // FST FINANCIA - TU + EX
  { accountName: 'FST FINANCIA - TOWN OF BURLINGTON', accountNumber: '2002', balance: 1749, status: 'Open', paymentStatus: 'Placed for Collection', paymentHistory: '0/0/0', bureau: 'TransUnion', dateOpened: '2025-07-10', lastActivity: '2025-07-10', accountType: 'Collection', originalCreditor: 'Town of Burlington', negativeReason: 'Collection' },
  { accountName: 'FST FINANCIA - TOWN OF BURLINGTON', accountNumber: '2002', balance: 1749, status: 'Charge Off', paymentStatus: 'Charge-off', paymentHistory: '0/0/0', bureau: 'Experian', dateOpened: '2025-07-10', lastActivity: '2025-07-10', accountType: 'Collection', originalCreditor: 'Town of Burlington', negativeReason: 'Collection' },
  // TSI T-MOBILE - all 3
  { accountName: 'TSI/940 - T-MOBILE USA', accountNumber: '3003', balance: 928, status: 'Collection', paymentStatus: 'Collection', bureau: 'TransUnion', dateOpened: '2024-03-30', lastActivity: '2024-06-01', accountType: 'Collection', originalCreditor: 'T-Mobile', negativeReason: 'Collection' },
  { accountName: 'TSI/940 - T-MOBILE USA', accountNumber: '3003', balance: 928, status: 'Collection', paymentStatus: 'Collection', bureau: 'Equifax', dateOpened: '2024-03-30', lastActivity: '2024-06-01', accountType: 'Collection', originalCreditor: 'T-Mobile', negativeReason: 'Collection' },
  { accountName: 'TSI/940 - T-MOBILE USA', accountNumber: '3003', balance: 928, status: 'Collection', paymentStatus: 'Collection', bureau: 'Experian', dateOpened: '2024-03-30', lastActivity: '2024-06-01', accountType: 'Collection', originalCreditor: 'T-Mobile', negativeReason: 'Collection' },
  // NCA SPEEDYCASH - all 3
  { accountName: 'NCA - SPEEDYCASH', accountNumber: '4004', balance: 636, status: 'Collection', paymentStatus: 'Collection', bureau: 'TransUnion', dateOpened: '2023-01-05', lastActivity: '2023-06-01', accountType: 'Collection', originalCreditor: 'SPEEDYCASH', negativeReason: 'Collection' },
  { accountName: 'NCA - SPEEDYCASH', accountNumber: '4004', balance: 636, status: 'Collection', paymentStatus: 'Collection', bureau: 'Equifax', dateOpened: '2023-01-05', lastActivity: '2023-06-01', accountType: 'Collection', originalCreditor: 'SPEEDYCASH', negativeReason: 'Collection' },
  { accountName: 'NCA - SPEEDYCASH', accountNumber: '4004', balance: 636, status: 'Collection', paymentStatus: 'Collection', bureau: 'Experian', dateOpened: '2023-01-05', lastActivity: '2023-06-01', accountType: 'Collection', originalCreditor: 'SPEEDYCASH', negativeReason: 'Collection' },
  // INNOVATIVE R WINDRIDGE - all 3
  { accountName: 'INNOVATIVE R - WINDRIDGE APARTMENTS', accountNumber: '5005', balance: 612, status: 'Collection', paymentStatus: 'Collection', bureau: 'TransUnion', dateOpened: '2022-06-02', lastActivity: '2023-01-01', accountType: 'Collection', originalCreditor: 'Windridge Apartments', negativeReason: 'Collection' },
  { accountName: 'INNOVATIVE R - WINDRIDGE APARTMENTS', accountNumber: '5005', balance: 612, status: 'Collection', paymentStatus: 'Collection', bureau: 'Equifax', dateOpened: '2022-06-02', lastActivity: '2023-01-01', accountType: 'Collection', originalCreditor: 'Windridge Apartments', negativeReason: 'Collection' },
  { accountName: 'INNOVATIVE R - WINDRIDGE APARTMENTS', accountNumber: '5005', balance: 612, status: 'Collection', paymentStatus: 'Collection', bureau: 'Experian', dateOpened: '2022-06-02', lastActivity: '2023-01-01', accountType: 'Collection', originalCreditor: 'Windridge Apartments', negativeReason: 'Collection' },
  // TSI RELIANT - all 3
  { accountName: 'TSI/940 - RELIANT ENERGY', accountNumber: '6006', balance: 580, status: 'Collection', paymentStatus: 'Collection', bureau: 'TransUnion', dateOpened: '2023-12-24', lastActivity: '2024-03-01', accountType: 'Collection', originalCreditor: 'Reliant Energy', negativeReason: 'Collection' },
  { accountName: 'TSI/940 - RELIANT ENERGY', accountNumber: '6006', balance: 580, status: 'Collection', paymentStatus: 'Collection', bureau: 'Equifax', dateOpened: '2023-12-24', lastActivity: '2024-03-01', accountType: 'Collection', originalCreditor: 'Reliant Energy', negativeReason: 'Collection' },
  { accountName: 'TSI/940 - RELIANT ENERGY', accountNumber: '6006', balance: 580, status: 'Collection', paymentStatus: 'Collection', bureau: 'Experian', dateOpened: '2023-12-24', lastActivity: '2024-03-01', accountType: 'Collection', originalCreditor: 'Reliant Energy', negativeReason: 'Collection' },
];

function main() {
  console.log('========================================');
  console.log('CORE ANALYSIS ENGINE - TEST');
  console.log('Elijah D Adayehi Expected: ~10-11 unique');
  console.log('========================================\n');

  const result = runAnalysisPipeline(ELIJAH_ACCOUNTS);

  console.log('RESULTS:');
  console.log('--------');
  console.log('Total Unique Negatives:', result.totalUniqueNegatives);
  console.log('Total Debt: $' + result.totalDebt.toLocaleString());
  console.log('Total Disputable Items:', result.totalDisputableItems);
  console.log('');
  console.log('Category Breakdown:', JSON.stringify(result.categoryBreakdown, null, 2));
  console.log('');
  console.log('Severity Breakdown:', JSON.stringify(result.severityBreakdown, null, 2));
  console.log('');
  console.log('NEGATIVE ACCOUNTS:');
  result.negativeAccounts.forEach((a, i) => {
    console.log(`  ${i + 1}. ${a.creditor} | $${a.balance} | ${a.severity} | bureaus: ${a.bureaus.join(',')} | conflicts: ${a.conflicts.length}`);
  });
  console.log('');
  console.log('ROUND 1 TARGETS:');
  (result.round1Targets || []).forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.account} | success ${(r.success_probability * 100).toFixed(0)}% | ${r.reason}`);
  });
  console.log('');
  console.log('========================================');
  const pass = result.totalUniqueNegatives >= 10 && result.totalUniqueNegatives <= 12;
  console.log('PASS:', pass ? 'YES ✓' : 'NO ✗', `(got ${result.totalUniqueNegatives}, expected 10-11)`);
  console.log('========================================');
}

main();
