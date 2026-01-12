import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'gateway02.us-east-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: 'hzCbMda76tmFdt4.root',
  password: 'layaS4xN7UNF3e9u87Zt',
  database: 'KD8igV5APKrQwmz3rzYZ6D',
  ssl: { rejectUnauthorized: true }
});

// Check negative accounts for user 300001 (the one with 3 reports uploaded)
const [accounts] = await connection.execute('SELECT id, userId, accountName, accountType, status FROM negative_accounts WHERE userId = 300001');
console.log('Negative Accounts for User 300001:', JSON.stringify(accounts, null, 2));
console.log('\nTotal accounts for user 300001:', accounts.length);

// Check credit reports for user 300001
const [reports] = await connection.execute('SELECT id, userId, bureau, isParsed, parsedData FROM credit_reports WHERE userId = 300001');
console.log('\nCredit Reports for User 300001:');
reports.forEach(r => {
  console.log(`  ${r.bureau}: isParsed=${r.isParsed}, parsedData length=${r.parsedData?.length || 0}`);
});

await connection.end();
