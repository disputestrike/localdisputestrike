/**
 * Dispute Strategy - Round-based dispute framework
 */

export {
  allocateAllRounds,
  getRound1Targets,
  getRound2Targets,
  getRound3Targets,
  getRecommendedAccountIdsForRound1,
  updateAfterRound1Results,
} from './roundManager';
export type { RoundAllocation, Round1Target, Round1Result } from './roundManager';
export { scoreAccounts, scoreAccountsWithClaude } from './disputeScorer';
export type { ScoredAccount } from './disputeScorer';
export { fillRound1Template } from './letterTemplates/round1';
export { fillRound2Template } from './letterTemplates/round2';
export { fillRound3Template } from './letterTemplates/round3';
export { findDuplicateGroups } from './duplicateFinder';
