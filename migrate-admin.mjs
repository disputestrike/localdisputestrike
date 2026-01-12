import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('Running admin schema migrations...');
  
  // Add status column if not exists
  try {
    await connection.execute(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('user', 'admin', 'super_admin', 'master_admin') NOT NULL DEFAULT 'user'
    `);
    console.log('✅ Updated role enum');
  } catch (e) {
    console.log('Role enum already updated or error:', e.message);
  }
  
  try {
    await connection.execute(`
      ALTER TABLE users 
      ADD COLUMN status ENUM('active', 'blocked', 'suspended') NOT NULL DEFAULT 'active'
    `);
    console.log('✅ Added status column');
  } catch (e) {
    console.log('Status column exists or error:', e.message);
  }
  
  try {
    await connection.execute(`
      ALTER TABLE users 
      ADD COLUMN blockedAt TIMESTAMP NULL,
      ADD COLUMN blockedBy INT NULL,
      ADD COLUMN blockedReason TEXT NULL
    `);
    console.log('✅ Added blocked columns');
  } catch (e) {
    console.log('Blocked columns exist or error:', e.message);
  }
  
  // Set current admin as master_admin
  await connection.execute(`
    UPDATE users SET role = 'master_admin' WHERE email = 'benxpeter@gmail.com'
  `);
  console.log('✅ Set benxpeter@gmail.com as master_admin');
  
  // Verify
  const [users] = await connection.execute('SELECT id, name, email, role, status FROM users');
  console.log('\nCurrent users:', users);
  
  await connection.end();
  console.log('\n✅ Migration complete!');
}

migrate().catch(console.error);
