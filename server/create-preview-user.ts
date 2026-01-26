import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { users, userProfiles, subscriptionsV2 } from '../drizzle/schema';
import bcrypt from 'bcryptjs';

async function main() {
  const sqlite = new Database('preview.db');
  const db = drizzle(sqlite);
  
  // This is just for the preview environment to ensure we have a working user
  const email = 'test@example.com';
  const password = 'password123';
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  console.log('Creating preview user in local SQLite...');
  
  try {
    // Create tables if they don't exist (simplified for preview)
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        name TEXT,
        password_hash TEXT,
        email_verified INTEGER DEFAULT 1,
        login_method TEXT DEFAULT 'email',
        open_id TEXT
      );
      CREATE TABLE IF NOT EXISTS user_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        full_name TEXT,
        current_address TEXT,
        current_city TEXT,
        current_state TEXT,
        current_zip TEXT,
        date_of_birth TEXT,
        phone TEXT,
        subscription_tier TEXT DEFAULT 'complete'
      );
    `);

    const userResult = sqlite.prepare('INSERT OR REPLACE INTO users (email, name, password_hash, email_verified, login_method, open_id) VALUES (?, ?, ?, ?, ?, ?)').run(
      email, 'Test User', passwordHash, 1, 'email', `email|${email}`
    );
    const userId = userResult.lastInsertRowid;

    sqlite.prepare('INSERT OR REPLACE INTO user_profiles (user_id, full_name, current_address, current_city, current_state, current_zip, date_of_birth, phone, subscription_tier) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      userId, 'Test User', '123 Main St', 'Washington', 'DC', '20001', '1990-01-01', '555-123-4567', 'complete'
    );

    console.log('Preview user created successfully!');
    console.log('Email: test@example.com');
    console.log('Password: password123');
  } catch (err) {
    console.error('Error creating preview user:', err);
  }
}

main();
