/**
 * Cleanup script to delete all user data for master test
 * This will be called via a tRPC endpoint
 */

import { getDb } from './db';
import { eq } from 'drizzle-orm';
import { 
  creditReports, 
  negativeAccounts, 
  disputeLetters, 
  userProfiles,
  disputeOutcomes,
  hardInquiries,
  cfpbComplaints
} from '../drizzle/schema';

export async function cleanupUserData(userId: number): Promise<{
  deletedReports: number;
  deletedAccounts: number;
  deletedLetters: number;
  deletedProfile: boolean;
  deletedOutcomes: number;
  deletedInquiries: number;
  deletedComplaints: number;
}> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Delete dispute letters first (depends on accounts)
  const deletedLetters = await db.delete(disputeLetters)
    .where(eq(disputeLetters.userId, userId));

  // Delete dispute outcomes
  const deletedOutcomes = await db.delete(disputeOutcomes)
    .where(eq(disputeOutcomes.userId, userId));

  // Delete hard inquiries
  const deletedInquiries = await db.delete(hardInquiries)
    .where(eq(hardInquiries.userId, userId));

  // Delete CFPB complaints
  const deletedComplaints = await db.delete(cfpbComplaints)
    .where(eq(cfpbComplaints.userId, userId));

  // Delete negative accounts
  const deletedAccounts = await db.delete(negativeAccounts)
    .where(eq(negativeAccounts.userId, userId));

  // Delete credit reports
  const deletedReports = await db.delete(creditReports)
    .where(eq(creditReports.userId, userId));

  // Delete user profile (will be re-extracted from new upload)
  const deletedProfile = await db.delete(userProfiles)
    .where(eq(userProfiles.userId, userId));

  return {
    deletedReports: (deletedReports as any)[0]?.affectedRows || 0,
    deletedAccounts: (deletedAccounts as any)[0]?.affectedRows || 0,
    deletedLetters: (deletedLetters as any)[0]?.affectedRows || 0,
    deletedProfile: ((deletedProfile as any)[0]?.affectedRows || 0) > 0,
    deletedOutcomes: (deletedOutcomes as any)[0]?.affectedRows || 0,
    deletedInquiries: (deletedInquiries as any)[0]?.affectedRows || 0,
    deletedComplaints: (deletedComplaints as any)[0]?.affectedRows || 0,
  };
}
