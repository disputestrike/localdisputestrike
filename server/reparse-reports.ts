/**
 * Script to re-parse existing credit reports that failed to parse
 * Run with: npx tsx server/reparse-reports.ts
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { parseAndSaveReport } from './creditReportParser';

async function main() {
  console.log('Starting credit report re-parsing...');
  
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL not set');
  }
  
  console.log('Connecting to database...');
  
  // Connect to database using DATABASE_URL
  const connection = await mysql.createConnection(dbUrl);
  
  // Get all credit reports
  const [reports] = await connection.execute(
    'SELECT id, userId, bureau, fileUrl, fileName, isParsed FROM credit_reports'
  );
  
  console.log(`Found ${(reports as any[]).length} credit reports`);
  
  for (const report of reports as any[]) {
    console.log(`\n--- Processing report ${report.id}: ${report.fileName} (${report.bureau}) ---`);
    console.log(`  isParsed: ${report.isParsed}`);
    console.log(`  fileUrl: ${report.fileUrl?.slice(0, 80)}...`);
    
    if (!report.fileUrl) {
      console.log('  SKIPPING: No file URL');
      continue;
    }
    
    try {
      console.log('  Starting parse...');
      await parseAndSaveReport(
        report.id,
        report.fileUrl,
        report.bureau.toLowerCase() as 'transunion' | 'equifax' | 'experian',
        report.userId
      );
      console.log('  SUCCESS: Report parsed');
    } catch (error) {
      console.error('  ERROR:', error);
    }
  }
  
  // Check negative accounts
  const [accounts] = await connection.execute(
    'SELECT COUNT(*) as count FROM negative_accounts'
  );
  console.log(`\n\nTotal negative accounts in database: ${(accounts as any[])[0].count}`);
  
  await connection.end();
  console.log('\nDone!');
}

main().catch(console.error);
