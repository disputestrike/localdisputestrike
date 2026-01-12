import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { users } from "./drizzle/schema";

async function checkUsers() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection);
  
  const allUsers = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    openId: users.openId
  }).from(users);
  
  console.log("Current users:", JSON.stringify(allUsers, null, 2));
  
  await connection.end();
}

checkUsers().catch(console.error);
