import { getDb } from './db';
import { users, userProfiles, subscriptionsV2 } from '../drizzle/schema';
import { hashPassword } from './customAuth';
import { eq } from 'drizzle-orm';

async function main() {
  const db = await getDb();
  const email = 'test@example.com';
  const password = 'password123';
  const passwordHash = await hashPassword(password);

  // Check if user exists
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  let userId;

  if (existing.length > 0) {
    userId = existing[0].id;
    console.log('User already exists, updating password...');
    await db.update(users).set({ passwordHash, emailVerified: true }).where(eq(users.id, userId));
  } else {
    console.log('Creating test user...');
    const [user] = await db.insert(users).values({
      email,
      name: 'Test User',
      passwordHash,
      emailVerified: true,
      loginMethod: 'email',
      openId: `email|${email}`
    }).returning();
    userId = user.id;
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
    });
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
    });
  }

  console.log('Test user created successfully!');
  console.log('Email: test@example.com');
  console.log('Password: password123');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
