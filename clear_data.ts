
import { getDb } from './server/db';
import { 
  users, userProfiles, creditReports, negativeAccounts, disputeLetters, 
  payments, subscriptions, mailingChecklists, contactSubmissions, 
  emailLeads, courseProgress, courseCertificates, disputeOutcomes, 
  hardInquiries, cfpbComplaints, referrals, activityLog, agencies, 
  agencyClients, agencyClientReports, agencyClientAccounts, 
  agencyClientLetters, creditScoreHistory, userNotifications, 
  userDocuments, smartcreditPulls, subscriptionsV2, disputeRounds, 
  trialConversions, aiRecommendations 
} from './drizzle/schema';

async function clearAllData() {
  console.log("Starting database cleanup...");
  const db = await getDb();
  if (!db) {
    console.error("Could not connect to database.");
    return;
  }

  const tables = [
    aiRecommendations, trialConversions, disputeRounds, subscriptionsV2, 
    smartcreditPulls, userDocuments, userNotifications, creditScoreHistory, 
    agencyClientLetters, agencyClientAccounts, agencyClientReports, 
    agencyClientReports, agencyClients, agencies, activityLog, referrals, 
    cfpbComplaints, hardInquiries, disputeOutcomes, courseCertificates, 
    courseProgress, emailLeads, contactSubmissions, mailingChecklists, 
    subscriptions, payments, disputeLetters, negativeAccounts, 
    creditReports, userProfiles, users
  ];

  for (const table of tables) {
    try {
      await db.delete(table);
      console.log(`Cleared table: ${table._.name.name}`);
    } catch (e: any) {
      if (e.code === 'ER_NO_SUCH_TABLE') {
        // Skip if table doesn't exist
      } else {
        console.warn(`Could not clear table ${table._.name.name}:`, e.message);
      }
    }
  }

  console.log("Database cleanup complete.");
}

clearAllData().catch(console.error);
