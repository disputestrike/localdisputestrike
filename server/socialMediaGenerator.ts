/**
 * Social Media Graphics Generator for Success Stories
 * 
 * Generates shareable Instagram/Facebook graphics with before/after scores
 */

import { generateImage } from "./_core/imageGeneration";
import { storagePut } from "./storage";
import type { SuccessStory } from "../drizzle/schema";

export interface SocialMediaGraphicOptions {
  format: 'instagram-post' | 'instagram-story' | 'facebook-post';
  style: 'modern' | 'professional' | 'bold';
}

/**
 * Generate social media graphic for a success story
 */
export async function generateSuccessStoryGraphic(
  story: SuccessStory,
  options: SocialMediaGraphicOptions
): Promise<{ url: string; fileKey: string }> {
  // Determine aspect ratio based on format
  const aspectRatio = options.format === 'instagram-story' ? 'portrait' : 'square';
  
  // Build detailed prompt for image generation
  const prompt = buildGraphicPrompt(story, options);
  
  // Generate temporary file path
  const tempPath = `/tmp/success-story-${story.id}-${Date.now()}.png`;
  
  // Generate image using AI
  const result = await generateImage({ prompt });
  
  if (!result.url) {
    throw new Error('Failed to generate image');
  }
  
  // Download generated image
  const response = await fetch(result.url);
  const imageBuffer = Buffer.from(await response.arrayBuffer());
  
  // Upload to S3
  const fileKey = `success-stories/${story.id}/social-${options.format}-${Date.now()}.png`;
  const { url } = await storagePut(
    fileKey,
    imageBuffer,
    'image/png'
  );
  
  return { url, fileKey };
}

/**
 * Build detailed prompt for social media graphic
 */
function buildGraphicPrompt(
  story: SuccessStory,
  options: SocialMediaGraphicOptions
): string {
  const { displayName, scoreBefore, scoreAfter, scoreIncrease, accountsDeleted } = story;
  
  const styleDescriptions = {
    modern: 'modern, clean, minimalist design with gradient backgrounds (blue to purple), rounded corners, and sans-serif typography',
    professional: 'professional, corporate design with navy blue and gold accents, sharp edges, and serif typography',
    bold: 'bold, eye-catching design with bright colors (orange, green, yellow), large text, and dynamic layouts',
  };
  
  const formatDescriptions = {
    'instagram-post': '1080x1080px square format, centered content',
    'instagram-story': '1080x1920px vertical format, content in safe zone (avoid top/bottom 250px)',
    'facebook-post': '1200x630px horizontal format, content centered',
  };
  
  return `Create a ${styleDescriptions[options.style]} social media graphic for ${formatDescriptions[options.format]}.

**Content to Display:**

HEADER (Top Section):
- "SUCCESS STORY" badge or label
- DisputeForce logo (shield icon with "DisputeForce" text)

MAIN CONTENT (Center Section):
- Large, prominent display of credit score transformation:
  * "BEFORE: ${scoreBefore}" in red/orange color
  * Large arrow pointing right (→) or upward (↑)
  * "AFTER: ${scoreAfter}" in green color
  * "+${scoreIncrease} POINTS" in bold, celebratory style

KEY STATS (Below scores):
- "${accountsDeleted} Negative Accounts DELETED" with checkmark icon
- "${story.daysToResults} Days to Results" with clock icon

TESTIMONIAL (Bottom Section):
- Short quote: "${story.testimonialText?.substring(0, 120)}..."
- Attribution: "- ${displayName}"

FOOTER (Very Bottom):
- "DisputeForce.ai" website URL
- Small tagline: "AI-Powered Credit Dispute"

**Design Requirements:**
1. Use ${options.style} style as described above
2. Ensure text is highly readable with strong contrast
3. Use professional typography (no comic sans or decorative fonts)
4. Include subtle background patterns or gradients
5. Add icons for stats (checkmarks, arrows, clocks)
6. Make the score increase the focal point (largest text)
7. Use green for positive numbers, red for before scores
8. Add subtle shadows or glows to make text pop
9. Ensure branding is visible but not overwhelming
10. ${options.format === 'instagram-story' ? 'Keep important content in the middle 60% of the image (safe zone)' : 'Center all content with balanced margins'}

**Color Palette:**
- ${options.style === 'modern' ? 'Blue (#3B82F6), Purple (#8B5CF6), White (#FFFFFF)' : ''}
- ${options.style === 'professional' ? 'Navy (#1E3A8A), Gold (#F59E0B), White (#FFFFFF)' : ''}
- ${options.style === 'bold' ? 'Orange (#F97316), Green (#10B981), Yellow (#FBBF24), Black (#000000)' : ''}
- Success Green: #10B981
- Warning Red: #EF4444

Generate the social media graphic now.`;
}

/**
 * Generate all social media formats for a success story
 */
export async function generateAllFormats(
  story: SuccessStory
): Promise<{
  instagramPost: { url: string; fileKey: string };
  instagramStory: { url: string; fileKey: string };
  facebookPost: { url: string; fileKey: string };
}> {
  const [instagramPost, instagramStory, facebookPost] = await Promise.all([
    generateSuccessStoryGraphic(story, { format: 'instagram-post', style: 'modern' }),
    generateSuccessStoryGraphic(story, { format: 'instagram-story', style: 'modern' }),
    generateSuccessStoryGraphic(story, { format: 'facebook-post', style: 'professional' }),
  ]);
  
  return { instagramPost, instagramStory, facebookPost };
}
