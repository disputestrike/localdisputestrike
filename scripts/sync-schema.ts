import "dotenv/config";
import { sql } from "drizzle-orm";
import { getDb } from "../server/db";

type ColumnSpec = {
  name: string;
  definition: string;
};

function getDatabaseName(): string {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL is required");
  }
  const url = new URL(dbUrl.replace("mysql://", "http://"));
  return url.pathname.slice(1).split("?")[0];
}

async function columnExists(db: any, dbName: string, tableName: string, columnName: string) {
  const result = await db.execute(
    sql`SELECT COUNT(*) as count FROM information_schema.columns WHERE table_schema = ${dbName} AND table_name = ${tableName} AND column_name = ${columnName}`
  );
  const rows = Array.isArray(result) && Array.isArray(result[0]) ? result[0] : result;
  const count = Number((rows as any)[0]?.count ?? (rows as any)[0]?.["COUNT(*)"] ?? 0);
  return count > 0;
}

async function ensureColumns(
  db: any,
  dbName: string,
  tableName: string,
  columns: ColumnSpec[]
) {
  for (const column of columns) {
    const exists = await columnExists(db, dbName, tableName, column.name);
    if (exists) continue;
    const statement = `ALTER TABLE \`${tableName}\` ADD COLUMN ${column.definition};`;
    await db.execute(sql.raw(statement));
    console.log(`[Schema] Added ${tableName}.${column.name}`);
  }
}

async function syncSchema() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available. Check DATABASE_URL.");
  }

  const dbName = getDatabaseName();

  await ensureColumns(db, dbName, "user_profiles", [
    { name: "firstName", definition: "`firstName` varchar(100)" },
    { name: "middleInitial", definition: "`middleInitial` varchar(1)" },
    { name: "lastName", definition: "`lastName` varchar(100)" },
    { name: "ssnFull", definition: "`ssnFull` varchar(255)" },
    { name: "signatureUrl", definition: "`signatureUrl` text" },
    { name: "signatureCreatedAt", definition: "`signatureCreatedAt` timestamp" },
    { name: "addressVerified", definition: "`addressVerified` boolean DEFAULT false" },
    { name: "addressVerifiedAt", definition: "`addressVerifiedAt` timestamp" },
    { name: "lobAddressId", definition: "`lobAddressId` varchar(255)" },
    { name: "isComplete", definition: "`isComplete` boolean DEFAULT false" },
    { name: "completedAt", definition: "`completedAt` timestamp" },
  ]);

  await ensureColumns(db, dbName, "credit_reports", [
    { name: "creditScore", definition: "`creditScore` int" },
    { name: "scoreModel", definition: "`scoreModel` varchar(50)" },
    {
      name: "reportSource",
      definition:
        "`reportSource` enum('smartcredit','identityiq','annualcreditreport','direct_upload') DEFAULT 'direct_upload'",
    },
    { name: "aiTokensUsed", definition: "`aiTokensUsed` int" },
    { name: "aiProcessingCost", definition: "`aiProcessingCost` decimal(10,4)" },
    { name: "aiModel", definition: "`aiModel` varchar(50)" },
    {
      name: "processingStatus",
      definition:
        "`processingStatus` enum('pending','processing','completed','failed') DEFAULT 'pending'",
    },
    { name: "processingError", definition: "`processingError` text" },
  ]);

  await ensureColumns(db, dbName, "dispute_letters", [
    { name: "recipientName", definition: "`recipientName` text" },
    { name: "recipientAddress", definition: "`recipientAddress` text" },
    { name: "accountsDisputed", definition: "`accountsDisputed` text" },
    { name: "round", definition: "`round` int DEFAULT 1" },
    {
      name: "letterType",
      definition:
        "`letterType` enum('initial','followup','escalation','cfpb','cease_desist','pay_for_delete','intent_to_sue','estoppel','debt_validation') DEFAULT 'initial'",
    },
    {
      name: "status",
      definition:
        "`status` enum('generated','downloaded','mailed','response_received','resolved') DEFAULT 'generated'",
    },
    { name: "mailedAt", definition: "`mailedAt` timestamp" },
    { name: "trackingNumber", definition: "`trackingNumber` varchar(100)" },
    { name: "responseDeadline", definition: "`responseDeadline` timestamp" },
    { name: "responseReceivedAt", definition: "`responseReceivedAt` timestamp" },
    { name: "responseDetails", definition: "`responseDetails` text" },
    { name: "lobLetterId", definition: "`lobLetterId` varchar(255)" },
    {
      name: "lobMailingStatus",
      definition:
        "`lobMailingStatus` enum('pending','processing','printed','mailed','in_transit','delivered','returned','failed')",
    },
    { name: "lobTrackingEvents", definition: "`lobTrackingEvents` text" },
    { name: "lobCost", definition: "`lobCost` decimal(10,2)" },
    { name: "userAuthorizedAt", definition: "`userAuthorizedAt` timestamp" },
    { name: "userAuthorizationIp", definition: "`userAuthorizationIp` varchar(45)" },
  ]);

  console.log("[Schema] Sync complete.");
  process.exit(0);
}

syncSchema().catch((error) => {
  console.error("[Schema] Sync failed:", error);
  process.exit(1);
});
