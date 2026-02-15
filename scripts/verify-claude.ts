/**
 * Verify Hybrid Claude integration is wired correctly.
 * Run: pnpm exec tsx scripts/verify-claude.ts
 */

import 'dotenv/config';

async function main() {
  console.log('\n========== CLAUDE HYBRID VERIFICATION ==========\n');

  // 1. Check env
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  const useHybrid = process.env.USE_CLAUDE_HYBRID !== 'false';
  console.log('1. Environment:');
  console.log(`   ANTHROPIC_API_KEY: ${hasKey ? '✓ set' : '✗ NOT SET'}`);
  console.log(`   USE_CLAUDE_HYBRID: ${useHybrid ? 'enabled' : 'disabled'}`);

  // 2. Import Claude module
  let claudeOk = false;
  try {
    const { isClaudeAvailable } = await import('../server/claude');
    claudeOk = isClaudeAvailable();
    console.log(`\n2. Claude module: ${claudeOk ? '✓ loaded' : '✗ not available'}`);
  } catch (e) {
    console.log('\n2. Claude module: ✗ import failed', e);
  }

  // 3. Run scoreAccountsWithClaude with fake data (no API call if no key)
  let scorerOk = false;
  try {
    const { scoreAccountsWithClaude } = await import('../server/disputeStrategy');
    const fake = [
      { id: 1, accountName: 'Test', balance: 100, status: 'Collection', bureau: 'transunion' },
    ];
    const result = await scoreAccountsWithClaude(fake);
    scorerOk = result.length === 1 && result[0].round >= 1 && result[0].round <= 3;
    console.log(`\n3. scoreAccountsWithClaude: ${scorerOk ? '✓ works' : '✗ unexpected result'}`);
    console.log(`   Result: round=${result[0]?.round}, severity=${result[0]?.severity}`);
  } catch (e) {
    console.log('\n3. scoreAccountsWithClaude: ✗ failed', e);
  }

  // 4. Cost tracker
  try {
    const { getSessionTotal } = await import('../server/claude/costTracker');
    const t = getSessionTotal();
    console.log(`\n4. Cost tracker: ✓ (${t.totalCalls} calls, $${t.totalCostUsd.toFixed(6)} total)`);
  } catch (e) {
    console.log('\n4. Cost tracker: ✗', e);
  }

  console.log('\n================================================\n');
  if (hasKey && claudeOk && scorerOk) {
    console.log('✅ Claude Hybrid is wired and ready. Open Dispute Manager to trigger API calls.\n');
  } else if (!hasKey) {
    console.log('⚠️  Add ANTHROPIC_API_KEY to .ENV to enable Claude. Rule-based scoring still works.\n');
  } else {
    console.log('⚠️  Some checks failed. See above.\n');
  }
}

main().catch(console.error);
