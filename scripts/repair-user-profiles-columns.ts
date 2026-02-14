/**
 * Repair user_profiles table: fix malformed columns and ensure all required columns exist.
 * Run: pnpm exec tsx scripts/repair-user-profiles-columns.ts
 * Or with .ENV: DOTENV_CONFIG_PATH=.ENV pnpm exec tsx scripts/repair-user-profiles-columns.ts
 */
import "dotenv/config";
import { getDb } from "../server/db";
import { sql } from "drizzle-orm";

const TABLE = "user_profiles";
const BAD_COLUMN_TO_DROP = "lobAddressId NisComplete";  // malformed: one column with space

const RENAME_FIXES: { from: string; to: string; def: string }[] = [
  { from: "userld", to: "userId", def: "int NOT NULL" },
  { from: "middlelnitial", to: "middleInitial", def: "varchar(1)" },
  { from: "lobAddressld", to: "lobAddressId", def: "varchar(255)" },
];

// All columns added by 0024 + 0026 that may be missing if migrations weren't run
const REQUIRED_COLUMNS: { name: string; def: string }[] = [
  { name: "firstName", def: "varchar(100)" },
  { name: "middleInitial", def: "varchar(1)" },
  { name: "lastName", def: "varchar(100)" },
  { name: "ssnFull", def: "varchar(255)" },
  { name: "signatureUrl", def: "text" },
  { name: "signatureCreatedAt", def: "timestamp NULL" },
  { name: "addressVerified", def: "boolean DEFAULT false" },
  { name: "addressVerifiedAt", def: "timestamp NULL" },
  { name: "lobAddressId", def: "varchar(255)" },
  { name: "isComplete", def: "boolean DEFAULT false" },
  { name: "completedAt", def: "timestamp NULL" },
  { name: "idDocumentUrl", def: "text" },
  { name: "utilityBillUrl", def: "text" },
];

function getDbName(): string {
  const u = process.env.DATABASE_URL;
  if (!u) return "";
  try {
    const pathname = new URL(u.replace("mysql://", "http://")).pathname.slice(1);
    return pathname.split("?")[0];
  } catch {
    return "";
  }
}

async function countColumn(db: Awaited<ReturnType<typeof getDb>>, dbName: string, columnName: string): Promise<number> {
  const r = await db!.execute(
    sql`SELECT COUNT(*) as c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ${dbName} AND TABLE_NAME = ${TABLE} AND COLUMN_NAME = ${columnName}`
  );
  const rows = Array.isArray(r) ? r : [r];
  return Number((rows[0] as { c?: number })?.c ?? 0);
}

async function getColumns(db: Awaited<ReturnType<typeof getDb>>, dbName: string): Promise<string[]> {
  const r = await db!.execute(
    sql`SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ${dbName} AND TABLE_NAME = ${TABLE} ORDER BY ORDINAL_POSITION`
  );
  const rows = Array.isArray(r) ? r : [r];
  const arr = rows[0];
  if (Array.isArray(arr)) {
    return arr.map((x: any) => x?.COLUMN_NAME ?? x?.column_name ?? "").filter(Boolean);
  }
  return [];
}

async function main() {
  const db = await getDb();
  if (!db) {
    console.error("No database connection. Set DATABASE_URL in .ENV");
    process.exit(1);
  }

  const dbName = getDbName();
  if (!dbName) {
    console.error("Could not get database name from DATABASE_URL");
    process.exit(1);
  }

  console.log("Checking user_profiles table...");
  const columns = await getColumns(db, dbName);
  console.log("Current columns:", columns.join(", "));

  // Drop malformed column (name with space)
  if ((await countColumn(db, dbName, BAD_COLUMN_TO_DROP)) > 0) {
    console.log(`Dropping malformed column "${BAD_COLUMN_TO_DROP}"...`);
    try {
      await db.execute(sql.raw(`ALTER TABLE \`${TABLE}\` DROP COLUMN \`${BAD_COLUMN_TO_DROP}\``));
      console.log("  Dropped.");
    } catch (e: any) {
      console.warn("  Could not drop:", e.message);
    }
  }

  // Rename typo columns (e.g. userld -> userId)
  for (const { from, to, def } of RENAME_FIXES) {
    if ((await countColumn(db, dbName, from)) > 0 && (await countColumn(db, dbName, to)) === 0) {
      console.log(`Renaming column "${from}" -> "${to}"...`);
      try {
        await db.execute(sql.raw(`ALTER TABLE \`${TABLE}\` CHANGE COLUMN \`${from}\` \`${to}\` ${def}`));
        console.log("  Renamed.");
      } catch (e: any) {
        console.warn("  Could not rename:", e.message);
      }
    }
  }

  // Add required columns if missing
  for (const { name, def } of REQUIRED_COLUMNS) {
    if ((await countColumn(db, dbName, name)) === 0) {
      console.log(`Adding column ${name}...`);
      try {
        await db.execute(sql.raw(`ALTER TABLE \`${TABLE}\` ADD COLUMN \`${name}\` ${def}`));
        console.log("  Added.");
      } catch (e: any) {
        console.warn("  Could not add:", e.message);
      }
    }
  }

  console.log("\nRepair done. Try completing onboarding again.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
