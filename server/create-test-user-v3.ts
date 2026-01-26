import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { users, userProfiles, subscriptionsV2 } from '../drizzle/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  const cleanUrl = dbUrl.replace(/[?&]ssl=[^&]*/g, '');
  const sslUrl = cleanUrl.includes('?') 
    ? `${cleanUrl}&ssl={"rejectUnauthorized":false}` 
    : `${cleanUrl}?ssl={"rejectUnauthorized":false}`;

  const connection = await mysql.createConnection(sslUrl);
  const db = drizzle(connection);
  
  const email = 'test@example.com';
  const password = 'password123';
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  console.log('Creating test user in database...');
  
  try {
    // Check if user exists
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    let userId;

    if (existing.length > 0) {
      userId = existing[0].id;
      console.log('User already exists, updating password...');
      await db.update(users).set({ 
        passwordHash, 
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      }).where(eq(users.id, userId));
    } else {
      const openId = `local_${crypto.randomBytes(16).toString('hex')}`;
      const [result] = await db.insert(users).values({
        email,
        name: 'Test User',
        passwordHash,
        emailVerified: true,
        loginMethod: 'email',
        openId,
        affiliateSource: 'direct_upload'
      } as any);
      userId = result.insertId;
    }

    // Create profile
    const existingProfile = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
    if (existingProfile.length === 0) {
      await db.insert(userProfiles).values({
        userId,
        fullName: 'Test User',
        currentAddress: '123 Main St',
        currentCity: 'Washington',
        currentState: 'DC',
        currentZip: '20001',
        dateOfBirth: '1990-01-01',
        phone: '555-123-4567',
        subscriptionTier: 'complete'
      } as any);
    }

    // Create subscription
    const existingSub = await db.select().from(subscriptionsV2).where(eq(subscriptionsV2.userId, userId)).limit(1);
    if (existingSub.length === 0) {
      await db.insert(subscriptionsV2).values({
        userId,
        tier: 'complete',
        status: 'active',
        trialStartedAt: new Date(),
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      } as any);
    }

    console.log('Test user created successfully!');
    console.log('Email: test@example.com');
    console.log('Password: password123');
  } catch (err) {
    console.error('Error creating test user:', err);
  } finally {
    await connection.end();
  }
}

main();
