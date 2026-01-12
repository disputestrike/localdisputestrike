import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'gateway02.us-east-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: 'hzCbMda76tmFdt4.root',
  password: 'layaS4xN7UNF3e9u87Zt',
  database: 'KD8igV5APKrQwmz3rzYZ6D',
  ssl: { rejectUnauthorized: true }
});

console.log('Adding missing columns to negative_accounts table...');

// Add creditReportId column
try {
  await connection.execute('ALTER TABLE negative_accounts ADD COLUMN creditReportId INT');
  console.log('Added creditReportId column');
} catch (e) {
  if (e.code === 'ER_DUP_FIELDNAME') {
    console.log('creditReportId column already exists');
  } else {
    console.error('Error adding creditReportId:', e.message);
  }
}

// Add bureau column
try {
  await connection.execute('ALTER TABLE negative_accounts ADD COLUMN bureau VARCHAR(50)');
  console.log('Added bureau column');
} catch (e) {
  if (e.code === 'ER_DUP_FIELDNAME') {
    console.log('bureau column already exists');
  } else {
    console.error('Error adding bureau:', e.message);
  }
}

// Add rawData column
try {
  await connection.execute('ALTER TABLE negative_accounts ADD COLUMN rawData TEXT');
  console.log('Added rawData column');
} catch (e) {
  if (e.code === 'ER_DUP_FIELDNAME') {
    console.log('rawData column already exists');
  } else {
    console.error('Error adding rawData:', e.message);
  }
}

// Add negativeReason column
try {
  await connection.execute('ALTER TABLE negative_accounts ADD COLUMN negativeReason TEXT');
  console.log('Added negativeReason column');
} catch (e) {
  if (e.code === 'ER_DUP_FIELDNAME') {
    console.log('negativeReason column already exists');
  } else {
    console.error('Error adding negativeReason:', e.message);
  }
}

console.log('Schema update complete!');

// Verify the columns
const [columns] = await connection.execute('DESCRIBE negative_accounts');
console.log('\nUpdated table structure:');
columns.forEach(col => console.log(`  ${col.Field}: ${col.Type}`));

await connection.end();
