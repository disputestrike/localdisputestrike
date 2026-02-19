/**
 * Hybrid Claude Analyzer
 * Haiku: violation detection (fast)
 * Sonnet: prioritization, letter generation (quality)
 */

import Anthropic from '@anthropic-ai/sdk';
import { recordUsage } from './costTracker';
import {
  VIOLATION_DETECTION_SYSTEM,
  violationDetectionUser,
  PRIORITIZATION_SYSTEM,
  prioritizationUser,
  LETTER_GENERATION_SYSTEM,
  letterGenerationUser,
  ESCALATION_LETTER_SYSTEM,
  escalationLetterUser,
} from './prompts';

const anthropic: Anthropic | null = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// Log Claude status on module load
if (anthropic) {
  console.log('[Claude] ✓ Hybrid Claude API ready (ANTHROPIC_API_KEY set)');
} else {
  console.log('[Claude] ✗ Claude disabled (ANTHROPIC_API_KEY not set)');
}

const MODELS = {
  haiku: 'claude-3-haiku-20240307',
  sonnet: 'claude-sonnet-4-20250514',
} as const;

function safeJsonParse<T>(text: string, fallback: T): T {
  try {
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return parsed as T;
  } catch {
    return fallback;
  }
}

export interface DetectedViolation {
  type: string;
  severity: 'critical' | 'high' | 'medium';
  description: string;
}

export interface PrioritizationAssignment {
  accountId: number;
  round: 1 | 2 | 3;
  severity: number;
  reason: string;
}

/**
 * Detect additional FCRA violations using Haiku (cheap, fast)
 */
export async function detectViolations(accountJson: string): Promise<DetectedViolation[]> {
  if (!anthropic) return [];

  try {
    const res = await anthropic.messages.create({
      model: MODELS.haiku,
      max_tokens: 1024,
      system: VIOLATION_DETECTION_SYSTEM,
      messages: [{ role: 'user', content: violationDetectionUser(accountJson) }],
    });

    const usage = res.usage;
    if (usage) {
      recordUsage(
        MODELS.haiku,
        usage.input_tokens,
        usage.output_tokens,
        'violation_detection'
      );
    }

    const text =
      res.content[0]?.type === 'text' ? res.content[0].text : '[]';
    const arr = safeJsonParse<DetectedViolation[]>(text, []);
    const result = Array.isArray(arr) ? arr.filter((v) => v.type && v.severity) : [];
    if (result.length > 0) {
      console.log(`[Claude]   ✓ Haiku detected ${result.length} violation(s):`, result.map((v) => v.type).join(', '));
    }
    return result;
  } catch (e) {
    console.error('[Claude] Violation detection failed:', e);
    return [];
  }
}

/**
 * Prioritize accounts into rounds using Sonnet
 */
export async function prioritizeForRounds(
  accountsJson: string
): Promise<PrioritizationAssignment[]> {
  if (!anthropic) return [];

  try {
    const res = await anthropic.messages.create({
      model: MODELS.sonnet,
      max_tokens: 2048,
      system: PRIORITIZATION_SYSTEM,
      messages: [{ role: 'user', content: prioritizationUser(accountsJson) }],
    });

    const usage = res.usage;
    if (usage) {
      recordUsage(
        MODELS.sonnet,
        usage.input_tokens,
        usage.output_tokens,
        'prioritization'
      );
    }

    const text =
      res.content[0]?.type === 'text' ? res.content[0].text : '{}';
    const obj = safeJsonParse<{ assignments?: PrioritizationAssignment[] }>(text, {});
    const arr = obj.assignments;
    const result = Array.isArray(arr) ? arr.filter((a) => a.accountId != null && a.round) : [];
    if (result.length > 0) {
      console.log(`[Claude]   ✓ Sonnet allocated ${result.length} account(s) to rounds`);
    }
    return result;
  } catch (e) {
    console.error('[Claude] Prioritization failed:', e);
    return [];
  }
}

export interface LetterContext {
  fullName: string;
  currentAddress: string;
  date: string;
  accountName: string;
  accountNumber: string;
  accountType: string;
  balance: string;
  status: string;
  dateOpened: string;
  lastActivity: string;
  bureauName: string;
  bureauAddress: string;
  errorTypes: string[];
  primaryError: string;
}

/**
 * Generate dispute letter content using Sonnet
 */
export async function generateLetterContent(ctx: LetterContext): Promise<string | null> {
  if (!anthropic) return null;

  try {
    const res = await anthropic.messages.create({
      model: MODELS.sonnet,
      max_tokens: 2048,
      system: LETTER_GENERATION_SYSTEM,
      messages: [
        {
          role: 'user',
          content: letterGenerationUser(
            ctx.fullName,
            ctx.currentAddress,
            ctx.date,
            ctx.accountName,
            ctx.accountNumber,
            ctx.accountType,
            ctx.balance,
            ctx.status,
            ctx.dateOpened,
            ctx.lastActivity,
            ctx.bureauName,
            ctx.bureauAddress,
            ctx.errorTypes,
            ctx.primaryError
          ),
        },
      ],
    });

    const usage = res.usage;
    if (usage) {
      recordUsage(
        MODELS.sonnet,
        usage.input_tokens,
        usage.output_tokens,
        'letter_generation'
      );
    }

    const text = res.content[0]?.type === 'text' ? res.content[0].text : '';
    const out = text?.trim() || null;
    if (out) console.log('[Claude]   ✓ Sonnet generated letter');
    return out;
  } catch (e) {
    console.error('[Claude] Letter generation failed:', e);
    return null;
  }
}

/**
 * Generate escalation letter content (Round 2/3) using Sonnet
 */
export async function generateEscalationLetter(
  ctx: LetterContext & { round: number },
  previousDisputeDate: string,
  bureauResponseSummary?: string,
  newEvidenceSummary?: string
): Promise<string | null> {
  if (!anthropic) return null;

  try {
    const res = await anthropic.messages.create({
      model: MODELS.sonnet,
      max_tokens: 2048,
      system: ESCALATION_LETTER_SYSTEM,
      messages: [
        {
          role: 'user',
          content: escalationLetterUser(
            ctx,
            previousDisputeDate,
            bureauResponseSummary,
            newEvidenceSummary
          ),
        },
      ],
    });

    const usage = res.usage;
    if (usage) {
      recordUsage(
        MODELS.sonnet,
        usage.input_tokens,
        usage.output_tokens,
        'escalation_letter'
      );
    }

    const text = res.content[0]?.type === 'text' ? res.content[0].text : '';
    const out = text?.trim() || null;
    if (out) console.log(`[Claude]   ✓ Sonnet generated Round ${ctx.round} escalation letter`);
    return out;
  } catch (e) {
    console.error('[Claude] Escalation letter generation failed:', e);
    return null;
  }
}

export function isClaudeAvailable(): boolean {
  return !!anthropic;
}
