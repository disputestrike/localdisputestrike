import { mysqlTable, varchar, timestamp, int, serial } from "drizzle-orm/mysql-core";

export const userSubscriptions = mysqlTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).notNull().unique(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }).notNull().unique(),
  stripePriceId: varchar("stripe_price_id", { length: 255 }).notNull(),
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_end").notNull().defaultNow(),
  status: varchar("status", { length: 255 }).notNull(), // e.g., active, canceled, trialing
});
