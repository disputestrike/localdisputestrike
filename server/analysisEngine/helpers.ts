/**
 * Analysis Engine Helpers
 * Parsing, matching, and scoring utilities per user methodology
 */

export interface LateCounts {
  day30: number;
  day60: number;
  day90: number;
}

/**
 * Parse "4/1/1" or "30-60-90" format into structured late counts
 */
export function parseLateCounts(lateStr: string | undefined | null): LateCounts {
  const empty = { day30: 0, day60: 0, day90: 0 };
  if (!lateStr || typeof lateStr !== 'string') return empty;
  const s = lateStr.trim();
  if (!s || s === '0/0/0') return empty;

  // Format "4/1/1" (30/60/90 days)
  const slashMatch = s.match(/(\d+)\/(\d+)\/(\d+)/);
  if (slashMatch) {
    return {
      day30: Math.max(0, parseInt(slashMatch[1], 10) || 0),
      day60: Math.max(0, parseInt(slashMatch[2], 10) || 0),
      day90: Math.max(0, parseInt(slashMatch[3], 10) || 0),
    };
  }

  // Format "30-60-90" or "6-8-28"
  const dashMatch = s.match(/(\d+)\s*[-–]\s*(\d+)\s*[-–]\s*(\d+)/);
  if (dashMatch) {
    return {
      day30: Math.max(0, parseInt(dashMatch[1], 10) || 0),
      day60: Math.max(0, parseInt(dashMatch[2], 10) || 0),
      day90: Math.max(0, parseInt(dashMatch[3], 10) || 0),
    };
  }

  // Try to extract any numbers
  const nums = s.match(/\d+/g);
  if (nums && nums.length >= 3) {
    return {
      day30: Math.max(0, parseInt(nums[0], 10) || 0),
      day60: Math.max(0, parseInt(nums[1], 10) || 0),
      day90: Math.max(0, parseInt(nums[2], 10) || 0),
    };
  }
  if (nums && nums.length >= 1) {
    const n = Math.max(0, parseInt(nums[0], 10) || 0);
    if (n > 0) return { day30: n, day60: 0, day90: 0 };
  }

  return empty;
}

/**
 * Parse "$9,270.00" or "9270" into number
 */
export function parseBalance(val: unknown): number {
  if (typeof val === 'number' && Number.isFinite(val)) return val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[$,]/g, '').trim();
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/**
 * Simple Levenshtein-based similarity (0-1)
 */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const d: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  return d[m][n];
}

/**
 * Fuzzy string similarity 0-100
 */
export function fuzzyMatch(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (s1 === s2) return 100;
  const maxLen = Math.max(s1.length, s2.length, 1);
  const dist = levenshtein(s1, s2);
  return Math.round(100 * (1 - dist / maxLen));
}

/**
 * Normalize creditor name for matching
 */
export function normalizeCreditorName(name: string): string {
  if (!name) return '';
  return name
    .replace(/\b(INC|LLC|LTD|CORP|CO)\b/gi, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .toLowerCase()
    .trim();
}
