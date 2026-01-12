/**
 * Script to list all users in the database
 * Usage: node scripts/list-users.mjs
 */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  const [users] = await connection.execute('SELECT id, name, email, role, createdAt FROM users ORDER BY createdAt DESC');
  
  console.log('\n=== DisputeStrike Users ===\n');
  console.log('ID\tRole\tName\t\t\tEmail\t\t\t\tCreated');
  console.log('-'.repeat(100));
  
  for (const user of users) {
    const role = user.role === 'admin' ? '🔑 ADMIN' : '   user';
    console.log(`${user.id}\t${role}\t${user.name || 'N/A'}\t\t${user.email || 'N/A'}\t\t${user.createdAt}`);
  }
  
  console.log('\nTotal users:', users.length);
  console.log('Admins:', users.filter(u => u.role === 'admin').length);
  
  await connection.end();
}

main().catch(console.error);
