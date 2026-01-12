import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
dotenv.config();

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Create admin_accounts table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS admin_accounts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(320) NOT NULL UNIQUE,
      passwordHash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role ENUM('admin', 'super_admin', 'master_admin') DEFAULT 'admin' NOT NULL,
      status ENUM('active', 'blocked', 'suspended') DEFAULT 'active' NOT NULL,
      lastLogin TIMESTAMP NULL,
      loginAttempts INT DEFAULT 0,
      lockedUntil TIMESTAMP NULL,
      createdBy INT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    )
  `);
  console.log('Created admin_accounts table');
  
  // Create admin_activity_log table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS admin_activity_log (
      id INT AUTO_INCREMENT PRIMARY KEY,
      adminId INT NOT NULL,
      action VARCHAR(100) NOT NULL,
      targetType VARCHAR(50),
      targetId INT,
      details TEXT,
      ipAddress VARCHAR(45),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `);
  console.log('Created admin_activity_log table');
  
  // Create initial master admin account
  const masterPassword = 'DisputeStrike2024!'; // You should change this!
  const hashedPassword = await bcrypt.hash(masterPassword, 12);
  
  try {
    await connection.execute(`
      INSERT INTO admin_accounts (email, passwordHash, name, role, status)
      VALUES (?, ?, ?, 'master_admin', 'active')
    `, ['admin@disputestrike.com', hashedPassword, 'Master Admin']);
    console.log('Created master admin account:');
    console.log('  Email: admin@disputestrike.com');
    console.log('  Password: DisputeStrike2024!');
    console.log('  (Please change this password after first login!)');
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      console.log('Master admin already exists');
    } else {
      throw e;
    }
  }
  
  await connection.end();
  console.log('Migration complete!');
}

main().catch(console.error);
