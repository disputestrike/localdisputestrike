/**
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

${data.topRecommendations.slice(0, 3).map(item => `
• ${item.accountName} - ${item.winProbability}% win rate
  ${item.recommendationReason}
`).join('')}

View your full analysis: ${data.upgradeUrl}

Your trial gives you ${data.daysRemaining} days to explore your credit data. When you're ready to start disputing, upgrade to one of our plans starting at ${data.starterPrice}/month.

- The DisputeStrike Team
  `;
  
  return { subject, html, text };
}

/**
 * Day 3 Email - Engagement / Did you see these items?
 */
export function getDay3Email(data: TrialEmailData): { subject: string; html: string; text: string } {
  const subject = 'Did you see these items on your report?';
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">DisputeStrike</h1>
  </div>
  
  <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
    <h2 style="color: #1e293b; margin-top: 0;">${data.userName}, did you see these?</h2>
    
    <p>We noticed you haven't started disputing yet. Here's a quick reminder of what our AI found:</p>
    
    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <div style="text-align: center;">
        <span style="font-size: 48px; font-weight: bold; color: #ef4444;">${data.negativeItemCount}</span>
        <p style="margin: 5px 0 0 0; color: #64748b;">Negative Items Found</p>
      </div>
    </div>
    
    <h3 style="color: #1e293b;">Why These Items Matter:</h3>
    <ul style="color: #475569;">
      <li>Each negative item can drop your score by 50-100 points</li>
      <li>Lower scores mean higher interest rates on loans and credit cards</li>
      <li>You could be paying thousands extra per year in interest</li>
    </ul>
    
    <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h4 style="color: #065f46; margin-top: 0;">The Good News</h4>
      <p style="color: #047857; margin-bottom: 0;">Our AI identified items with up to ${Math.max(...data.topRecommendations.map(r => r.winProbability))}% deletion probability. That means there's a strong chance these can be removed from your report.</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.upgradeUrl}" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Start Disputing Now →</a>
    </div>
    
    <p style="color: #64748b; font-size: 14px;">Trial ends in ${data.daysRemaining} days.</p>
  </div>
</body>
</html>
  `;
  
  const text = `
${data.userName}, did you see these?

We noticed you haven't started disputing yet. Here's a quick reminder:

${data.negativeItemCount} Negative Items Found

Why These Items Matter:
• Each negative item can drop your score by 50-100 points
• Lower scores mean higher interest rates
• You could be paying thousands extra per year in interest

The Good News: Our AI identified items with up to ${Math.max(...data.topRecommendations.map(r => r.winProbability))}% deletion probability.

Start Disputing Now: ${data.upgradeUrl}

Trial ends in ${data.daysRemaining} days.

- The DisputeStrike Team
  `;
  
  return { subject, html, text };
}

/**
 * Day 5 Email - Urgency (2 days left)
 */
export function getDay5Email(data: TrialEmailData): { subject: string; html: string; text: string } {
  const subject = 'Your trial ends in 2 days ⏰';
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">⏰ 2 Days Left</h1>
  </div>
  
  <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
    <h2 style="color: #1e293b; margin-top: 0;">${data.userName}, your trial expires on ${data.trialEndsAt}</h2>
    
    <p>After that, you'll lose access to:</p>
    
    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <ul style="margin: 0; padding-left: 20px; color: #475569;">
        <li style="margin-bottom: 10px;">Your credit scores from all 3 bureaus</li>
        <li style="margin-bottom: 10px;">AI analysis of ${data.negativeItemCount} negative items</li>
        <li style="margin-bottom: 10px;">Personalized dispute recommendations</li>
        <li>Credit monitoring alerts</li>
      </ul>
    </div>
    
    <h3 style="color: #1e293b;">Choose Your Plan:</h3>
    
    <div style="display: flex; gap: 15px; margin: 20px 0;">
      <div style="flex: 1; background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center;">
        <h4 style="margin: 0 0 10px 0; color: #1e293b;">Starter</h4>
        <p style="font-size: 24px; font-weight: bold; color: #10b981; margin: 0;">${data.starterPrice}<span style="font-size: 14px; color: #64748b;">/mo</span></p>
        <p style="color: #64748b; font-size: 14px; margin: 10px 0 0 0;">2 dispute rounds</p>
      </div>
      <div style="flex: 1; background: #10b981; border-radius: 8px; padding: 20px; text-align: center;">
        <h4 style="margin: 0 0 10px 0; color: white;">Professional</h4>
        <p style="font-size: 24px; font-weight: bold; color: white; margin: 0;">${data.professionalPrice}<span style="font-size: 14px; color: rgba(255,255,255,0.8);">/mo</span></p>
        <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 10px 0 0 0;">3 dispute rounds</p>
      </div>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.upgradeUrl}" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Upgrade Before It's Too Late →</a>
    </div>
  </div>
</body>
</html>
  `;
  
  const text = `
${data.userName}, your trial expires on ${data.trialEndsAt}

After that, you'll lose access to:
• Your credit scores from all 3 bureaus
• AI analysis of ${data.negativeItemCount} negative items
• Personalized dispute recommendations
• Credit monitoring alerts

Choose Your Plan:
• Starter - ${data.starterPrice}/mo (2 dispute rounds)
• Professional - ${data.professionalPrice}/mo (3 dispute rounds)

Upgrade Before It's Too Late: ${data.upgradeUrl}

- The DisputeStrike Team
  `;
  
  return { subject, html, text };
}

/**
 * Day 6 Email - Final Push (1 day left)
 */
export function getDay6Email(data: TrialEmailData): { subject: string; html: string; text: string } {
  const subject = 'Last chance: Trial ends tomorrow';
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🚨 Last Chance</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Trial ends tomorrow</p>
  </div>
  
  <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
    <h2 style="color: #1e293b; margin-top: 0;">${data.userName}, this is your final reminder</h2>
    
    <p>Tomorrow, your trial access expires. Here's what you'll lose:</p>
    
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0; color: #991b1b;">❌ Access to your credit scores</p>
      <p style="margin: 10px 0 0 0; color: #991b1b;">❌ Your ${data.negativeItemCount} negative items analysis</p>
      <p style="margin: 10px 0 0 0; color: #991b1b;">❌ AI-powered dispute recommendations</p>
      <p style="margin: 10px 0 0 0; color: #991b1b;">❌ Credit monitoring and alerts</p>
    </div>
    
    <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h4 style="color: #065f46; margin-top: 0;">Don't Let These Items Keep Hurting Your Score</h4>
      <p style="color: #047857; margin-bottom: 0;">Every month you wait, these negative items continue to drag down your credit and cost you money in higher interest rates.</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.upgradeUrl}" style="display: inline-block; background: #ef4444; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Upgrade Now - Starting at ${data.starterPrice}/mo →</a>
    </div>
  </div>
</body>
</html>
  `;
  
  const text = `
${data.userName}, this is your final reminder.

Tomorrow, your trial access expires. Here's what you'll lose:

❌ Access to your credit scores
❌ Your ${data.negativeItemCount} negative items analysis
❌ AI-powered dispute recommendations
❌ Credit monitoring and alerts

Don't Let These Items Keep Hurting Your Score

Every month you wait, these negative items continue to drag down your credit and cost you money in higher interest rates.

Upgrade Now - Starting at ${data.starterPrice}/mo: ${data.upgradeUrl}

- The DisputeStrike Team
  `;
  
  return { subject, html, text };
}

/**
 * Day 7 Email - Trial Expired
 */
export function getDay7Email(data: TrialEmailData): { subject: string; html: string; text: string } {
  const subject = 'Your trial has expired';
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #1e293b; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Trial Expired</h1>
  </div>
  
  <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
    <h2 style="color: #1e293b; margin-top: 0;">${data.userName}, your trial has ended</h2>
    
    <p>Your 7-day trial has expired, and your access to DisputeStrike has been paused.</p>
    
    <p>But your credit problems haven't gone away. Those ${data.negativeItemCount} negative items are still on your report, still hurting your score, and still costing you money.</p>
    
    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
      <h3 style="color: #1e293b; margin-top: 0;">Ready to fix your credit?</h3>
      <p style="color: #64748b;">Reactivate your account and start disputing today.</p>
      <a href="${data.upgradeUrl}" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin-top: 10px;">Reactivate for ${data.starterPrice}/mo →</a>
    </div>
    
    <p style="color: #64748b; font-size: 14px;">If you have any questions, just reply to this email. We're here to help.</p>
  </div>
</body>
</html>
  `;
  
  const text = `
${data.userName}, your trial has ended.

Your 7-day trial has expired, and your access to DisputeStrike has been paused.

But your credit problems haven't gone away. Those ${data.negativeItemCount} negative items are still on your report, still hurting your score, and still costing you money.

Ready to fix your credit?

Reactivate your account and start disputing today.

Reactivate for ${data.starterPrice}/mo: ${data.upgradeUrl}

If you have any questions, just reply to this email. We're here to help.

- The DisputeStrike Team
  `;
  
  return { subject, html, text };
}

/**
 * Winback Email (Day 14 after expiration)
 */
export function getWinbackEmail(data: WinbackEmailData): { subject: string; html: string; text: string } {
  const subject = 'We miss you! Come back for $49/mo';
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">We Miss You! 💜</h1>
  </div>
  
  <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
    <h2 style="color: #1e293b; margin-top: 0;">Hey ${data.userName}!</h2>
    
    <p>It's been a couple weeks since your trial ended, and we wanted to check in.</p>
    
    <p>Those negative items on your credit report? They're still there. Still hurting your score. Still costing you money in higher interest rates.</p>
    
    <div style="background: #f5f3ff; border: 2px solid #8b5cf6; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
      <h3 style="color: #5b21b6; margin-top: 0;">Special Offer Just For You</h3>
      <p style="font-size: 36px; font-weight: bold; color: #7c3aed; margin: 10px 0;">${data.specialPrice}</p>
      <p style="color: #6d28d9; margin-bottom: 0;">Come back and start fixing your credit today</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.upgradeUrl}" style="display: inline-block; background: #8b5cf6; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Claim Your Spot →</a>
    </div>
    
    <p style="color: #64748b; font-size: 14px;">This offer won't last forever. Take action now and start improving your credit score.</p>
  </div>
</body>
</html>
  `;
  
  const text = `
Hey ${data.userName}!

It's been a couple weeks since your trial ended, and we wanted to check in.

Those negative items on your credit report? They're still there. Still hurting your score. Still costing you money in higher interest rates.

Special Offer Just For You: ${data.specialPrice}

Come back and start fixing your credit today.

Claim Your Spot: ${data.upgradeUrl}

This offer won't last forever. Take action now and start improving your credit score.

- The DisputeStrike Team
  `;
  
  return { subject, html, text };
}

/**
 * Round Unlocked Email
 */
export function getRoundUnlockedEmail(data: RoundUnlockedEmailData): { subject: string; html: string; text: string } {
  const subject = `Round ${data.roundNumber} is now available! 🎉`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Round ${data.roundNumber} Unlocked!</h1>
  </div>
  
  <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
    <h2 style="color: #1e293b; margin-top: 0;">Great news, ${data.userName}!</h2>
    
    <p>Your 30-day waiting period is over, and Round ${data.roundNumber} of your dispute process is now available.</p>
    
    <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h4 style="color: #065f46; margin-top: 0;">What's Next?</h4>
      <ol style="color: #047857; margin-bottom: 0; padding-left: 20px;">
        <li style="margin-bottom: 10px;">Log in to your dashboard</li>
        <li style="margin-bottom: 10px;">Review AI recommendations for Round ${data.roundNumber}</li>
        <li style="margin-bottom: 10px;">Generate your escalated dispute letters</li>
        <li>Mail your letters and track responses</li>
      </ol>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.dashboardUrl}" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Start Round ${data.roundNumber} →</a>
    </div>
    
    <p style="color: #64748b; font-size: 14px;">Each round builds on the previous one, using escalation tactics to increase pressure on the bureaus. Keep going - you're making progress!</p>
  </div>
</body>
</html>
  `;
  
  const text = `
Great news, ${data.userName}!

Your 30-day waiting period is over, and Round ${data.roundNumber} of your dispute process is now available.

What's Next?
1. Log in to your dashboard
2. Review AI recommendations for Round ${data.roundNumber}
3. Generate your escalated dispute letters
4. Mail your letters and track responses

Start Round ${data.roundNumber}: ${data.dashboardUrl}

Each round builds on the previous one, using escalation tactics to increase pressure on the bureaus. Keep going - you're making progress!

- The DisputeStrike Team
  `;
  
  return { subject, html, text };
}

/**
 * Get email template by type
 */
export function getTrialEmailTemplate(
  type: 'day1' | 'day3' | 'day5' | 'day6' | 'day7',
  data: TrialEmailData
): { subject: string; html: string; text: string } {
  switch (type) {
    case 'day1': return getDay1Email(data);
    case 'day3': return getDay3Email(data);
    case 'day5': return getDay5Email(data);
    case 'day6': return getDay6Email(data);
    case 'day7': return getDay7Email(data);
    default: throw new Error(`Unknown email type: ${type}`);
  }
}
