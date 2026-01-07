/**
 * AI-Powered Success Story Generator
 * 
 * Automatically creates compelling testimonials from user success data
 * for marketing purposes (with user permission)
 */

import { invokeLLM } from "./_core/llm";

export interface SuccessMetrics {
  userName: string;
  scoreBefore: number;
  scoreAfter: number;
  scoreIncrease: number;
  accountsDeleted: number;
  accountsVerified: number;
  daysToResults: number;
  specificDeletions?: string[]; // e.g., ["PNC Bank", "Ford Motor Credit"]
}

export interface TestimonialOptions {
  tone: 'professional' | 'casual' | 'emotional';
  length: 'short' | 'medium' | 'long';
  includeSpecifics: boolean; // Include specific account names
  anonymizationLevel: 'full_name' | 'first_name' | 'initials' | 'anonymous';
}

/**
 * Generate AI-powered testimonial from success metrics
 */
export async function generateTestimonial(
  metrics: SuccessMetrics,
  options: TestimonialOptions
): Promise<string> {
  // Anonymize name based on preference
  const displayName = anonymizeName(metrics.userName, options.anonymizationLevel);
  
  // Build AI prompt
  const prompt = `Generate a compelling testimonial for a credit dispute success story.

**User Success Metrics:**
- Name: ${displayName}
- Score Before: ${metrics.scoreBefore}
- Score After: ${metrics.scoreAfter}
- Score Increase: +${metrics.scoreIncrease} points
- Accounts Deleted: ${metrics.accountsDeleted}
- Accounts Verified: ${metrics.accountsVerified}
- Time to Results: ${metrics.daysToResults} days
${options.includeSpecifics && metrics.specificDeletions ? `- Specific Deletions: ${metrics.specificDeletions.join(', ')}` : ''}

**Tone:** ${options.tone}
**Length:** ${options.length} (${options.length === 'short' ? '2-3 sentences' : options.length === 'medium' ? '4-6 sentences' : '7-10 sentences'})

**Requirements:**
1. Write in first person as if ${displayName} is speaking
2. Focus on the emotional journey and life-changing impact
3. Mention specific numbers (score increase, accounts deleted)
4. Include before/after context (what was impossible before, what's possible now)
5. Sound authentic and genuine, not overly salesy
6. ${options.tone === 'professional' ? 'Use professional language suitable for LinkedIn' : options.tone === 'casual' ? 'Use conversational, friendly language' : 'Use emotional, heartfelt language that conveys relief and gratitude'}

**Example structure:**
- Opening: Brief context of credit situation before
- Middle: The results achieved (specific numbers)
- Closing: How life has changed / what's now possible

Write the testimonial now:`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are an expert copywriter specializing in authentic, compelling testimonials. You write success stories that feel genuine and relatable while highlighting impressive results.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const rawContent = response.choices[0]?.message?.content;
    if (!rawContent || typeof rawContent !== 'string') {
      throw new Error('Failed to generate testimonial');
    }

    return rawContent.trim();
  } catch (error) {
    console.error('Error generating testimonial:', error);
    throw new Error('Failed to generate testimonial');
  }
}

/**
 * Anonymize user name based on preference
 */
function anonymizeName(fullName: string, level: TestimonialOptions['anonymizationLevel']): string {
  if (level === 'anonymous') {
    return 'A DisputeForce User';
  }

  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0] || 'User';
  const lastName = nameParts[nameParts.length - 1] || '';

  switch (level) {
    case 'full_name':
      return fullName;
    case 'first_name':
      return `${firstName} ${lastName.charAt(0)}.`;
    case 'initials':
      return `${firstName.charAt(0)}.${lastName.charAt(0)}.`;
    default:
      return firstName;
  }
}

/**
 * Generate multiple testimonial variations
 */
export async function generateTestimonialVariations(
  metrics: SuccessMetrics
): Promise<{
  professional: string;
  casual: string;
  emotional: string;
}> {
  const [professional, casual, emotional] = await Promise.all([
    generateTestimonial(metrics, {
      tone: 'professional',
      length: 'medium',
      includeSpecifics: true,
      anonymizationLevel: 'first_name',
    }),
    generateTestimonial(metrics, {
      tone: 'casual',
      length: 'medium',
      includeSpecifics: true,
      anonymizationLevel: 'first_name',
    }),
    generateTestimonial(metrics, {
      tone: 'emotional',
      length: 'long',
      includeSpecifics: false,
      anonymizationLevel: 'first_name',
    }),
  ]);

  return { professional, casual, emotional };
}

/**
 * Calculate success metrics from user data
 */
export async function calculateSuccessMetrics(userId: number): Promise<SuccessMetrics | null> {
  const { getNegativeAccountsByUserId, getDisputeLettersByUserId, getUserById } = await import('./db');
  
  // Get user
  const user = await getUserById(userId);
  
  if (!user) {
    return null;
  }
  
  // Get user's accounts
  const accounts = await getNegativeAccountsByUserId(userId);
  
  // Count deleted vs verified accounts
  const accountsDeleted = accounts.filter(acc => 
    acc.status?.toLowerCase().includes('deleted') || 
    acc.status?.toLowerCase().includes('removed')
  ).length;
  
  const accountsVerified = accounts.filter(acc =>
    acc.status?.toLowerCase().includes('verified')
  ).length;
  
  // Get dispute letters to calculate timeline
  const letters = await getDisputeLettersByUserId(userId);
  const mailedLetters = letters.filter(l => l.mailedAt);
  
  if (mailedLetters.length === 0) {
    return null; // No mailed letters yet
  }
  
  // Calculate days to results (from first mailed letter to now)
  const firstMailedDate = new Date(Math.min(...mailedLetters.map(l => new Date(l.mailedAt!).getTime())));
  const daysToResults = Math.floor((Date.now() - firstMailedDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Get specific deletions
  const specificDeletions = accounts
    .filter(acc => acc.status?.toLowerCase().includes('deleted'))
    .map(acc => acc.accountName)
    .slice(0, 3); // Top 3 deletions
  
  // TODO: Get actual before/after scores from user profile or credit reports
  // For now, estimate based on deletions (each deletion = ~10-15 points)
  const estimatedIncrease = accountsDeleted * 12;
  const scoreBefore = 600 - estimatedIncrease; // Estimate
  const scoreAfter = 600; // Estimate
  
  return {
    userName: user.name || 'User',
    scoreBefore,
    scoreAfter,
    scoreIncrease: estimatedIncrease,
    accountsDeleted,
    accountsVerified,
    daysToResults,
    specificDeletions,
  };
}

/**
 * Check if user is eligible for success story
 */
export function isEligibleForSuccessStory(metrics: SuccessMetrics): boolean {
  // Criteria for success story:
  // - At least 2 accounts deleted OR
  // - Score increase of 30+ points OR
  // - At least 5 accounts deleted
  return (
    metrics.accountsDeleted >= 2 ||
    metrics.scoreIncrease >= 30 ||
    metrics.accountsDeleted >= 5
  );
}
