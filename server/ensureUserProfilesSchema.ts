/**
 * Ensures user_profiles has all columns the schema expects.
 * Run once on server startup to self-heal missing columns (e.g. if migrations weren't applied).
 */
import { sql } from "drizzle-orm";
import { getDb } from "./db";

const TABLE = "user_profiles";
const COLUMNS_TO_ADD: { name: string; def: string }[] = [
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

export async function ensureUserProfilesSchema(): Promise<void> {
  const db = await getDb();
  if (!db) return;
  for (const { name, def } of COLUMNS_TO_ADD) {
    try {
      await db.execute(sql.raw(`ALTER TABLE \`${TABLE}\` ADD COLUMN \`${name}\` ${def}`));
      console.log(`[Schema] Added user_profiles.${name}`);
    } catch (e: any) {
      const code = e?.code ?? e?.cause?.code;
      const msg = String(e?.message ?? e?.cause?.message ?? e ?? "");
      const isDup = code === "ER_DUP_FIELDNAME" || code === "ER_DUP_COLUMNNAME" || /duplicate column name/i.test(msg);
      if (isDup) continue;
      console.warn(`[Schema] Could not add ${name}:`, msg);
    }
  }
}
