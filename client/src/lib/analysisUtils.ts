/**
 * Preview analysis utilities: impact score, potential ranges, score rating.
 * Used by /preview-results page.
 *
 * Credit score domain: 300–850 (FICO/VantageScore). Current from report; improvement from AI analysis; 850 max total.
 */

/** Credit score scale: 300–850 */
export const CREDIT_SCORE_MIN = 300;
export const CREDIT_SCORE_MAX = 850;

/** Max point gain = ceiling minus floor */
const MAX_POINT_GAIN = CREDIT_SCORE_MAX - CREDIT_SCORE_MIN;

export interface CategoryCounts {
  collections: number;
  latePayments: number;
  chargeOffs: number;
}

export interface ImpactPrediction {
  impactScore: number;
  conservative: { min: number; max: number; label: string };
  moderate: { min: number; max: number; label: string };
  optimistic: { min: number; max: number; label: string };
  rangeLabel: string;
}

/**
 * Clamp a score to the valid credit score range [300, 850].
 */
export function clampScore(score: number): number {
  return Math.max(CREDIT_SCORE_MIN, Math.min(CREDIT_SCORE_MAX, Math.round(score)));
}

/**
 * Calculate potential score impact from violation counts (raw, before capping by current score).
 * Formula: collections×15 + latePayments×8 + chargeOffs×12.
 * Capped by MAX_POINT_GAIN (500) so raw gains never exceed scale.
 */
export function calculateImpactPrediction(categories: CategoryCounts): ImpactPrediction {
  const { collections, latePayments, chargeOffs } = categories;
  const rawImpact =
    collections * 15 +
    latePayments * 8 +
    chargeOffs * 12;
  const impactScore = Math.min(rawImpact, MAX_POINT_GAIN);

  const consBase = Math.min(Math.floor(impactScore * 0.5), MAX_POINT_GAIN - 20);
  const modBase = Math.min(Math.floor(impactScore * 0.75), MAX_POINT_GAIN - 30);
  const optBase = Math.min(Math.floor(impactScore * 1.2), MAX_POINT_GAIN - 50);

  const consMax = Math.min(consBase + 20, MAX_POINT_GAIN);
  const modMax = Math.min(modBase + 30, MAX_POINT_GAIN);
  const optMax = Math.min(optBase + 50, MAX_POINT_GAIN);

  return {
    impactScore,
    conservative: { min: consBase, max: consMax, label: `+${consBase}-${consMax}` },
    moderate: { min: modBase, max: modMax, label: `+${modBase}-${modMax}` },
    optimistic: { min: optBase, max: optMax, label: `+${optBase}-${optMax}` },
    rangeLabel: `+${consBase} to +${optMax}`,
  };
}

/**
 * Cap impact prediction for display when we have a current score from the report.
 * Point gains can never exceed (850 - currentScore). All numbers stay real and possible.
 */
export function capImpactForDisplay(
  currentScore: number,
  impact: ImpactPrediction
): ImpactPrediction {
  const clampedCurrent = clampScore(currentScore);
  const maxGain = CREDIT_SCORE_MAX - clampedCurrent;
  if (maxGain <= 0) {
    return {
      ...impact,
      conservative: { min: 0, max: 0, label: '+0' },
      moderate: { min: 0, max: 0, label: '+0' },
      optimistic: { min: 0, max: 0, label: '+0' },
      rangeLabel: '+0',
    };
  }

  const cap = (min: number, max: number) => {
    const low = Math.min(min, maxGain);
    const high = Math.min(max, maxGain);
    const lowFinal = Math.min(low, high);
    const highFinal = high;
    return {
      min: lowFinal,
      max: highFinal,
      label: `+${lowFinal}-${highFinal}`,
    };
  };

  let cons = cap(impact.conservative.min, impact.conservative.max);
  let mod = cap(impact.moderate.min, impact.moderate.max);
  let opt = cap(impact.optimistic.min, impact.optimistic.max);

  // When Moderate and Optimistic collapse to the same single point (e.g. "+263-263"), split into two distinct ranges
  if (mod.min === mod.max && opt.min === opt.max && mod.max === opt.max && maxGain > cons.max) {
    const mid = cons.max + Math.max(1, Math.floor((maxGain - cons.max) / 2));
    mod = { min: cons.max + 1, max: mid, label: `+${cons.max + 1}-${mid}` };
    opt = { min: mid + 1, max: maxGain, label: `+${mid + 1}-${maxGain}` };
  } else if (mod.min === mod.max && mod.max > cons.max) {
    const modMax = Math.min(cons.max + Math.max(1, Math.floor((maxGain - cons.max) / 2)), maxGain);
    mod = { min: cons.max + 1, max: modMax, label: `+${cons.max + 1}-${modMax}` };
  }
  if (opt.min === opt.max && opt.max <= maxGain && mod.max < opt.max) {
    opt = { min: mod.max + 1, max: maxGain, label: `+${mod.max + 1}-${maxGain}` };
  }

  const displayMin = cons.min;
  const displayMax = Math.min(impact.optimistic.max, maxGain);

  return {
    ...impact,
    conservative: { ...impact.conservative, ...cons },
    moderate: { ...impact.moderate, ...mod },
    optimistic: { ...impact.optimistic, ...opt },
    rangeLabel: `+${displayMin} to +${displayMax}`,
  };
}

/**
 * Potential score range from current score (from report) + impact (from AI analysis).
 * All scores clamped to [300, 850]; potential never exceeds 850.
 */
export function calculatePotentialRange(
  currentScore: number,
  impact: ImpactPrediction
): { minPotential: number; maxPotential: number; range: string } {
  const clampedCurrent = clampScore(currentScore);

  const minPotential = clampScore(clampedCurrent + impact.conservative.min);
  const maxPotential = clampScore(Math.min(clampedCurrent + impact.optimistic.max, CREDIT_SCORE_MAX));

  return {
    minPotential,
    maxPotential,
    range: `${minPotential}-${maxPotential}`,
  };
}

/** FICO-style bands: <580 POOR, 580-669 FAIR, 670-739 GOOD, 740+ EXCELLENT */
export function scoreToRating(score: number): string {
  if (score < 580) return 'POOR';
  if (score < 670) return 'FAIR';
  if (score < 740) return 'GOOD';
  return 'EXCELLENT';
}

/** e.g. "632-737" → "FAIR-GOOD" (use low end for conservative rating). */
export function rangeToRatingLabel(low: number, high: number): string {
  const rLow = scoreToRating(low);
  const rHigh = scoreToRating(high);
  return rLow === rHigh ? rLow : `${rLow}-${rHigh}`;
}
