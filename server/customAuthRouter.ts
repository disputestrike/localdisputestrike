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
    
    const result = await registerUser({ name, email, password }, baseUrl);
    
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
  res.clearCookie('auth-token');
  res.clearCookie('manus-session');
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

export default router;
