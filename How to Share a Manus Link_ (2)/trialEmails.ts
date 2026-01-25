 * Trial Email Templates
 * 
 * Email templates for the 7-day trial nurture sequence
 */

export interface TrialEmailData {
  userName: string;
  negativeItemCount: number;
  topRecommendations: Array<{
    accountName: string;
    winProbability: number;
    recommendationReason: string;
  }>;
  trialEndsAt: string;
  daysRemaining: number;
  upgradeUrl: string;
  starterPrice: string;
  professionalPrice: string;
}

export interface WinbackEmailData {
  userName: string;
  specialPrice: string;
  upgradeUrl: string;
}

export interface RoundUnlockedEmailData {
  userName: string;
  roundNumber: number;
  dashboardUrl: string;
}

/**
 * Day 1 Email - Welcome + Credit Analysis Ready
 */
export function getDay1Email(data: TrialEmailData): { subject: string; html: string; text: string } {
  const subject = 'Your Credit Analysis is Ready! 📊';
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Credit Analysis is Ready</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">DisputeStrike</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">AI-Powered Credit Repair</p>
  </div>
  
  <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
    <h2 style="color: #1e293b; margin-top: 0;">Hey ${data.userName}! 👋</h2>
    
    <p>Great news - we've pulled your credit reports from all 3 bureaus and our AI has finished analyzing them.</p>
    
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <strong style="color: #92400e;">We found ${data.negativeItemCount} negative items</strong>
      <p style="margin: 5px 0 0 0; color: #78350f;">These items are hurting your credit score and costing you money.</p>
    </div>
    
    ${data.topRecommendations.length > 0 ? `
    <h3 style="color: #1e293b;">Top Items to Dispute First:</h3>
    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      ${data.topRecommendations.slice(0, 3).map((item, i) => `
        <div style="padding: 15px; ${i > 0 ? 'border-top: 1px solid #e2e8f0;' : ''}">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="color: #1e293b;">${item.accountName}</strong>
            <span style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${item.winProbability}% win rate</span>
          </div>
          <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">${item.recommendationReason}</p>
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.upgradeUrl}" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">View Full Analysis →</a>
    </div>
    
    <p style="color: #64748b; font-size: 14px;">Your trial gives you ${data.daysRemaining} days to explore your credit data. When you're ready to start disputing, upgrade to one of our plans starting at ${data.starterPrice}/month.</p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
    <p>DisputeStrike • AI-Powered Credit Repair</p>
    <p><a href="${data.upgradeUrl}" style="color: #64748b;">Unsubscribe</a></p>
  </div>
</body>
</html>
  `;
  
  const text = `
Hey ${data.userName}!

Great news - we've pulled your credit reports from all 3 bureaus and our AI has finished analyzing them.

We found ${data.negativeItemCount} negative items that are hurting your credit score.
