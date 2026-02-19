import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

let dbInstance: ReturnType<typeof drizzle> | null = null;

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000; // 2 seconds

export async function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  let retries = 0;
  while (retries < MAX_RETRIES) {
    try {
      const connection = await mysql.createConnection({
        uri: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: true, // For production, ensure valid SSL certs
        },
        connectionLimit: 10, // Connection pooling
        connectTimeout: 10000, // 10 seconds
      });

      dbInstance = drizzle(connection, { mode: "planetscale", schema });
      console.log("[Database] Connected to TiDB.");
      return dbInstance;
    } catch (error) {
      retries++;
      console.error(`[Database] Connection failed (attempt ${retries}/${MAX_RETRIES}):`, error);
      if (retries < MAX_RETRIES) {
        await new Promise(res => setTimeout(res, RETRY_DELAY_MS));
      } else {
        throw error; // Re-throw if max retries reached
      }
    }
  }
  throw new Error("Failed to connect to database after multiple retries.");
}

export const db = await getDb();
