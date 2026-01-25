/**
 * Custom Authentication Express Router
 * Handles email/password authentication endpoints for self-hosting
 */

import { Router } from 'express';
import {
  registerUser,
  loginUser,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  resendVerificationEmail,
  getUserFromToken,
  generateToken,
} from './customAuth';
import {
  getGoogleAuthUrl,
  handleGoogleCallback,
} from './googleAuth';
import { getSessionCookieOptions } from './_core/cookies';
import { COOKIE_NAME } from '@shared/const';

const router = Router();

// Get base URL from request
function getBaseUrl(req: any): string {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  return `${protocol}://${host}`;
}

/**
 * POST /api/auth/register
 * Register a new user with email and password
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const baseUrl = getBaseUrl(req);
    
    const result = await registerUser({ 
      name, 
      email, 
      password
    }, baseUrl);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('[Auth Router] Register error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await loginUser({ email, password });
    
    if (result.success && result.token) {
      // Set HTTP-only cookie for security
      res.cookie('auth-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      
      // Also set the session cookie that the existing app expects
      res.cookie('manus-session', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      
      res.json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('[Auth Router] Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * POST /api/auth/logout
 * Logout and clear session
 */
router.post('/logout', (req, res) => {
  const cookieOptions = getSessionCookieOptions(req as any);
  
  const cookiesToClear = [COOKIE_NAME, 'auth-token', 'manus-session', 'app_session_id'];
  
  cookiesToClear.forEach(name => {
    res.cookie(name, '', { ...cookieOptions, expires: new Date(0), maxAge: 0 });
    res.clearCookie(name, cookieOptions);
  });
  
  res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * GET /api/auth/verify-email
 * Verify email with token
 */
router.get('/verify-email', async (req, res) => {
  try {
    const token = req.query.token as string;
    
    const result = await verifyEmail(token);
    
    if (result.success && result.token) {
      // Set auth cookie
      res.cookie('auth-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      
      res.cookie('manus-session', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('[Auth Router] Verify email error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset email
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const baseUrl = getBaseUrl(req);
    
    const result = await requestPasswordReset(email, baseUrl);
    res.json(result);
  } catch (error) {
    console.error('[Auth Router] Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    const result = await resetPassword(token, password);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('[Auth Router] Reset password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * POST /api/auth/resend-verification
 * Resend verification email
 */
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const baseUrl = getBaseUrl(req);
    
    const result = await resendVerificationEmail(email, baseUrl);
    res.json(result);
  } catch (error) {
    console.error('[Auth Router] Resend verification error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * GET /api/auth/me
 * Get current user from token
 */
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies['auth-token'] || req.cookies['manus-session'];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    const user = await getUserFromToken(token);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        role: user.role,
        accountType: user.accountType,
        agencyName: user.agencyName,
      },
    });
  } catch (error) {
    console.error('[Auth Router] Get user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * GET /api/auth/export-data
 * Export all user data (GDPR/CCPA compliance)
 */
router.get('/export-data', async (req, res) => {
  try {
    const token = req.cookies['auth-token'] || req.cookies['manus-session'];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    const user = await getUserFromToken(token);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    
    // Import database to get user data
    const { db } = await import('./db');
    const { users, creditReports, disputeLetters, disputes, userProfiles, auditLogs } = await import('../drizzle/schema');
    const { eq } = await import('drizzle-orm');
    
    // Gather all user data
    const [userData] = await db.select().from(users).where(eq(users.id, user.id));
    const userProfileData = await db.select().from(userProfiles).where(eq(userProfiles.userId, user.id));
    const creditReportsData = await db.select().from(creditReports).where(eq(creditReports.userId, user.id));
    const disputeLettersData = await db.select().from(disputeLetters).where(eq(disputeLetters.userId, user.id));
    const disputesData = await db.select().from(disputes).where(eq(disputes.userId, user.id));
    
    // Try to get audit logs if table exists
    let auditLogsData: any[] = [];
    try {
      auditLogsData = await db.select().from(auditLogs).where(eq(auditLogs.userId, user.id));
    } catch (e) {
      // Audit logs table may not exist yet
    }
    
    // Prepare export data (remove sensitive fields)
    const exportData = {
      exportDate: new Date().toISOString(),
      exportedBy: 'DisputeStrike Data Export',
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        accountType: userData.accountType,
        createdAt: userData.createdAt,
        emailVerified: userData.emailVerified,
      },
      profile: userProfileData[0] || null,
      creditReports: creditReportsData.map(r => ({
        id: r.id,
        bureau: r.bureau,
        uploadedAt: r.uploadedAt,
        // Exclude raw file data for size
      })),
      disputeLetters: disputeLettersData.map(l => ({
        id: l.id,
        bureau: l.bureau,
        round: l.round,
        status: l.status,
        createdAt: l.createdAt,
        content: l.content,
      })),
      disputes: disputesData.map(d => ({
        id: d.id,
        accountName: d.accountName,
        bureau: d.bureau,
        status: d.status,
        createdAt: d.createdAt,
      })),
      activityLogs: auditLogsData.map(a => ({
        action: a.action,
        details: a.details,
        timestamp: a.timestamp,
      })),
    };
    
    // Log the export action
    console.log(`[GDPR] User ${user.id} exported their data`);
    
    // Send as downloadable JSON
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=disputestrike-my-data.json');
    res.send(JSON.stringify(exportData, null, 2));
    
  } catch (error) {
    console.error('[Auth Router] Export data error:', error);
    res.status(500).json({ success: false, message: 'Failed to export data' });
  }
});

/**
 * DELETE /api/auth/delete-account
 * Permanently delete user account and all data (GDPR/CCPA compliance)
 */
router.delete('/delete-account', async (req, res) => {
  try {
    const token = req.cookies['auth-token'] || req.cookies['manus-session'];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    const user = await getUserFromToken(token);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    
    // Import database
    const { db } = await import('./db');
    const { users, creditReports, disputeLetters, disputes, userProfiles, auditLogs } = await import('../drizzle/schema');
    const { eq } = await import('drizzle-orm');
    
    console.log(`[GDPR] User ${user.id} (${user.email}) requested account deletion`);
    
    // Delete all user data in order (foreign key constraints)
    try {
      await db.delete(auditLogs).where(eq(auditLogs.userId, user.id));
    } catch (e) {
      // Audit logs table may not exist
    }
    
    await db.delete(disputeLetters).where(eq(disputeLetters.userId, user.id));
    await db.delete(disputes).where(eq(disputes.userId, user.id));
    await db.delete(creditReports).where(eq(creditReports.userId, user.id));
    await db.delete(userProfiles).where(eq(userProfiles.userId, user.id));
    await db.delete(users).where(eq(users.id, user.id));
    
    console.log(`[GDPR] User ${user.id} account and all data permanently deleted`);
    
    // Clear cookies
    res.clearCookie('auth-token');
    res.clearCookie('manus-session');
    
    res.json({ success: true, message: 'Account and all data permanently deleted' });
    
  } catch (error) {
    console.error('[Auth Router] Delete account error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete account' });
  }
});

/**
 * GET /api/auth/google
 * Redirect to Google OAuth
 */
router.get('/google', (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const redirectUri = `${baseUrl}/api/auth/google/callback`;
    const state = req.query.redirect as string || '/dashboard';
    
    const authUrl = getGoogleAuthUrl(redirectUri, state);
    res.redirect(authUrl);
  } catch (error) {
    console.error('[Auth Router] Google auth error:', error);
    res.redirect('/login?error=google_auth_failed');
  }
});

/**
 * GET /api/auth/google/callback
 * Handle Google OAuth callback
 */
router.get('/google/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    
    if (error) {
      console.error('[Auth Router] Google auth error:', error);
      return res.redirect('/login?error=google_auth_denied');
    }
    
    if (!code || typeof code !== 'string') {
      return res.redirect('/login?error=no_code');
    }
    
    const baseUrl = getBaseUrl(req);
    const redirectUri = `${baseUrl}/api/auth/google/callback`;
    
    const result = await handleGoogleCallback(code, redirectUri);
    
    if (result.success && result.token) {
      // Set HTTP-only cookies
      res.cookie('auth-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      
      res.cookie('manus-session', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      
      // Redirect to intended destination or dashboard
      const redirectTo = (state as string) || '/dashboard';
      
      // If new user, redirect to get-reports to start the flow
      if (result.user?.isNewUser) {
        return res.redirect('/get-reports');
      }
      
      return res.redirect(redirectTo);
    } else {
      console.error('[Auth Router] Google callback failed:', result.message);
      return res.redirect(`/login?error=${encodeURIComponent(result.message)}`);
    }
  } catch (error) {
    console.error('[Auth Router] Google callback error:', error);
    res.redirect('/login?error=google_callback_failed');
  }
});

export default router;
