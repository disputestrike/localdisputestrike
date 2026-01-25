import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

// Parse the connection string and add SSL
const url = new URL(connectionString.replace('mysql://', 'http://'));
const host = url.hostname;
const port = parseInt(url.port || '3306');
const user = url.username;
const password = url.password;
const database = url.pathname.slice(1).split('?')[0];

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host,
    port,
    user,
    password,
    database,
    ssl: {
      rejectUnauthorized: false
    }
  },
});
