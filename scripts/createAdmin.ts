/**
 * Create master admin account for Admin Panel login.
 * Run: npm run db:create-admin
 */
import dotenv from "dotenv";
// Load .ENV (project uses .ENV)
dotenv.config({ path: ".ENV" });
dotenv.config({ path: ".env" });

import { getDb } from "../server/db";
import { adminAccounts } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = "admin@disputestrike.com";
const ADMIN_PASSWORD = "DisputeStrike2024!";
const ADMIN_NAME = "Master Admin";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("ERROR: DATABASE_URL not set. Ensure .ENV exists with DATABASE_URL.");
    process.exit(1);
  }

  const database = await getDb();
  if (!database) {
    console.error("ERROR: Could not connect to database. Check DATABASE_URL.");
    process.exit(1);
  }

  const existing = await database
    .select()
    .from(adminAccounts)
    .where(eq(adminAccounts.email, ADMIN_EMAIL.toLowerCase()))
    .limit(1);

  if (existing[0]) {
    // Reset password in case it was changed and user forgot
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await database
      .update(adminAccounts)
      .set({
        passwordHash: hashedPassword,
        loginAttempts: 0,
        lockedUntil: null,
        status: "active",
      })
      .where(eq(adminAccounts.id, existing[0].id));
    console.log("Admin already exists. Password RESET to default.");
  } else {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await database.insert(adminAccounts).values({
      email: ADMIN_EMAIL.toLowerCase(),
      passwordHash: hashedPassword,
      name: ADMIN_NAME,
      role: "master_admin",
      status: "active",
    });
    console.log("Admin account CREATED.");
  }

  console.log("");
  console.log("Login at /admin/login with:");
  console.log("  Email:    ", ADMIN_EMAIL);
  console.log("  Password: ", ADMIN_PASSWORD);
  console.log("");
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
