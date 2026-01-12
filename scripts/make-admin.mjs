/**
 * Script to promote a user to admin role
 * Usage: node scripts/make-admin.mjs <email>
 * Example: node scripts/make-admin.mjs user@example.com
 */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const email = process.argv[2];

if (!email) {
  console.log('Usage: node scripts/make-admin.mjs <email>');
  console.log('Example: node scripts/make-admin.mjs user@example.com');
  process.exit(1);
}

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Check if user exists
  const [users] = await connection.execute('SELECT id, name, email, role FROM users WHERE email = ?', [email]);
  
  if (users.length === 0) {
    console.log(`No user found with email: ${email}`);
    await connection.end();
    process.exit(1);
  }
  
  const user = users[0];
  
  if (user.role === 'admin') {
    console.log(`User ${user.name} (${user.email}) is already an admin.`);
    await connection.end();
    return;
  }
  
  // Promote to admin
  await connection.execute('UPDATE users SET role = ? WHERE id = ?', ['admin', user.id]);
  console.log(`✅ Successfully promoted ${user.name} (${user.email}) to admin!`);
  console.log(`They can now access the admin panel at /admin`);
  
  await connection.end();
}

main().catch(console.error);
