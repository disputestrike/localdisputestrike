import "dotenv/config";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { sql } from "drizzle-orm";
import { getDb } from "../server/db";

const MIGRATIONS_TABLE = "__drizzle_migrations";

function getDatabaseName(): string {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL is required");
  }
  const url = new URL(dbUrl.replace("mysql://", "http://"));
  return url.pathname.slice(1).split("?")[0];
}

async function tableExists(db: any, tableName: string, dbName: string): Promise<boolean> {
  const result = await db.execute(
    sql`SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ${dbName} AND table_name = ${tableName}`
  );
  const rows = Array.isArray(result) && Array.isArray(result[0]) ? result[0] : result;
  const count = Number((rows as any)[0]?.count ?? (rows as any)[0]?.["COUNT(*)"] ?? 0);
  return count > 0;
}

async function getMigrationFiles() {
  const drizzleDir = path.resolve("drizzle");
  const entries = await fs.readdir(drizzleDir);
  return entries
    .filter((file) => file.endsWith(".sql"))
    .sort();
}

async function getJournalTags() {
  const journalPath = path.resolve("drizzle", "meta", "_journal.json");
  const raw = await fs.readFile(journalPath, "utf8");
  const data = JSON.parse(raw);
  const tags: string[] = Array.isArray(data?.entries)
    ? data.entries.map((entry: any) => entry.tag).filter(Boolean)
    : [];
  return new Set(tags);
}

async function shouldMarkApplied(db: any, dbName: string, sqlContent: string) {
  const createTableRegex = /CREATE TABLE\s+`?([a-zA-Z0-9_]+)`?/gi;
  const tables = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = createTableRegex.exec(sqlContent)) !== null) {
    tables.add(match[1]);
  }

  if (tables.size === 0) {
    return false;
  }

  for (const tableName of tables) {
    const exists = await tableExists(db, tableName, dbName);
    if (!exists) {
      return false;
    }
  }

  return true;
}

async function reconcileMigrationTable(db: any, dbName: string) {
  const files = await getMigrationFiles();
  if (files.length === 0) {
    console.warn("[Migrations] No migration SQL files found.");
    return;
  }

  for (const file of files) {
    const fullPath = path.resolve("drizzle", file);
    const sqlContent = await fs.readFile(fullPath, "utf8");
    const shouldApply = await shouldMarkApplied(db, dbName, sqlContent);
    const hash = crypto.createHash("sha256").update(sqlContent).digest("hex");
    const createdAt = Date.now();

    const existing = await db.execute(
      sql`SELECT COUNT(*) as count FROM ${sql.raw(MIGRATIONS_TABLE)} WHERE hash = ${hash}`
    );
    const rows = Array.isArray(existing) && Array.isArray(existing[0]) ? existing[0] : existing;
    const count = Number((rows as any)[0]?.count ?? (rows as any)[0]?.["COUNT(*)"] ?? 0);
    if (shouldApply && count === 0) {
      await db.execute(
        sql`INSERT INTO ${sql.raw(MIGRATIONS_TABLE)} (hash, created_at) VALUES (${hash}, ${createdAt})`
      );
      continue;
    }

    if (!shouldApply && count > 0) {
      await db.execute(
        sql`DELETE FROM ${sql.raw(MIGRATIONS_TABLE)} WHERE hash = ${hash}`
      );
    }
  }
}

async function applyLegacyMigrations(db: any) {
  const journalTags = await getJournalTags();
  const files = await getMigrationFiles();
  const legacyFiles = files.filter((file) => !journalTags.has(file.replace(/\.sql$/, "")));

  for (const file of legacyFiles) {
    const fullPath = path.resolve("drizzle", file);
    const sqlContent = await fs.readFile(fullPath, "utf8");
    try {
      await db.execute(sql.raw(sqlContent));
      console.log(`[Migrations] Applied legacy migration: ${file}`);
    } catch (error: any) {
      const code = error?.code || error?.cause?.code;
      if (code === "ER_TABLE_EXISTS_ERROR" || code === "ER_DUP_FIELDNAME") {
        console.warn(`[Migrations] Skipped legacy migration (already applied): ${file}`);
        continue;
      }
      throw error;
    }
  }
}

async function repairMigrations() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available. Check DATABASE_URL.");
  }

  const dbName = getDatabaseName();
  const migrationsTableExists = await tableExists(db, MIGRATIONS_TABLE, dbName);
  if (!migrationsTableExists) {
    console.warn(`[Migrations] ${MIGRATIONS_TABLE} table missing. Creating it now.`);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ${sql.raw(MIGRATIONS_TABLE)} (
        id int AUTO_INCREMENT NOT NULL,
        hash varchar(255) NOT NULL,
        created_at bigint NOT NULL,
        CONSTRAINT ${sql.raw(`${MIGRATIONS_TABLE}_id`)} PRIMARY KEY(id)
      )
    `);
  }

  console.warn("[Migrations] Reconciling migration history with current schema.");
  await reconcileMigrationTable(db, dbName);
  await applyLegacyMigrations(db);

  console.log("[Migrations] Repair complete.");
  process.exit(0);
}

repairMigrations().catch((error) => {
  console.error("[Migrations] Repair failed:", error);
  process.exit(1);
});
