import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'gateway02.us-east-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: 'hzCbMda76tmFdt4.root',
  password: 'layaS4xN7UNF3e9u87Zt',
  database: 'KD8igV5APKrQwmz3rzYZ6D',
  ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
});

// Check table structure
const [columns] = await conn.execute('DESCRIBE negative_accounts');
console.log('Negative Accounts Table Structure:');
for (const col of columns) {
  console.log(`  ${col.Field}: ${col.Type}`);
}

await conn.end();
