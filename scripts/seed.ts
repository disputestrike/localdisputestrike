import "dotenv/config";
import { eq } from "drizzle-orm";
import { getDb } from "../server/db";
import {
  users,
  userProfiles,
  creditReports,
  negativeAccounts,
  disputeLetters,
} from "../drizzle/schema";

async function seed() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available. Check DATABASE_URL.");
  }

  const seedOpenId = "seed-user-001";
  const existingUser = await db.select().from(users).where(eq(users.openId, seedOpenId)).limit(1);
  let userId: number;

  if (existingUser[0]) {
    userId = existingUser[0].id;
  } else {
    const insert = await db.insert(users).values({
      openId: seedOpenId,
      name: "Seed User",
      email: "seed.user@example.com",
      loginMethod: "seed",
      role: "user",
      lastSignedIn: new Date(),
    });
    userId = Number(insert[0].insertId);
  }

  const existingProfile = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  if (!existingProfile[0]) {
    await db.insert(userProfiles).values({
      userId,
      firstName: "Seed",
      lastName: "User",
      fullName: "Seed User",
      dateOfBirth: "1990-01-15",
      ssnLast4: "1234",
      phone: "555-111-2222",
      email: "seed.user@example.com",
      currentAddress: "123 Main St",
      currentCity: "Austin",
      currentState: "TX",
      currentZip: "78701",
      previousAddress: "456 Oak Ave",
      previousCity: "Austin",
      previousState: "TX",
      previousZip: "78704",
      isComplete: true,
      completedAt: new Date(),
    });
  }

  const existingReports = await db.select().from(creditReports).where(eq(creditReports.userId, userId)).limit(1);
  if (!existingReports[0]) {
    const reports = [
      { bureau: "transunion", score: 612 },
      { bureau: "equifax", score: 598 },
      { bureau: "experian", score: 621 },
    ];

    for (const report of reports) {
      await db.insert(creditReports).values({
        userId,
        bureau: report.bureau as "transunion" | "equifax" | "experian",
        fileUrl: `https://example.com/seed/${report.bureau}.pdf`,
        fileKey: `seed/${report.bureau}.pdf`,
        fileName: `${report.bureau}-seed.pdf`,
        parsedData: JSON.stringify({
          bureau: report.bureau,
          creditScore: report.score,
          scoreModel: "VantageScore 3.0",
        }),
        isParsed: true,
        creditScore: report.score,
        scoreModel: "VantageScore 3.0",
        processingStatus: "completed",
      });
    }
  }

  const existingAccounts = await db.select().from(negativeAccounts).where(eq(negativeAccounts.userId, userId)).limit(1);
  if (!existingAccounts[0]) {
    await db.insert(negativeAccounts).values([
      {
        userId,
        accountName: "AUTOMAX AUTO LOAN",
        accountNumber: "****1234",
        accountType: "Collection",
        balance: "9270.00",
        status: "Collection",
        dateOpened: "2019-06-01",
        lastActivity: "2023-10-15",
        bureau: "transunion",
        negativeReason: "Collection account with disputed balance",
        hasConflicts: true,
        conflictDetails: JSON.stringify([
          { type: "balance_mismatch", description: "Different balances across bureaus." },
        ]),
      },
      {
        userId,
        accountName: "CAPITAL ONE AUTO",
        accountNumber: "****5678",
        accountType: "Charge-off",
        balance: "2270.00",
        status: "Charge-off",
        dateOpened: "2018-02-12",
        lastActivity: "2022-08-09",
        bureau: "equifax",
        negativeReason: "Charge-off reported with inconsistent status",
        hasConflicts: false,
      },
      {
        userId,
        accountName: "BLUE SKY CREDIT",
        accountNumber: "****9981",
        accountType: "Late Payment",
        balance: "520.00",
        status: "90 days late",
        dateOpened: "2020-11-05",
        lastActivity: "2024-01-20",
        bureau: "experian",
        negativeReason: "Recent late payment with missing notices",
        hasConflicts: true,
        conflictDetails: JSON.stringify([
          { type: "status_mismatch", description: "Status varies by bureau." },
        ]),
      },
    ]);
  }

  const existingLetters = await db.select().from(disputeLetters).where(eq(disputeLetters.userId, userId)).limit(1);
  if (!existingLetters[0]) {
    const mailedAt = new Date();
    const responseDeadline = new Date(mailedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
    await db.insert(disputeLetters).values([
      {
        userId,
        bureau: "transunion",
        letterContent: "Seed dispute letter content for TransUnion.",
        accountsDisputed: JSON.stringify([1, 2]),
        round: 1,
        letterType: "initial",
        status: "mailed",
        mailedAt,
        trackingNumber: "9400109699939000000000",
        responseDeadline,
      },
      {
        userId,
        bureau: "equifax",
        letterContent: "Seed dispute letter content for Equifax.",
        accountsDisputed: JSON.stringify([2]),
        round: 1,
        letterType: "initial",
        status: "generated",
      },
    ]);
  }

  console.log("[Seed] Seed data ensured.");
  process.exit(0);
}

seed().catch((error) => {
  console.error("[Seed] Failed:", error);
  process.exit(1);
});
