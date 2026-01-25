/**
 * Preview analysis utilities: impact score, potential ranges, score rating.
 * Used by /preview-results page.
 */

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
 * Calculate potential score impact from violation counts.
 * Formula: collections×15 + latePayments×8 + chargeOffs×12.
 */
export function calculateImpactPrediction(categories: CategoryCounts): ImpactPrediction {
  const { collections, latePayments, chargeOffs } = categories;
  const impactScore =
    collections * 15 +
    latePayments * 8 +
    chargeOffs * 12;

  const consBase = Math.floor(impactScore * 0.5);
  const modBase = Math.floor(impactScore * 0.75);
  const optBase = Math.floor(impactScore * 1.2);

  return {
    impactScore,
    conservative: { min: consBase, max: consBase + 20, label: `+${consBase}-${consBase + 20}` },
    moderate: { min: modBase, max: modBase + 30, label: `+${modBase}-${modBase + 30}` },
    optimistic: { min: optBase, max: optBase + 50, label: `+${optBase}-${optBase + 50}` },
    rangeLabel: `+${consBase} to +${optBase + 50}`,
  };
}

/**
 * Potential score range from current score + impact.
 */
export function calculatePotentialRange(
  currentScore: number,
  impact: ImpactPrediction
): { minPotential: number; maxPotential: number; range: string } {
  const minPotential = currentScore + impact.conservative.min;
  const maxPotential = currentScore + impact.optimistic.max;
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
