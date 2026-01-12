import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'gateway02.us-east-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: 'hzCbMda76tmFdt4.root',
  password: 'layaS4xN7UNF3e9u87Zt',
  database: 'KD8igV5APKrQwmz3rzYZ6D',
  ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
});

// Check credit reports
const [reports] = await conn.execute('SELECT id, userId, bureau, isParsed, fileName, uploadedAt FROM credit_reports ORDER BY id DESC LIMIT 10');
console.log('Recent Credit Reports:');
console.log(reports);

// Check if there are any negative accounts
const [accounts] = await conn.execute('SELECT id, userId, accountName, bureau, negativeReason FROM negative_accounts ORDER BY id DESC LIMIT 10');
console.log('\nRecent Negative Accounts:');
console.log(accounts);

await conn.end();
