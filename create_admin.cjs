const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function createAdmin() {
  const connection = await mysql.createConnection({
    host: 'gateway02.us-east-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: 'hzCbMda76tmFdt4.root',
    password: 'layaS4xN7UNF3e9u87Zt',
    database: 'KD8igV5APKrQwmz3rzYZ6D',
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true
    }
  });

  const email = 'admin@disputestrike.com';
  const password = 'StrikeAdmin2026!';
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(password, salt);

  try {
    await connection.execute(
      'INSERT INTO users (email, passwordHash, role, emailVerified, openId, createdAt) VALUES (?, ?, ?, ?, ?, NOW())',
      [email, hash, 'admin', 1, 'admin_system']
    );
    console.log('Super Admin created successfully');
    console.log('Email: ' + email);
    console.log('Password: ' + password);
  } catch (err) {
    console.error('Error creating admin:', err.message);
  } finally {
    await connection.end();
  }
}

createAdmin();
