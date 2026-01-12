import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Update Benjamin Peter to master_admin
  await connection.execute("UPDATE users SET role = 'master_admin', status = 'active' WHERE email = 'benxpeter@gmail.com'");
  
  // Verify the update
  const [rows] = await connection.execute('SELECT id, name, email, role, status FROM users WHERE email = ?', ['benxpeter@gmail.com']);
  console.log('Updated user:', JSON.stringify(rows, null, 2));
  
  await connection.end();
}

main().catch(console.error);
