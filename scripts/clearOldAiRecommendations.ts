/**
 * Clear old data or full reset
 * Run: npm run db:clear-old-ai-recommendations
 * Run: npm run db:reset-all
 * Uses app's getDb() - same SSL/config as server.
 */

import 'dotenv/config';
import { clearOldAiRecommendations, resetAllDisputeData } from '../server/db';

const cmd = process.argv[2] || 'clear';

async function main() {
  try {
    if (cmd === 'reset') {
      const counts = await resetAllDisputeData();
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      console.log('[resetAllDisputeData] Deleted:', counts);
      console.log('[resetAllDisputeData] Total rows:', total);
    } else {
      const affected = await clearOldAiRecommendations();
      console.log(`[clearOldAiRecommendations] Deleted ${affected} rows from ai_recommendations`);
    }
  } catch (e: any) {
    if (e?.code === 'ETIMEDOUT' || e?.cause?.code === 'ETIMEDOUT') {
      console.log('DB unreachable. Start the app and use Admin → Reset All Data');
      process.exit(0);
    }
    throw e;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
